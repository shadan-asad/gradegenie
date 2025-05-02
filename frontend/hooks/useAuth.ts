import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, SignupData, LoginData } from '@/lib/api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signup = async (data: SignupData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.signup(data);
      localStorage.setItem('token', response.token);
      router.push('/dashboard');
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during signup');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login(data);
      localStorage.setItem('token', response.token);
      router.push('/dashboard');
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getMe = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.getMe();
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching user data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signup,
    login,
    logout,
    getMe,
    loading,
    error,
  };
}; 