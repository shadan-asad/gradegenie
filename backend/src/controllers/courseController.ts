import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/Course';
import { Syllabus } from '../models/Syllabus';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IUser } from '../models/User';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: IUser;
}

// Initialize Google AI
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
if (!GOOGLE_AI_API_KEY) {
  logger.error('GOOGLE_AI_API_KEY is not defined in environment variables');
}
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY || '');

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, subject, gradeLevel } = req.body;
    const teacherId = req.user?._id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const course = new Course({
      name,
      description,
      subject,
      gradeLevel,
      teacher: teacherId,
    });

    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
};

export const generateSyllabus = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, additionalInfo, courseDetails } = req.body;
    const teacherId = req.user?._id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('Google AI API key is not configured');
      return res.status(500).json({ 
        message: 'AI service is not properly configured. Please contact the administrator.',
        error: 'API_KEY_MISSING'
      });
    }

    // Format the prompt for Gemini
    const formattedPrompt = `
      Create a comprehensive syllabus for a ${courseDetails.gradeLevel} level ${courseDetails.subject} course.
      
      Course Details:
      - Title: ${courseDetails.name}
      - Description: ${courseDetails.description}
      ${additionalInfo ? `\nAdditional Information: ${additionalInfo}` : ''}
      
      ${prompt}
      
      Return ONLY a JSON object (no markdown formatting, no code blocks) with the following structure:
      {
        "courseTitle": string,
        "instructor": string,
        "term": string,
        "courseDescription": string,
        "learningObjectives": string[],
        "requiredMaterials": Array<{
          "title": string,
          "author": string,
          "publisher": string,
          "year": string,
          "required": boolean
        }>,
        "gradingPolicy": {
          [key: string]: {
            "percentage": number,
            "description": string
          }
        },
        "weeklySchedule": Array<{
          "week": number,
          "topic": string,
          "readings": string,
          "assignments": string
        }>,
        "policies": {
          [key: string]: string
        }
      }
      
      Ensure that:
      1. The grading policy percentages add up to 100%
      2. The weekly schedule covers 15 weeks
      3. Include standard policies for attendance, late work, academic integrity, and accommodations
      4. Learning objectives are clear and measurable
      5. Required materials are realistic and relevant
      6. Return ONLY the JSON object, no additional text or formatting
    `;

    try {
      // Generate syllabus using Google AI
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(formattedPrompt);
      const response = await result.response;
      const generatedText = response.text();

      // Clean the response text to ensure it's valid JSON
      const cleanedText = generatedText
        .replace(/```json\s*/g, '') // Remove ```json prefix
        .replace(/```\s*$/g, '')    // Remove ``` suffix
        .trim();                    // Remove any extra whitespace

      // Parse the generated JSON
      let syllabusData;
      try {
        syllabusData = JSON.parse(cleanedText);
      } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Raw response:', generatedText);
        return res.status(500).json({ 
          message: 'Error parsing AI response',
          error: 'PARSE_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Validate the generated syllabus data
      if (!validateSyllabusData(syllabusData)) {
        return res.status(500).json({ 
          message: 'Invalid syllabus data generated',
          error: 'VALIDATION_ERROR'
        });
      }

      res.status(200).json(syllabusData);
    } catch (error: any) {
      console.error('Error generating syllabus:', error);
      
      // Handle specific API errors
      if (error.status === 403) {
        return res.status(500).json({ 
          message: 'AI service authentication failed. Please check API key configuration.',
          error: 'API_AUTH_ERROR'
        });
      }
      
      return res.status(500).json({ 
        message: 'Error generating syllabus',
        error: 'GENERATION_ERROR',
        details: error.message || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error in generateSyllabus:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
};

// Helper function to validate syllabus data
function validateSyllabusData(data: any): boolean {
  try {
    // Check required fields
    const requiredFields = [
      'courseTitle',
      'instructor',
      'term',
      'courseDescription',
      'learningObjectives',
      'requiredMaterials',
      'gradingPolicy',
      'weeklySchedule',
      'policies'
    ];

    for (const field of requiredFields) {
      if (!data[field]) return false;
    }

    // Validate grading policy percentages
    const totalPercentage = Object.values(data.gradingPolicy).reduce(
      (sum: number, item: any) => sum + item.percentage,
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) return false;

    // Validate weekly schedule
    if (!Array.isArray(data.weeklySchedule) || data.weeklySchedule.length !== 15) return false;

    // Validate required materials
    if (!Array.isArray(data.requiredMaterials)) return false;

    // Validate learning objectives
    if (!Array.isArray(data.learningObjectives)) return false;

    return true;
  } catch (error) {
    console.error('Error validating syllabus data:', error);
    return false;
  }
}

export const updateSyllabus = async (req: AuthRequest, res: Response) => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const teacherId = req.user?._id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const course = await Course.findOne({ _id: courseId, teacher: teacherId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const syllabus = await Syllabus.findOne({ course: courseId });
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    // Update syllabus with new data
    Object.assign(syllabus, req.body);
    await syllabus.save();

    res.json(syllabus);
  } catch (error) {
    console.error('Error updating syllabus:', error);
    res.status(500).json({ message: 'Error updating syllabus' });
  }
};

export const getCourseSyllabus = async (req: AuthRequest, res: Response) => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const teacherId = req.user?._id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const course = await Course.findOne({ _id: courseId, teacher: teacherId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const syllabus = await Syllabus.findOne({ course: courseId });
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    res.json(syllabus);
  } catch (error) {
    console.error('Error getting syllabus:', error);
    res.status(500).json({ message: 'Error getting syllabus' });
  }
}; 