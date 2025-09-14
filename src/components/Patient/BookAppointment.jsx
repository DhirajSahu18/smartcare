import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, ArrowLeft, MapPin, Phone } from 'lucide-react';
import { hospitalsAPI, appointmentsAPI } from '../../utils/api';
import { getUser, getUserId } from '../../utils/auth';

const BookAppointment = ({ onNavigate, hospital, analysis }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [hospital]);

  useEffect(() => {
    if (selectedDate && hospital) {
      loadHospitalSlots();
      setSelectedTime(''); // Reset time when date changes
    }
  }, [selectedDate, hospital]);

  const loadHospitalSlots = async () => {
    try {
      const response = await hospitalsAPI.getHospitalSlots(hospital._id, selectedDate);
      if (response.success) {
        setAvailableSlots(response.data.slots);
      }
    } catch (error) {
      console.error('Failed to load hospital slots:', error);
      setAvailableSlots({});
    }
  };

  const getNextFewDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return days;
  };

  const getAvailableTimeSlots = () => {
    return Object.entries(availableSlots)
      .filter(([time, available]) => available)
      .map(([time]) => time);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setLoading(true);
    
    try {
      const appointmentData = {
        hospitalId: hospital._id,
        date: selectedDate,
        timeSlot: selectedTime,
        symptoms: analysis?.symptoms
      };
      
      if (analysis?.predictedDisease) {
        appointmentData.disease = analysis.predictedDisease;
      }
      
      const response = await appointmentsAPI.bookAppointment(appointmentData);
      if (response.success) {
        setAppointment({
          ...appointmentData,
          hospitalName: hospital.name,
          patientName: getUser().user?.name || getUser().name
        });
        setBooked(true);
      } else {
        throw new Error(response.message || 'Failed to book appointment');
      }
      setBooked(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (booked && appointment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-200">
            <div className="flex items-center space-x-2">
              <Check className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-800">Appointment Confirmed!</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{hospital.name}</h3>
              <div className="flex items-start space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">{hospital.address}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{hospital.contact}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium">{appointment.patientName}</span>
                </div>
                {analysis?.predictedDisease && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{analysis.predictedDisease}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Scheduled</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please arrive 15 minutes before your appointment</li>
                <li>• Bring a valid ID and insurance information</li>
                <li>• You can reschedule or cancel from "My Appointments"</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onNavigate('my-appointments')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Appointments
              </button>
              <button
                onClick={() => onNavigate('start-care')}
                className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('find-hospitals')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Hospitals
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
        <p className="text-lg text-gray-600">Schedule your visit with {hospital.name}</p>
      </div>

      {/* Hospital Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">{hospital.name}</h2>
        <div className="flex items-start space-x-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
          <p className="text-sm text-gray-600">{hospital.address}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{hospital.contact}</span>
        </div>
      </div>

      {/* Appointment Booking Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Select Date & Time
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a date</option>
              {getNextFewDays().map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 gap-3">
                {getAvailableTimeSlots().map((timeSlot) => (
                  <button
                    key={timeSlot}
                    onClick={() => setSelectedTime(timeSlot)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedTime === timeSlot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <Clock className="h-3 w-3 inline mr-1" />
                    {timeSlot}
                  </button>
                ))}
              </div>
              
              {getAvailableTimeSlots().length === 0 && (
                <p className="text-sm text-gray-500 italic">No available slots for this date</p>
              )}
            </div>
          )}

          {/* Analysis Info */}
          {analysis && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Visit Reason</h3>
              <p className="text-sm text-blue-800">
                <strong>Condition:</strong> {analysis.predictedDisease}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Specialty:</strong> {analysis.specialty}
              </p>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime || loading}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${
              !selectedDate || !selectedTime || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span>Booking...</span>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                <span>Book Appointment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;