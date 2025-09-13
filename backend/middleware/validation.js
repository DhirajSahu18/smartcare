import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Patient registration
  patientRegister: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(6).max(128).required()
  }),

  // Hospital registration
  hospitalRegister: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(6).max(128).required(),
    type: Joi.string().required(),
    address: Joi.string().min(10).max(500).required(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    specialties: Joi.array().items(Joi.string()).optional(),
    diseases: Joi.array().items(Joi.string()).optional()
  }),

  // Login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('patient', 'hospital').required()
  }),

  // Symptom analysis
  symptomAnalysis: Joi.object({
    symptoms: Joi.string().min(10).max(2000).required(),
    urgency: Joi.string().valid('low', 'medium', 'high').optional()
  }),

  // Chat message
  chatMessage: Joi.object({
    message: Joi.string().min(1).max(1000).required(),
    sessionId: Joi.string().optional()
  }),

  // Appointment booking
  appointmentBooking: Joi.object({
    hospitalId: Joi.string().required(),
    date: Joi.date().min('now').required(),
    timeSlot: Joi.string().required(),
    symptoms: Joi.string().max(1000).optional(),
    disease: Joi.string().max(200).optional()
  }),

  // Hospital slot management
  hospitalSlot: Joi.object({
    date: Joi.date().min('now').required(),
    timeSlot: Joi.string().required(),
    isAvailable: Joi.boolean().required()
  })
};