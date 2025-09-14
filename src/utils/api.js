// API utility functions for backend integration
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('smartcare_user') || '{}');
  return user.token;
};

// API request wrapper with auth
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// Hospitals API calls
export const hospitalsAPI = {
  getHospitals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/hospitals${queryString ? `?${queryString}` : ''}`);
  },

  getHospital: async (id) => {
    return apiRequest(`/hospitals/${id}`);
  },

  getHospitalSlots: async (id, date) => {
    return apiRequest(`/hospitals/${id}/slots?date=${date}`);
  },

  updateHospitalSlot: async (id, slotData) => {
    return apiRequest(`/hospitals/${id}/slots`, {
      method: 'POST',
      body: slotData,
    });
  },
};

// Appointments API calls
export const appointmentsAPI = {
  bookAppointment: async (appointmentData) => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: appointmentData,
    });
  },

  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/appointments${queryString ? `?${queryString}` : ''}`);
  },

  getAppointment: async (id) => {
    return apiRequest(`/appointments/${id}`);
  },

  updateAppointment: async (id, updates) => {
    return apiRequest(`/appointments/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  },

  deleteAppointment: async (id) => {
    return apiRequest(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// AI API calls
export const aiAPI = {
  analyzeSymptoms: async (symptoms) => {
    return apiRequest('/ai/analyze', {
      method: 'POST',
      body: { symptoms },
    });
  },

  chatWithAI: async (message, sessionId = null) => {
    return apiRequest('/ai/chat', {
      method: 'POST',
      body: { message, sessionId },
    });
  },

  getAISessions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/ai/sessions${queryString ? `?${queryString}` : ''}`);
  },
};

// Patients API calls
export const patientsAPI = {
  getProfile: async () => {
    return apiRequest('/patients/profile');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/patients/profile', {
      method: 'PATCH',
      body: profileData,
    });
  },

  getDashboard: async () => {
    return apiRequest('/patients/dashboard');
  },
};