import mongoose from 'mongoose';

const aiSessionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms are required'],
    trim: true,
    minlength: [10, 'Symptoms must be at least 10 characters'],
    maxlength: [2000, 'Symptoms cannot exceed 2000 characters']
  },
  disease: {
    type: String,
    trim: true,
    maxlength: [200, 'Disease cannot exceed 200 characters']
  },
  specialty: {
    type: String,
    trim: true,
    maxlength: [100, 'Specialty cannot exceed 100 characters']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  guidance: {
    type: String,
    trim: true,
    maxlength: [1000, 'Guidance cannot exceed 1000 characters']
  },
  preventiveMeasures: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each preventive measure cannot exceed 200 characters']
  }],
  confidence: {
    type: Number,
    min: [0, 'Confidence cannot be less than 0'],
    max: [100, 'Confidence cannot be more than 100'],
    default: 75
  },
  aiModel: {
    type: String,
    default: 'gemini-pro'
  },
  sessionId: {
    type: String,
    unique: true,
    default: function() {
      return new mongoose.Types.ObjectId().toString();
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiSessionSchema.index({ patient: 1, createdAt: -1 });
aiSessionSchema.index({ sessionId: 1 });
aiSessionSchema.index({ disease: 1 });
aiSessionSchema.index({ urgency: 1 });
aiSessionSchema.index({ createdAt: -1 });

export default mongoose.model('AISession', aiSessionSchema);