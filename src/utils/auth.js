// Simple auth utility functions
export const AUTH_STORAGE_KEY = 'smartcare_user';

export const saveUser = (user) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
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
  return user?.role || null;
};