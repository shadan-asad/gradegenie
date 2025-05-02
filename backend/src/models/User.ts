import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  credits: number;
  stripeCustomerId?: string;
  provider?: 'local' | 'google' | 'microsoft';
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'TEACHER', 'STUDENT'],
      default: 'TEACHER',
    },
    credits: {
      type: Number,
      default: 30,
    },
    stripeCustomerId: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'microsoft'],
      default: 'local',
    },
    providerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 