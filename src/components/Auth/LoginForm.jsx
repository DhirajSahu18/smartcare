import React, { useState } from 'react';
import { Heart, Mail, Lock, User, Guitar as Hospital } from 'lucide-react';
import { saveUser } from '../../utils/auth';
import { sampleHospitals } from '../../data/hospitals';

const LoginForm = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let user = null;

      if (formData.role === 'hospital') {
        // Find hospital by email
        const hospital = sampleHospitals.find(h => h.email === formData.email);
        if (hospital && formData.password === 'hospital123') {
          user = hospital;
        }
      } else {
        // Patient login - for demo, accept any email with password 'patient123'
        if (formData.password === 'patient123') {
          user = {
            id: 'patient_' + Date.now(),
            name: formData.email.split('@')[0],
            email: formData.email,
            role: 'patient',
            createdAt: new Date()
          };
        }
      }

      if (user) {
        saveUser(user);
        onLogin(user);
      } else {
        setError('Invalid credentials. Try patient123 or hospital123 as password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your SmartCare account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex space-x-4">
            <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.role === 'patient'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="role"
                value="patient"
                checked={formData.role === 'patient'}
                onChange={handleChange}
                className="sr-only"
              />
              <User className="h-5 w-5 mr-2" />
              <span className="font-medium">Patient</span>
            </label>

            <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.role === 'hospital'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="role"
                value="hospital"
                checked={formData.role === 'hospital'}
                onChange={handleChange}
                className="sr-only"
              />
              <Hospital className="h-5 w-5 mr-2" />
              <span className="font-medium">Hospital</span>
            </label>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700 font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>Patient: any email + password "patient123"</p>
              <p>Hospital: hospital email + password "hospital123"</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Register Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;