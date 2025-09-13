// Appointment management utilities
const APPOINTMENTS_STORAGE_KEY = 'smartcare_appointments';
const HOSPITAL_SLOTS_STORAGE_KEY = 'smartcare_hospital_slots';

// Appointment management
export const saveAppointment = (appointment) => {
  const appointments = getAppointments();
  const newAppointment = {
    ...appointment,
    id: Date.now().toString(),
    status: 'scheduled',
    createdAt: new Date()
  };
  
  appointments.push(newAppointment);
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  
  // Mark the slot as unavailable
  markSlotUnavailable(appointment.hospitalId, appointment.date, appointment.timeSlot);
  
  return newAppointment;
};

export const getAppointments = (userId = null, role = null) => {
  const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  const appointments = stored ? JSON.parse(stored) : [];
  
  if (!userId) return appointments;
  
  return appointments.filter(appointment => {
    if (role === 'patient') {
      return appointment.patientId === userId;
    } else if (role === 'hospital') {
      return appointment.hospitalId === userId;
    }
    return true;
  });
};

export const updateAppointment = (appointmentId, updates) => {
  const appointments = getAppointments();
  const index = appointments.findIndex(apt => apt.id === appointmentId);
  
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    return appointments[index];
  }
  
  return null;
};

export const cancelAppointment = (appointmentId) => {
  const appointment = updateAppointment(appointmentId, { status: 'cancelled' });
  
  if (appointment) {
    // Mark the slot as available again
    markSlotAvailable(appointment.hospitalId, appointment.date, appointment.timeSlot);
  }
  
  return appointment;
};

// Hospital slots management
export const getHospitalSlots = (hospitalId, date) => {
  const slots = getAllHospitalSlots();
  const hospitalSlots = slots[hospitalId] || {};
  
  if (date) {
    return hospitalSlots[date] || generateDefaultSlots();
  }
  
  return hospitalSlots;
};

export const getAllHospitalSlots = () => {
  const stored = localStorage.getItem(HOSPITAL_SLOTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const addHospitalSlot = (hospitalId, date, timeSlot, isAvailable = true) => {
  const allSlots = getAllHospitalSlots();
  
  if (!allSlots[hospitalId]) {
    allSlots[hospitalId] = {};
  }
  
  if (!allSlots[hospitalId][date]) {
    allSlots[hospitalId][date] = {};
  }
  
  allSlots[hospitalId][date][timeSlot] = isAvailable;
  localStorage.setItem(HOSPITAL_SLOTS_STORAGE_KEY, JSON.stringify(allSlots));
};

export const markSlotUnavailable = (hospitalId, date, timeSlot) => {
  addHospitalSlot(hospitalId, date, timeSlot, false);
};

export const markSlotAvailable = (hospitalId, date, timeSlot) => {
  addHospitalSlot(hospitalId, date, timeSlot, true);
};

// Generate default time slots for a day
export const generateDefaultSlots = () => {
  const slots = {};
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM'
  ];
  
  timeSlots.forEach(slot => {
    slots[slot] = Math.random() > 0.3; // 70% chance of being available
  });
  
  return slots;
};

// Initialize default slots for all hospitals
export const initializeDefaultSlots = (hospitals) => {
  const allSlots = getAllHospitalSlots();
  const today = new Date();
  
  hospitals.forEach(hospital => {
    if (!allSlots[hospital.id]) {
      allSlots[hospital.id] = {};
      
      // Generate slots for next 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        allSlots[hospital.id][dateStr] = generateDefaultSlots();
      }
    }
  });
  
  localStorage.setItem(HOSPITAL_SLOTS_STORAGE_KEY, JSON.stringify(allSlots));
};