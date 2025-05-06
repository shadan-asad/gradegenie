import axios, { InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export interface SignupData {
  email: string;
  name: string;
  password: string;
  role?: 'TEACHER' | 'STUDENT';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  signup: async (data: SignupData) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  googleAuth: async (token: string) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },

  microsoftAuth: async (token: string) => {
    const response = await api.post('/auth/microsoft', { token });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Course API
export const courseApi = {
  createCourse: async (data: {
    name: string;
    description?: string;
    subject: string;
    gradeLevel: string;
  }) => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create course');
    return response.json();
  },

  getCourses: async () => {
    const response = await fetch(`${API_URL}/courses`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  getCourse: async (courseId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch course');
    return response.json();
  },

  generateSyllabus: async (courseId: string, data: { prompt: string; additionalInfo?: string }) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/syllabus/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to generate syllabus');
    return response.json();
  },

  updateSyllabus: async (courseId: string, data: any) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/syllabus`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update syllabus');
    return response.json();
  },

  getSyllabus: async (courseId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/syllabus`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch syllabus');
    return response.json();
  },
};

export default api; 