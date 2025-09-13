import React from 'react';
import { Heart, User, LogOut, Guitar as Hospital } from 'lucide-react';
import { getUser, logout, getUserRole } from '../../utils/auth';

const Header = ({ onNavigate, currentView }) => {
  const user = getUser();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const handleLogoClick = () => {
    if (user) {
      onNavigate(userRole === 'hospital' ? 'hospital-dashboard' : 'start-care');
    } else {
      onNavigate('landing');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SmartCare</span>
          </button>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {userRole === 'patient' && (
                  <>
                    <button
                      onClick={() => onNavigate('start-care')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentView === 'start-care'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Start Care
                    </button>
                    <button
                      onClick={() => onNavigate('my-appointments')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentView === 'my-appointments'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      My Appointments
                    </button>
                  </>
                )}
                
                {userRole === 'hospital' && (
                  <button
                    onClick={() => onNavigate('hospital-dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'hospital-dashboard'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Dashboard
                  </button>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-2 text-gray-700">
                  {userRole === 'hospital' ? (
                    <Hospital className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;