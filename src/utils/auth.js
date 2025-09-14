// Updated auth utility functions with backend integration
import { authAPI } from './api.js';

export const AUTH_STORAGE_KEY = 'smartcare_user';

export const saveUser = (userData) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
};

export const getUser = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isLoggedIn = () => {
  return getUser() !== null;
};

export const getUserRole = () => {
  const user = getUser();
  return user?.user?.role || user?.role || null;
};

export const getUserId = () => {
  const user = getUser();
  return user?.user?._id || user?.user?.id || user?.id || null;
};

export const getAuthToken = () => {
  const user = getUser();
  return user?.token || null;
};

// Register user with backend
export const registerUser = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    if (response.success) {
      saveUser(response.data);
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  } catch (error) {
    throw error;
  }
};

// Login user with backend
export const loginUser = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    if (response.success) {
      saveUser(response.data);
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  } catch (error) {
    throw error;
  }
};

// Verify current user session
export const verifyUser = async () => {
  try {
    const response = await authAPI.getMe();
    if (response.success) {
      const currentUser = getUser();
      const updatedUser = {
        ...currentUser,
        user: response.data.user
      };
      saveUser(updatedUser);
      return response.data.user;
    }
    throw new Error('Session invalid');
  } catch (error) {
    logout();
    throw error;
  }
};