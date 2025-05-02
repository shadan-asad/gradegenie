import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';
import { OAuth2Client } from 'google-auth-library';
import { Client } from '@microsoft/microsoft-graph-client';

// Initialize OAuth clients
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', options);
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, name, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'TEACHER',
      credits: 30, // Initial credits for trial
      provider: 'local',
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      token,
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }) as IUser;
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    // Get user info using the access token
    const ticket = await googleClient.getTokenInfo(token);
    const { email, sub: providerId } = ticket;

    if (!email) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    // Get user profile using Google OAuth2 API
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: token });
    const userInfoResponse = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    const userData = userInfoResponse.data as { name?: string };
    const name = userData.name || email.split('@')[0];

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        provider: 'google',
        providerId,
        role: 'TEACHER',
        credits: 30,
      });
    } else if (user.provider !== 'google') {
      // Update existing user to use Google auth
      user.provider = 'google';
      user.providerId = providerId;
      await user.save();
    }

    // Generate token
    const authToken = generateToken(user._id.toString());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      token: authToken,
    });
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(500).json({ message: 'Error authenticating with Google' });
  }
};

// @desc    Microsoft OAuth login/signup
// @route   POST /api/auth/microsoft
// @access  Public
export const microsoftAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    // Initialize Microsoft Graph client
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });

    // Get user info from Microsoft Graph
    const userInfo = await client.api('/me').get();
    const { mail: email, displayName: name, id: providerId } = userInfo;

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        provider: 'microsoft',
        providerId,
        role: 'TEACHER',
        credits: 30,
      });
    } else if (user.provider !== 'microsoft') {
      // Update existing user to use Microsoft auth
      user.provider = 'microsoft';
      user.providerId = providerId;
      await user.save();
    }

    // Generate token
    const authToken = generateToken(user._id.toString());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      token: authToken,
    });
  } catch (error) {
    logger.error('Microsoft auth error:', error);
    res.status(500).json({ message: 'Error authenticating with Microsoft' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id).select('-password');
    res.json(user);
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({ message: 'Error getting user data' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // In a real application, you would:
    // 1. Save the reset token to the user
    // 2. Send an email with the reset link
    // For now, we'll just return the token
    res.json({ message: 'Password reset email sent', resetToken });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}; 