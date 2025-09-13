import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital is required']
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(date) {
        return date >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    trim: true
  },
  symptoms: {
    type: String,
    trim: true,
    maxlength: [1000, 'Symptoms cannot exceed 1000 characters']
  },
  disease: {
    type: String,
    trim: true,
    maxlength: [200, 'Disease cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ hospital: 1, date: -1 });
appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

// Compound index to prevent double booking
appointmentSchema.index({ 
  patient: 1, 
  date: 1, 
  timeSlot: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: { $in: ['scheduled', 'confirmed'] } }
});

export default mongoose.model('Appointment', appointmentSchema);