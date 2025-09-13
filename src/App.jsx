import React, { useState, useEffect } from 'react';
import { getUser, getUserRole } from './utils/auth';

// Components
import Header from './components/Layout/Header';
import LandingPage from './components/Landing/LandingPage';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import StartCare from './components/Patient/StartCare';
import FindHospitals from './components/Patient/FindHospitals';
import UrgentHelp from './components/Patient/UrgentHelp';
import BookAppointment from './components/Patient/BookAppointment';
import MyAppointments from './components/Patient/MyAppointments';
import HospitalDashboard from './components/Hospital/HospitalDashboard';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [viewData, setViewData] = useState({});

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      const userRole = getUserRole();
      setCurrentView(userRole === 'hospital' ? 'hospital-dashboard' : 'start-care');
    }
  }, []);

  const handleNavigate = (view, data = {}) => {
    setCurrentView(view);
    setViewData(data);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    const userRole = userData.role;
    setCurrentView(userRole === 'hospital' ? 'hospital-dashboard' : 'start-care');
  };

  const handleAnalysisComplete = (analysis) => {
    setViewData(prev => ({ ...prev, analysis }));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      
      case 'login':
        return <LoginForm onNavigate={handleNavigate} onLogin={handleLogin} />;
      
      case 'register':
        return <RegisterForm onNavigate={handleNavigate} onLogin={handleLogin} />;
      
      case 'start-care':
        return (
          <StartCare 
            onNavigate={handleNavigate} 
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      
      case 'find-hospitals':
        return (
          <FindHospitals 
            onNavigate={handleNavigate} 
            analysis={viewData.analysis}
          />
        );
      
      case 'urgent-help':
        return (
          <UrgentHelp 
            onNavigate={handleNavigate} 
            analysis={viewData.analysis}
          />
        );
      
      case 'book-appointment':
        return (
          <BookAppointment 
            onNavigate={handleNavigate} 
            hospital={viewData.hospital}
            analysis={viewData.analysis}
          />
        );
      
      case 'my-appointments':
        return <MyAppointments onNavigate={handleNavigate} />;
      
      case 'hospital-dashboard':
        return <HospitalDashboard onNavigate={handleNavigate} />;
      
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && currentView !== 'landing' && (
        <Header 
          onNavigate={handleNavigate} 
          currentView={currentView}
        />
      )}
      {renderCurrentView()}
    </div>
  );
}

export default App;