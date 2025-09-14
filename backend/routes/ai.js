import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { AISession, ChatMessage } from '../models/index.js';

const router = express.Router();

// Initialize Gemini AI (fallback to mock if no API key)
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('✅ Gemini AI initialized successfully');
  } catch (error) {
    console.warn('⚠️ Gemini AI initialization failed, using mock responses:', error.message);
  }
}

// Mock AI analysis for when Gemini is not available
const mockGeminiAnalysis = (symptoms) => {
  const symptomsLower = symptoms.toLowerCase();
  
  if (symptomsLower.includes('chest pain') || symptomsLower.includes('heart')) {
    return {
      disease: 'Heart Disease',
      specialty: 'Cardiology',
      urgency: 'high',
      guidance: 'Seek immediate medical attention. Chest pain can indicate serious heart conditions.',
      preventive: [
        'Maintain a healthy diet low in saturated fats',
        'Exercise regularly (30 minutes daily)',
        'Quit smoking and limit alcohol',
        'Monitor blood pressure and cholesterol',
        'Manage stress through relaxation techniques'
      ]
    };
  }
  
  if (symptomsLower.includes('headache') || symptomsLower.includes('migraine')) {
    return {
      disease: 'Migraine',
      specialty: 'Neurology',
      urgency: 'medium',
      guidance: 'Rest in a dark, quiet room. Apply cold compress to your head.',
      preventive: [
        'Maintain regular sleep schedule',
        'Stay hydrated throughout the day',
        'Identify and avoid trigger foods',
        'Practice stress management techniques',
        'Consider keeping a headache diary'
      ]
    };
  }
  
  if (symptomsLower.includes('fever') || symptomsLower.includes('cold') || symptomsLower.includes('flu')) {
    return {
      disease: 'Common Cold',
      specialty: 'Family Medicine',
      urgency: 'low',
      guidance: 'Rest, stay hydrated, and monitor symptoms. Over-the-counter medications can help.',
      preventive: [
        'Wash hands frequently with soap',
        'Avoid touching face with unwashed hands',
        'Get adequate sleep (7-9 hours nightly)',
        'Eat immune-boosting foods',
        'Consider annual flu vaccination'
      ]
    };
  }
  
  if (symptomsLower.includes('stomach') || symptomsLower.includes('nausea') || symptomsLower.includes('vomiting')) {
    return {
      disease: 'Gastroenteritis',
      specialty: 'Gastroenterology',
      urgency: 'medium',
      guidance: 'Stay hydrated with clear fluids. Avoid solid foods until symptoms improve.',
      preventive: [
        'Practice good hand hygiene',
        'Avoid contaminated food and water',
        'Cook food thoroughly',
        'Store food at proper temperatures',
        'Consider probiotics for gut health'
      ]
    };
  }
  
  if (symptomsLower.includes('back pain') || symptomsLower.includes('spine')) {
    return {
      disease: 'Back Pain',
      specialty: 'Orthopedics',
      urgency: 'low',
      guidance: 'Apply heat or cold therapy. Gentle stretching may help.',
      preventive: [
        'Maintain good posture while sitting and standing',
        'Use ergonomic furniture and equipment',
        'Exercise regularly to strengthen core muscles',
        'Practice proper lifting techniques',
        'Maintain a healthy weight'
      ]
    };
  }
  
  if (symptomsLower.includes('diabetes') || symptomsLower.includes('blood sugar')) {
    return {
      disease: 'Diabetes',
      specialty: 'Endocrinology',
      urgency: 'high',
      guidance: 'Monitor blood sugar levels closely. Seek medical attention for proper management.',
      preventive: [
        'Follow a balanced, low-sugar diet',
        'Exercise regularly to improve insulin sensitivity',
        'Monitor blood glucose levels as directed',
        'Take medications as prescribed',
        'Maintain regular check-ups with healthcare provider'
      ]
    };
  }
  
  // Default response
  return {
    disease: 'General Health Concern',
    specialty: 'Family Medicine',
    urgency: 'medium',
    guidance: 'Consult with a healthcare provider for proper evaluation of your symptoms.',
    preventive: [
      'Maintain a healthy lifestyle with regular exercise',
      'Eat a balanced diet rich in fruits and vegetables',
      'Get adequate sleep and manage stress',
      'Stay up to date with preventive screenings',
      'Avoid smoking and excessive alcohol consumption'
    ]
  };
};

// Generate contextual chat responses
const generateChatResponse = (message, context) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('emergency') || msg.includes('urgent')) {
    return "I understand you're concerned about urgent symptoms. If you're experiencing severe chest pain, difficulty breathing, loss of consciousness, or other life-threatening symptoms, please call 108 (National Emergency Number) or 102 (Ambulance) immediately or go to the nearest emergency room.";
  }
  
  if (msg.includes('chest pain') || msg.includes('heart pain')) {
    return "Chest pain can be serious and requires immediate attention. Please call 108 immediately or go to the nearest emergency room. Do not drive yourself - have someone else drive you or call an ambulance.";
  }
  
  if (msg.includes('headache') || msg.includes('head pain')) {
    return "For headaches, try resting in a dark, quiet room and apply a cold compress. Stay hydrated and avoid bright lights. If the headache is severe, sudden, or accompanied by fever, vision changes, or neck stiffness, seek immediate medical attention.";
  }
  
  if (msg.includes('stomach pain') || msg.includes('abdominal pain')) {
    return "Stomach pain can have various causes. Try to rest and avoid solid foods temporarily. Stay hydrated with clear fluids. If the pain is severe, persistent, or accompanied by fever, vomiting, or blood, please seek medical attention immediately.";
  }
  
  if (msg.includes('fever') || msg.includes('temperature')) {
    return "For fever, rest and stay hydrated. You can take paracetamol as directed on the package. If fever is above 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms, consult a doctor immediately.";
  }
  
  if (msg.includes('cough') || msg.includes('cold')) {
    return "For cough and cold, get plenty of rest, stay hydrated, and consider warm salt water gargles. If cough persists for more than 2 weeks, is accompanied by blood, or you have difficulty breathing, please consult a healthcare provider.";
  }
  
  if (msg.includes('back pain') || msg.includes('spine')) {
    return "For back pain, try gentle stretching, apply heat or cold therapy, and avoid heavy lifting. Maintain good posture and consider over-the-counter pain relievers. If pain is severe, radiates down your leg, or persists for more than a few days, consult a doctor.";
  }
  
  if (msg.includes('diabetes') || msg.includes('blood sugar')) {
    return "If you have diabetes concerns, monitor your blood sugar levels regularly, follow your prescribed diet, and take medications as directed. If you experience symptoms like excessive thirst, frequent urination, or blurred vision, consult your doctor immediately.";
  }
  
  if (msg.includes('breathing') || msg.includes('shortness of breath')) {
    return "Difficulty breathing can be serious. If you're having severe trouble breathing, chest pain, or feel like you're suffocating, call 108 immediately. For mild breathing issues, try to stay calm, sit upright, and breathe slowly.";
  }
  
  if (msg.includes('pain')) {
    return "I can help you understand your pain symptoms. Can you describe where the pain is located and rate it on a scale of 1-10? Also, let me know if it's sharp, dull, throbbing, or burning. This will help me provide better guidance.";
  }
  
  if (msg.includes('medication') || msg.includes('medicine')) {
    return "While I can provide general information about symptoms and care, I cannot recommend specific medications. Please consult with a healthcare provider for proper medication advice and prescriptions.";
  }
  
  if (msg.includes('appointment') || msg.includes('book')) {
    return "I can help you find appropriate hospitals for your condition. Based on your symptoms, I recommend looking for specialists in the relevant field. Would you like me to show you nearby hospitals?";
  }
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! I'm here to help you with your health concerns. Please describe your symptoms or what you're experiencing, and I'll provide appropriate guidance and care recommendations.";
  }
  
  if (msg.includes('thank') || msg.includes('thanks')) {
    return "You're welcome! I'm glad I could help. Remember, if your symptoms worsen or you have any concerns, don't hesitate to consult with a healthcare professional. Stay safe and take care!";
  }
  
  if (context?.disease) {
    return `Based on your symptoms suggesting ${context.disease}, I recommend seeking care from a ${context.specialty} specialist. The urgency level is ${context.urgencyLevel}. Would you like me to help you find nearby hospitals that specialize in this area?`;
  }
  
  // More specific default response based on common health queries
  if (msg.includes('symptom') || msg.includes('feel') || msg.includes('hurt') || msg.includes('sick')) {
    return "I understand you're not feeling well. To provide better guidance, could you please describe your specific symptoms? For example, are you experiencing pain, fever, nausea, or other discomfort? The more details you provide, the better I can help you.";
  }
  
  return "I'm here to help you with your health concerns. Please describe your symptoms or what you're experiencing - for example, any pain, discomfort, fever, or other health issues you're facing. I'll provide appropriate guidance and care recommendations.";
};

// @route   POST /api/ai/analyze
// @desc    Analyze symptoms using AI
// @access  Private (Patient only)
router.post('/analyze', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || symptoms.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide detailed symptoms (at least 10 characters)'
      });
    }

    let analysis;

    // Try to use real Gemini AI first
    if (model) {
      try {
        const prompt = `
          As a medical AI assistant, analyze these symptoms and provide a structured response.
          
          Symptoms: "${symptoms}"
          
          Please respond with a JSON object containing:
          - disease: Most likely condition name
          - specialty: Medical specialty that should handle this
          - urgency: "low", "medium", or "high"
          - guidance: Immediate care advice (2-3 sentences)
          - preventive: Array of 5 preventive measures
          
          Important: This is for educational purposes only and should not replace professional medical advice.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Try to parse JSON from response
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.warn('Failed to parse Gemini response, using mock analysis');
          analysis = mockGeminiAnalysis(symptoms);
        }
      } catch (geminiError) {
        console.warn('Gemini API error, using mock analysis:', geminiError.message);
        analysis = mockGeminiAnalysis(symptoms);
      }
    } else {
      // Use mock analysis
      analysis = mockGeminiAnalysis(symptoms);
    }

    // Save analysis to database
    const aiSession = new AISession({
      patient: req.user._id,
      symptoms,
      disease: analysis.disease,
      specialty: analysis.specialty,
      urgency: analysis.urgency,
      guidance: analysis.guidance,
      preventiveMeasures: analysis.preventive,
      confidence: 75,
      aiModel: 'gemini-pro'
    });

    await aiSession.save();

    res.json({
      success: true,
      message: 'Symptoms analyzed successfully',
      data: {
        analysis: {
          id: aiSession._id,
          symptoms: aiSession.symptoms,
          predictedDisease: aiSession.disease,
          specialty: aiSession.specialty,
          urgencyLevel: aiSession.urgency,
          careGuidance: aiSession.guidance,
          preventiveMeasures: aiSession.preventiveMeasures,
          createdAt: aiSession.createdAt
        }
      }
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during symptom analysis'
    });
  }
});

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
// @access  Private (Patient only)
router.post('/chat', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    let context = null;
    
    // Get context from previous analysis if sessionId provided
    if (sessionId) {
      const session = await AISession.findOne({
        _id: sessionId,
        patient: req.user._id
      });
      
      if (session) {
        context = {
          disease: session.disease,
          specialty: session.specialty,
          urgencyLevel: session.urgency
        };
      }
    }

    let response;

    // Try to use real Gemini AI first
    if (model) {
      try {
        let prompt = `
          You are a helpful medical AI assistant. Respond to this patient message in a caring, informative way.
          
          Patient message: "${message}"
        `;
        
        if (context) {
          prompt += `
          
          Context from previous analysis:
          - Condition: ${context.disease}
          - Specialty: ${context.specialty}
          - Urgency: ${context.urgencyLevel}
          `;
        }
        
        prompt += `
        
        Guidelines:
        - Be empathetic and supportive
        - Provide helpful general information
        - Always recommend consulting healthcare professionals for diagnosis
        - If symptoms seem urgent, advise seeking immediate medical attention
        - Keep responses concise (2-3 sentences)
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        response = aiResponse.text();
      } catch (geminiError) {
        console.warn('Gemini chat error, using mock response:', geminiError.message);
        response = generateChatResponse(message, context);
      }
    } else {
      // Use mock response
      response = generateChatResponse(message, context);
    }

    // Save chat message to database
    const chatMessage = new ChatMessage({
      patient: req.user._id,
      aiSession: sessionId || null,
      message,
      response,
      messageType: 'general_health',
      sentiment: 'neutral',
      aiModel: 'gemini-pro'
    });

    await chatMessage.save();

    res.json({
      success: true,
      data: {
        message: {
          id: chatMessage._id,
          type: 'ai',
          content: response,
          timestamp: chatMessage.createdAt
        }
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during chat'
    });
  }
});

// @route   GET /api/ai/sessions
// @desc    Get user's AI analysis sessions
// @access  Private (Patient only)
router.get('/sessions', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const sessions = await AISession.find({ patient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: {
        sessions,
        total: sessions.length
      }
    });

  } catch (error) {
    console.error('Get AI sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching AI sessions'
    });
  }
});

export default router;