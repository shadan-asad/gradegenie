import express from 'express';
import { createCourse, generateSyllabus, updateSyllabus, getCourseSyllabus } from '../controllers/courseController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Course routes
router.post('/', protect, createCourse);

// Syllabus routes
router.post('/syllabus/generate', protect, generateSyllabus);
router.put('/:courseId/syllabus', protect, updateSyllabus);
router.get('/:courseId/syllabus', protect, getCourseSyllabus);

export default router; 