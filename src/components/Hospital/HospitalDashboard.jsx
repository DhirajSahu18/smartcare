import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Settings, Plus, Eye } from 'lucide-react';
import { appointmentsAPI, hospitalsAPI } from '../../utils/api';
import { getUser, getUserId } from '../../utils/auth';

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0
  });
  const user = getUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    loadHospitalData();
  };

  const loadHospitalData = async () => {
    try {
      const response = await appointmentsAPI.getAppointments();
      if (response.success) {
        const hospitalAppointments = response.data.appointments;
        setAppointments(hospitalAppointments);
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const todayCount = hospitalAppointments.filter(apt => 
          apt.date.split('T')[0] === today
        ).length;
        const weekCount = hospitalAppointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= startOfWeek && aptDate <= endOfWeek;
        }).length;
        const totalPatients = new Set(hospitalAppointments.map(apt => apt.patient?._id)).size;

        setStats({
          todayAppointments: todayCount,
          weekAppointments: weekCount,
          totalPatients
        });
      }
    } catch (error) {
      console.error('Failed to load hospital data:', error);
    }
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date >= today && apt.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.timeSlot}`);
        const dateB = new Date(`${b.date} ${b.timeSlot}`);
        return dateA - dateB;
      })
      .slice(0, 5);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome back, {user.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-green-600">{stats.weekAppointments}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPatients}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'appointments', label: 'Appointments', icon: Calendar },
            { key: 'slots', label: 'Manage Slots', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            </div>
            <div className="p-6">
              {getUpcomingAppointments().length > 0 ? (
                <div className="space-y-4">
                  {getUpcomingAppointments().map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {appointment.patient?.name || appointment.patientName || 'Patient'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{appointment.timeSlot}</span>
                            </div>
                            {appointment.disease && (
                              <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{appointment.disease}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                  <p className="text-gray-600">Your schedule is currently clear.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'slots' && (
        <SlotManagement hospitalId={user.id} />
      )}
    </div>
  );
};

// Slot Management Component
const SlotManagement = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState({});
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const user = getUser();
  const hospitalId = getUserId();

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedDate && hospitalId) {
      loadSlots();
    }
  }, [selectedDate, hospitalId]);

  const loadSlots = async () => {
    try {
      const response = await hospitalsAPI.getHospitalSlots(hospitalId, selectedDate);
      if (response.success) {
        setSlots(response.data.slots);
      }
    } catch (error) {
      console.error('Failed to load slots:', error);
      setSlots({});
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

  const handleAddSlot = async () => {
    if (newTimeSlot && selectedDate && hospitalId) {
      try {
        await hospitalsAPI.updateHospitalSlot(hospitalId, {
          date: selectedDate,
          timeSlot: newTimeSlot,
          isAvailable: true
        });
        await loadSlots();
        setNewTimeSlot('');
        setShowAddSlot(false);
      } catch (error) {
        console.error('Failed to add slot:', error);
        alert('Failed to add slot. Please try again.');
      }
    }
  };

  const toggleSlotAvailability = async (timeSlot) => {
    if (!hospitalId) return;
    
    try {
      const currentStatus = slots[timeSlot];
      await hospitalsAPI.updateHospitalSlot(hospitalId, {
        date: selectedDate,
        timeSlot,
        isAvailable: !currentStatus
      });
      await loadSlots();
    } catch (error) {
      console.error('Failed to toggle slot:', error);
      alert('Failed to update slot. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Manage Time Slots</h2>
          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Date Selection */}
        <div>
          <label htmlFor="slot-date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <select
            id="slot-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a date</option>
            {getNextFewDays().map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Add New Slot Form */}
        {showAddSlot && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Add New Time Slot</h3>
            <div className="flex space-x-3">
              <input
                type="time"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddSlot}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddSlot(false);
                  setNewTimeSlot('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Existing Slots */}
        {selectedDate && Object.keys(slots).length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Time Slots for {new Date(selectedDate).toLocaleDateString()}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(slots).map(([timeSlot, isAvailable]) => (
                <button
                  key={timeSlot}
                  onClick={() => toggleSlotAvailability(timeSlot)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    isAvailable
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <Clock className="h-3 w-3 inline mr-1" />
                  {timeSlot}
                  <br />
                  <span className="text-xs">
                    {isAvailable ? 'Available' : 'Booked'}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Click on a time slot to toggle its availability
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;