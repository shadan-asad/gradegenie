import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Assignment } from '../models/Assignment';
import { logger } from '../utils/logger';

dotenv.config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gradegenie');
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Assignment.deleteMany({}),
    ]);
    logger.info('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      email: 'admin@gradegenie.com',
      name: 'Admin User',
      password: 'admin123',
      role: 'ADMIN',
      credits: 1000,
    });
    logger.info('Created admin user');

    // Create teacher user
    const teacher = await User.create({
      email: 'teacher@gradegenie.com',
      name: 'John Smith',
      password: 'teacher123',
      role: 'TEACHER',
      credits: 100,
    });
    logger.info('Created teacher user');

    // Create student user
    const student = await User.create({
      email: 'student@gradegenie.com',
      name: 'Jane Doe',
      password: 'student123',
      role: 'STUDENT',
      credits: 30,
    });
    logger.info('Created student user');

    // Create a course
    const course = await Course.create({
      name: 'Introduction to Computer Science',
      description: 'A comprehensive introduction to computer science fundamentals',
      teacher: teacher._id,
    });
    logger.info('Created course');

    // Create an assignment
    const assignment = await Assignment.create({
      title: 'First Programming Assignment',
      description: 'Write a simple program to calculate the factorial of a number',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      course: course._id,
      teacher: teacher._id,
    });
    logger.info('Created assignment');

    // Update course with assignment
    await Course.findByIdAndUpdate(course._id, {
      $push: { assignments: assignment._id },
    });
    logger.info('Updated course with assignment');

    logger.info('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase(); 