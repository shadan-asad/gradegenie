import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IAssignment } from './Assignment';

export interface ISubmission extends Document {
  content: string;
  grade?: number;
  feedback?: string;
  assignment: IAssignment['_id'];
  student: IUser['_id'];
  teacher: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    content: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema); 