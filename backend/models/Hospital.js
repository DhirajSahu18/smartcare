import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [200, 'Hospital name cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    minlength: [10, 'Phone number must be at least 10 characters'],
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    default: 'hospital',
    enum: ['hospital']
  },
  type: {
    type: String,
    required: [true, 'Hospital type is required'],
    enum: [
      'General Hospital',
      'Medical Center', 
      'Specialty Hospital',
      'Children\'s Hospital',
      'Emergency Hospital',
      'Specialty Clinic',
      'Urgent Care',
      'Dermatology Clinic',
      'Eye Care Center',
      'Eye Specialty Hospital',
      'Pulmonary Hospital',
      'Mental Health Center',
      'Mental Health & Neuroscience Institute',
      'Nephrology Center',
      'Oncology Center',
      'Cancer Specialty Hospital',
      'Endocrinology Clinic',
      'Rehabilitation Center',
      'Geriatric Hospital',
      'Infectious Disease Center',
      'Allergy Center',
      'Pain Management',
      'Sleep Medicine',
      'Bariatric Center',
      'Vascular Center',
      'Cosmetic Surgery',
      'ENT Specialty',
      'Wound Care',
      'Family Practice',
      'Sports Medicine',
      'Hormone Clinic',
      'Surgical Center',
      'Cancer Center',
      'Imaging Center',
      'Integrated Care',
      'Trauma Center',
      'Addiction Treatment',
      'Laboratory',
      'Telemedicine',
      'Wellness Center',
      'Precision Medicine',
      'Robotic Surgery',
      'Memory Care',
      'Cardiology Center',
      'Fertility Center',
      'Pediatric Hospital',
      'Pain Institute',
      'Multi-Specialty Hospital',
      'Super Specialty Hospital',
      'Government Medical Institute'
    ]
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  specialties: [{
    type: String,
    trim: true
  }],
  diseases: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 4.0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index for location-based queries
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ email: 1 });
hospitalSchema.index({ specialties: 1 });
hospitalSchema.index({ diseases: 1 });
hospitalSchema.index({ rating: -1 });
hospitalSchema.index({ createdAt: -1 });

// Virtual for latitude
hospitalSchema.virtual('latitude').get(function() {
  return this.location?.coordinates?.[1];
});

// Virtual for longitude
hospitalSchema.virtual('longitude').get(function() {
  return this.location?.coordinates?.[0];
});

// Hash password before saving
hospitalSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
hospitalSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
hospitalSchema.methods.toJSON = function() {
  const hospital = this.toObject({ virtuals: false });
  delete hospital.password;
  return hospital;
};

export default mongoose.model('Hospital', hospitalSchema);