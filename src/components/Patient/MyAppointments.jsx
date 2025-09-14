import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Edit3, X, CheckCircle, AlertCircle } from 'lucide-react';
import { appointmentsAPI } from '../../utils/api';

const MyAppointments = ({ onNavigate }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    loadAppointmentsFromAPI();
  };

  const loadAppointmentsFromAPI = async () => {
    try {
      const response = await appointmentsAPI.getAppointments();
      if (response.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await appointmentsAPI.updateAppointment(appointmentId, { status: 'cancelled' });
      if (response.success) {
        loadAppointments();
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    const hospital = appointment.hospital;
    onNavigate('book-appointment', { hospital, isReschedule: true });
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);

      if (activeTab === 'upcoming') {
        return apt.status === 'scheduled' && aptDate >= today;
      } else if (activeTab === 'past') {
        return apt.status === 'completed' || aptDate < today;
      } else if (activeTab === 'cancelled') {
        return apt.status === 'cancelled';
      }
      return true;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-lg text-gray-600">Manage your healthcare appointments</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {getFilteredAppointments().length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const hospital = appointment.hospital;
            
            return (
              <div key={appointment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {hospital?.name || appointment.hospitalName || 'Hospital'}
                      </h3>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{appointment.timeSlot}</span>
                    </div>

                    {hospital && (
                      <>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{hospital.address}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{hospital.phone}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Condition Info */}
                  {appointment.disease && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm">
                        <span className="font-medium text-blue-900">Condition:</span>{' '}
                        <span className="text-blue-800">{appointment.disease}</span>
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {appointment.status === 'scheduled' && (
                    <div className="flex space-x-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleRescheduleAppointment(appointment)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab} appointments
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming appointments scheduled."
              : `No ${activeTab} appointments found.`
            }
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={() => onNavigate('start-care')}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book New Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;