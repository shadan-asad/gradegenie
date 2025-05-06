import mongoose, { Document, Schema } from 'mongoose';
import { ICourse } from './Course';

export interface ISyllabus extends Document {
  course: ICourse['_id'];
  courseTitle: string;
  instructor: string;
  term: string;
  courseDescription: string;
  learningObjectives: string[];
  requiredMaterials: {
    title: string;
    author: string;
    publisher: string;
    year: string;
    required: boolean;
  }[];
  gradingPolicy: {
    [key: string]: {
      percentage: number;
      description: string;
    };
  };
  weeklySchedule: {
    week: number;
    topic: string;
    readings: string;
    assignments: string;
  }[];
  policies: {
    [key: string]: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const syllabusSchema = new Schema<ISyllabus>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
      required: true,
    },
    learningObjectives: [{
      type: String,
      required: true,
    }],
    requiredMaterials: [{
      title: {
        type: String,
        required: true,
      },
      author: {
        type: String,
        required: true,
      },
      publisher: {
        type: String,
        required: true,
      },
      year: {
        type: String,
        required: true,
      },
      required: {
        type: Boolean,
        default: true,
      },
    }],
    gradingPolicy: {
      type: Map,
      of: {
        percentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        description: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    weeklySchedule: [{
      week: {
        type: Number,
        required: true,
      },
      topic: {
        type: String,
        required: true,
      },
      readings: {
        type: String,
        required: true,
      },
      assignments: {
        type: String,
        required: true,
      },
    }],
    policies: {
      type: Map,
      of: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Syllabus = mongoose.model<ISyllabus>('Syllabus', syllabusSchema); 