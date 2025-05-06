import { useState, useEffect } from 'react';
import { courseApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  submissions: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  completed: string;
  grade: string;
}

interface Reference {
  id: string;
  title: string;
  type: 'Document' | 'Link' | 'Text';
  added: string;
  usedIn: string;
  url?: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  subject: string;
  gradeLevel: string;
  createdAt: string;
  updatedAt: string;
  students: Student[];
  assignments: Assignment[];
  gradingReferences: Reference[];
}

interface Syllabus {
  courseTitle: string;
  courseDescription: string;
  learningObjectives: string[];
  requiredMaterials: Array<{
    title: string;
    author: string;
    publisher: string;
    year: string;
    required: boolean;
  }>;
  gradingPolicy: Record<string, { percentage: number; description: string }>;
  weeklySchedule: Array<{
    week: number;
    topic: string;
    readings: string;
    assignments: string;
  }>;
  policies: Record<string, string>;
}

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseData = await courseApi.getCourse(courseId);
        setCourse(courseData);

        if (courseData.syllabus) {
          const syllabusData = await courseApi.getSyllabus(courseId);
          setSyllabus(syllabusData);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, toast]);

  const generateSyllabus = async (prompt: string) => {
    try {
      const syllabusData = await courseApi.generateSyllabus(courseId, { prompt });
      setSyllabus(syllabusData);
      toast({
        title: "Success",
        description: "Syllabus generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate syllabus",
        variant: "destructive",
      });
    }
  };

  const updateSyllabus = async (syllabusData: Syllabus) => {
    try {
      const updatedSyllabus = await courseApi.updateSyllabus(courseId, syllabusData);
      setSyllabus(updatedSyllabus);
      toast({
        title: "Success",
        description: "Syllabus updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update syllabus",
        variant: "destructive",
      });
    }
  };

  return {
    course,
    syllabus,
    loading,
    generateSyllabus,
    updateSyllabus,
  };
} 