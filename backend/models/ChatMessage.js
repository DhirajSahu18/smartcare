import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  aiSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AISession',
    default: null
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [1, 'Message cannot be empty'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  response: {
    type: String,
    required: [true, 'Response is required'],
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['symptom_inquiry', 'general_health', 'urgent_care', 'follow_up'],
    default: 'general_health'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'urgent'],
    default: 'neutral'
  },
  aiModel: {
    type: String,
    default: 'gemini-pro'
  }
}, {
  timestamps: true
});

// Indexes
chatMessageSchema.index({ patient: 1, createdAt: -1 });
chatMessageSchema.index({ aiSession: 1, createdAt: 1 });
chatMessageSchema.index({ messageType: 1 });
chatMessageSchema.index({ createdAt: -1 });

export default mongoose.model('ChatMessage', chatMessageSchema);