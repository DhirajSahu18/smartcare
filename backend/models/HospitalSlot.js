import mongoose from 'mongoose';

const hospitalSlotSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(date) {
        return date >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Slot date cannot be in the past'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maxAppointments: {
    type: Number,
    default: 1,
    min: [1, 'Max appointments must be at least 1']
  },
  currentAppointments: {
    type: Number,
    default: 0,
    min: [0, 'Current appointments cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes
hospitalSlotSchema.index({ hospital: 1, date: 1, timeSlot: 1 }, { unique: true });
hospitalSlotSchema.index({ hospital: 1, date: 1 });
hospitalSlotSchema.index({ date: 1 });
hospitalSlotSchema.index({ isAvailable: 1 });

// Virtual to check if slot is actually available
hospitalSlotSchema.virtual('actuallyAvailable').get(function() {
  return this.isAvailable && this.currentAppointments < this.maxAppointments;
});

export default mongoose.model('HospitalSlot', hospitalSlotSchema);