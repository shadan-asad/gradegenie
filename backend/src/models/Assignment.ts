import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ICourse } from './Course';

export interface IAssignment extends Document {
  title: string;
  description: string;
  dueDate?: Date;
  course: ICourse['_id'];
  teacher: IUser['_id'];
  submissions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submissions: [{
      type: Schema.Types.ObjectId,
      ref: 'Submission',
    }],
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema); 