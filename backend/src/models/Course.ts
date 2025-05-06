import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ICourse extends Document {
  name: string;
  description?: string;
  subject: string;
  gradeLevel: string;
  teacher: IUser['_id'];
  assignments: mongoose.Types.ObjectId[];
  syllabus?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    gradeLevel: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignments: [{
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
    }],
    syllabus: {
      type: Schema.Types.ObjectId,
      ref: 'Syllabus',
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model<ICourse>('Course', courseSchema); 