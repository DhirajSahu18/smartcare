// Mock Gemini AI integration for symptom analysis
export const analyzeSymptoms = async (symptoms) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock AI analysis based on common symptoms
  const symptomAnalysis = mockGeminiAnalysis(symptoms.toLowerCase());
  
  return {
    id: Date.now().toString(),
    symptoms,
    predictedDisease: symptomAnalysis.disease,
    specialty: symptomAnalysis.specialty,
    urgencyLevel: symptomAnalysis.urgency,
    careGuidance: symptomAnalysis.guidance,
    preventiveMeasures: symptomAnalysis.preventive,
    createdAt: new Date()
  };
};

export const chatWithAI = async (message, context = null) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: Date.now().toString(),
    type: 'ai',
    content: generateChatResponse(message, context),
    timestamp: new Date()
  };
};

// Mock analysis logic
const mockGeminiAnalysis = (symptoms) => {
  if (symptoms.includes('chest pain') || symptoms.includes('heart')) {
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
  
  if (symptoms.includes('headache') || symptoms.includes('migraine')) {
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
  
  if (symptoms.includes('fever') || symptoms.includes('cold') || symptoms.includes('flu')) {
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
  
  if (symptoms.includes('stomach') || symptoms.includes('nausea') || symptoms.includes('vomiting')) {
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
  
  if (symptoms.includes('back pain') || symptoms.includes('spine')) {
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
  
  if (symptoms.includes('diabetes') || symptoms.includes('blood sugar')) {
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
  
  // Default response for unrecognized symptoms
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
    return "🚨 I understand you're concerned about urgent symptoms. If you're experiencing severe chest pain, difficulty breathing, loss of consciousness, or other life-threatening symptoms, please call 108 (National Emergency Number) or 102 (Ambulance) immediately or go to the nearest emergency room.";
  }
  
  if (msg.includes('chest pain') || msg.includes('heart pain')) {
    return "⚠️ Chest pain can be serious and requires immediate attention. Please call 108 immediately or go to the nearest emergency room. Do not drive yourself - have someone else drive you or call an ambulance.";
  }
  
  if (msg.includes('headache') || msg.includes('head pain')) {
    return "💊 For headaches, try resting in a dark, quiet room and apply a cold compress. Stay hydrated and avoid bright lights. If the headache is severe, sudden, or accompanied by fever, vision changes, or neck stiffness, seek immediate medical attention.";
  }
  
  if (msg.includes('stomach pain') || msg.includes('abdominal pain')) {
    return "🤢 Stomach pain can have various causes. Try to rest and avoid solid foods temporarily. Stay hydrated with clear fluids. If the pain is severe, persistent, or accompanied by fever, vomiting, or blood, please seek medical attention immediately.";
  }
  
  if (msg.includes('fever') || msg.includes('temperature')) {
    return "🌡️ For fever, rest and stay hydrated. You can take paracetamol as directed on the package. If fever is above 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms, consult a doctor immediately.";
  }
  
  if (msg.includes('cough') || msg.includes('cold')) {
    return "🤧 For cough and cold, get plenty of rest, stay hydrated, and consider warm salt water gargles. If cough persists for more than 2 weeks, is accompanied by blood, or you have difficulty breathing, please consult a healthcare provider.";
  }
  
  if (msg.includes('back pain') || msg.includes('spine')) {
    return "🦴 For back pain, try gentle stretching, apply heat or cold therapy, and avoid heavy lifting. Maintain good posture and consider over-the-counter pain relievers. If pain is severe, radiates down your leg, or persists for more than a few days, consult a doctor.";
  }
  
  if (msg.includes('diabetes') || msg.includes('blood sugar')) {
    return "🩺 If you have diabetes concerns, monitor your blood sugar levels regularly, follow your prescribed diet, and take medications as directed. If you experience symptoms like excessive thirst, frequent urination, or blurred vision, consult your doctor immediately.";
  }
  
  if (msg.includes('breathing') || msg.includes('shortness of breath')) {
    return "🫁 Difficulty breathing can be serious. If you're having severe trouble breathing, chest pain, or feel like you're suffocating, call 108 immediately. For mild breathing issues, try to stay calm, sit upright, and breathe slowly.";
  }
  
  if (msg.includes('pain')) {
    return "🩹 I can help you understand your pain symptoms. Can you describe where the pain is located and rate it on a scale of 1-10? Also, let me know if it's sharp, dull, throbbing, or burning. This will help me provide better guidance.";
  }
  
  if (msg.includes('medication') || msg.includes('medicine')) {
    return "💊 While I can provide general information about symptoms and care, I cannot recommend specific medications. Please consult with a healthcare provider for proper medication advice and prescriptions.";
  }
  
  if (msg.includes('appointment') || msg.includes('book')) {
    return "📅 I can help you find appropriate hospitals for your condition. Based on your symptoms, I recommend looking for specialists in the relevant field. Would you like me to show you nearby hospitals?";
  }
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "👋 Hello! I'm here to help you with your health concerns. Please describe your symptoms or what you're experiencing, and I'll provide appropriate guidance and care recommendations.";
  }
  
  if (msg.includes('thank') || msg.includes('thanks')) {
    return "🙏 You're welcome! I'm glad I could help. Remember, if your symptoms worsen or you have any concerns, don't hesitate to consult with a healthcare professional. Stay safe and take care!";
  }
  
  if (context?.disease) {
    return `🏥 Based on your symptoms suggesting ${context.disease}, I recommend seeking care from a ${context.specialty} specialist. The urgency level is ${context.urgencyLevel}. Would you like me to help you find nearby hospitals that specialize in this area?`;
  }
  
  // More specific default response based on common health queries
  if (msg.includes('symptom') || msg.includes('feel') || msg.includes('hurt') || msg.includes('sick')) {
    return "🩺 I understand you're not feeling well. To provide better guidance, could you please describe your specific symptoms? For example, are you experiencing pain, fever, nausea, or other discomfort? The more details you provide, the better I can help you.";
  }
  
  return "🤖 I'm here to help you with your health concerns. Please describe your symptoms or what you're experiencing - for example, any pain, discomfort, fever, or other health issues you're facing. I'll provide appropriate guidance and care recommendations.";
};