import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { hospitalsAPI } from '../../utils/api';

const UrgentHelp = ({ onNavigate, analysis }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyHospitals, setEmergencyHospitals] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize chat with context from analysis
    const welcomeMessage = {
      id: 'welcome',
      type: 'ai',
      content: analysis 
        ? `👋 Hello! I understand you're experiencing symptoms related to ${analysis.predictedDisease}. I'm here to provide guidance and support. How can I help you right now?`
        : "👋 Hello! I'm your urgent care assistant. I'm here to help you with immediate medical concerns. Please describe what you're experiencing.",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Debug log to check analysis structure
    console.log('Analysis object in UrgentHelp:', analysis);
  }, [analysis]);

  useEffect(() => {
    // Load emergency hospitals
    loadEmergencyHospitals();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadEmergencyHospitals = async () => {
    try {
      const response = await hospitalsAPI.getHospitals({
        specialty: 'Emergency Medicine',
        limit: 3
      });
      if (response.success) {
        setEmergencyHospitals(response.data.hospitals);
      } else {
        // Load sample emergency hospitals
        const sampleEmergencyHospitals = [
          {
            _id: '1',
            name: 'Lilavati Hospital Emergency',
            address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
            phone: '+91-22-2675-1000'
          },
          {
            _id: '2', 
            name: 'Kokilaben Hospital Emergency',
            address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053',
            phone: '+91-22-4269-6969'
          },
          {
            _id: '3',
            name: 'Hinduja Hospital Emergency',
            address: 'Veer Savarkar Marg, Mahim, Mumbai, Maharashtra 400016', 
            phone: '+91-22-4510-8888'
          }
        ];
        setEmergencyHospitals(sampleEmergencyHospitals);
      }
    } catch (error) {
      console.error('Failed to load emergency hospitals:', error);
      // Load sample emergency hospitals as fallback
      const sampleEmergencyHospitals = [
        {
          _id: '1',
          name: 'Lilavati Hospital Emergency',
          address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
          phone: '+91-22-2675-1000'
        },
        {
          _id: '2', 
          name: 'Kokilaben Hospital Emergency',
          address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053',
          phone: '+91-22-4269-6969'
        },
        {
          _id: '3',
          name: 'Hinduja Hospital Emergency',
          address: 'Veer Savarkar Marg, Mahim, Mumbai, Maharashtra 400016', 
          phone: '+91-22-4510-8888'
        }
      ];
      setEmergencyHospitals(sampleEmergencyHospitals);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Direct Gemini API call
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smartcare_user') ? JSON.parse(localStorage.getItem('smartcare_user')).token : ''}`
        },
        body: JSON.stringify({
          message: inputMessage
        })
      });
      
      const data = await response.json();
      
      if (response.success) {
        const aiMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: data.data.message.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'API call failed');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      // Simple fallback message
      const errorMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again or contact emergency services if this is urgent.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown renderer
  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFindHospitals = () => {
    onNavigate('find-hospitals', { analysis });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Urgent Help Chat</h1>
        <p className="text-lg text-gray-600">
          Get immediate guidance from our AI medical assistant
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-800 mb-1">Emergency Situations</p>
            <p className="text-red-700">
              If you're experiencing severe chest pain, difficulty breathing, loss of consciousness, 
              severe bleeding, or other life-threatening symptoms, call 108 (National Emergency Number) 
              or 102 (Ambulance) immediately or go to the nearest emergency room.
            </p>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors">
            📞 Call 108
          </button>
          <button 
            onClick={handleFindHospitals}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            🏥 Find Emergency Rooms
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-green-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: message.type === 'ai' ? renderMarkdown(message.content) : message.content 
                    }}
                  />
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex space-x-2 max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                !inputMessage.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Nearby Emergency Hospitals */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Emergency Hospitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyHospitals.map((hospital) => (
            <div key={hospital._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{hospital.name}</h3>
              <div className="flex items-start space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{hospital.address}</p>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{hospital.phone}</span>
              </div>
              <button
                onClick={() => onNavigate('book-appointment', { hospital, analysis })}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
              >
                Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
          id: Date.now().toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      // Fallback to local response on error
      const aiResponse = generateLocalChatResponse(inputMessage, analysis);
      const errorMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFindHospitals = () => {
    onNavigate('find-hospitals', { analysis });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Local chat response generator with better logic
  const generateLocalChatResponse = (message, analysisContext) => {
    const msg = message.toLowerCase();
    
    // Emergency responses
    if (msg.includes('emergency') || msg.includes('urgent') || msg.includes('severe') || msg.includes('can\'t breathe') || msg.includes('chest pain')) {
      return "🚨 This sounds like it could be an emergency! If you're experiencing severe symptoms like chest pain, difficulty breathing, or loss of consciousness, please call 108 (National Emergency) or 102 (Ambulance) immediately or go to the nearest emergency room. Don't wait!";
    }
    
    // Context-aware responses based on analysis
    if (analysisContext?.predictedDisease) {
      const disease = analysisContext.predictedDisease.toLowerCase();
      
      if (msg.includes('pain') || msg.includes('hurt')) {
        if (disease.includes('heart')) {
          return "💔 Given your heart-related symptoms, any chest pain should be taken seriously. If the pain is severe, radiating to your arm, jaw, or back, or accompanied by shortness of breath, call 108 immediately. For mild discomfort, rest and avoid physical exertion until you can see a doctor.";
        } else if (disease.includes('migraine') || disease.includes('headache')) {
          return "🤕 For your headache/migraine symptoms, try resting in a dark, quiet room. Apply a cold compress to your forehead. Stay hydrated and avoid bright lights. If this is the worst headache of your life or accompanied by fever, vision changes, or neck stiffness, seek immediate medical attention.";
        }
        return `😣 I understand you're experiencing pain related to ${analysisContext.predictedDisease}. ${analysisContext.careGuidance || 'Please monitor your symptoms and consult a healthcare provider if they worsen.'}`;
      }
      
      if (msg.includes('medication') || msg.includes('medicine') || msg.includes('treatment')) {
        return `💊 For ${analysisContext.predictedDisease}, I cannot recommend specific medications as I'm not a doctor. However, I suggest consulting with a ${analysisContext.specialty} specialist who can prescribe appropriate treatment. In the meantime, follow the care guidance: ${analysisContext.careGuidance}`;
      }
      
      if (msg.includes('hospital') || msg.includes('doctor') || msg.includes('appointment')) {
        return `🏥 Based on your ${analysisContext.predictedDisease} symptoms, I recommend seeing a ${analysisContext.specialty} specialist. The urgency level is ${analysisContext.urgencyLevel}. Would you like me to help you find nearby hospitals that specialize in ${analysisContext.specialty}?`;
      }
      
      if (msg.includes('worried') || msg.includes('scared') || msg.includes('anxious')) {
        return `🤗 I understand you're concerned about your ${analysisContext.predictedDisease} symptoms. It's natural to feel worried about health issues. Based on the analysis, your urgency level is ${analysisContext.urgencyLevel}. ${analysisContext.careGuidance} Remember, early medical attention is often the best approach.`;
      }
    }
    
    // Symptom-specific responses
    if (msg.includes('fever') || msg.includes('temperature')) {
      return "🌡️ For fever, rest and stay hydrated with plenty of fluids. You can take paracetamol as directed on the package. Monitor your temperature regularly. If fever exceeds 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms like difficulty breathing, seek immediate medical attention.";
    }
    
    if (msg.includes('cough') || msg.includes('cold')) {
      return "🤧 For cough and cold symptoms, get plenty of rest and stay hydrated. Warm salt water gargles can help soothe your throat. Honey can also help with cough (not for children under 1 year). If cough persists for more than 2 weeks, produces blood, or you have difficulty breathing, consult a healthcare provider.";
    }
    
    if (msg.includes('stomach') || msg.includes('nausea') || msg.includes('vomiting')) {
      return "🤢 For stomach issues, try to rest and avoid solid foods temporarily. Stay hydrated with clear fluids like water, clear broths, or oral rehydration solutions. The BRAT diet (bananas, rice, applesauce, toast) can help. If you have severe abdominal pain, persistent vomiting, or signs of dehydration, seek medical attention.";
    }
    
    if (msg.includes('headache') || msg.includes('head pain')) {
      return "🤕 For headaches, try resting in a dark, quiet room and apply a cold or warm compress to your head or neck. Stay hydrated and consider over-the-counter pain relievers if appropriate. If this is a sudden, severe headache unlike any you've had before, or if accompanied by fever, vision changes, or neck stiffness, seek immediate medical care.";
    }
    
    if (msg.includes('breathing') || msg.includes('shortness of breath')) {
      return "🫁 Difficulty breathing can be serious. If you're having severe trouble breathing, chest pain, or feel like you're suffocating, call 108 immediately. For mild breathing issues, try to stay calm, sit upright, and breathe slowly. Avoid triggers like smoke or allergens.";
    }
    
    // General supportive responses
    if (msg.includes('thank') || msg.includes('thanks')) {
      return "🙏 You're very welcome! I'm glad I could help. Remember, if your symptoms worsen or you have any concerns, don't hesitate to consult with a healthcare professional. Your health and well-being are important. Take care!";
    }
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "👋 Hello! I'm here to help you with your health concerns and provide guidance. Please tell me more about what you're experiencing, and I'll do my best to provide helpful information and recommendations.";
    }
    
    // Default contextual response
    if (analysisContext?.predictedDisease) {
      return `🩺 I'm here to help with your ${analysisContext.predictedDisease} symptoms. Based on the analysis, you should focus on: ${analysisContext.careGuidance} Is there something specific about your symptoms you'd like to discuss?`;
    }
    
    // Fallback response
    return "🤖 I'm here to help you with your health concerns. Could you please be more specific about your symptoms or what you're experiencing? For example, are you feeling pain, discomfort, fever, or other symptoms? The more details you provide, the better I can assist you.";
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Urgent Help Chat</h1>
        <p className="text-lg text-gray-600">
          Get immediate guidance from our AI medical assistant
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-800 mb-1">Emergency Situations</p>
            <p className="text-red-700">
              If you're experiencing severe chest pain, difficulty breathing, loss of consciousness, 
              severe bleeding, or other life-threatening symptoms, call 108 (National Emergency Number) 
              or 102 (Ambulance) immediately or go to the nearest emergency room.
            </p>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors">
            📞 Call 108
          </button>
          <button 
            onClick={handleFindHospitals}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            🏥 Find Emergency Rooms
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-green-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex space-x-2 max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                !inputMessage.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Nearby Emergency Hospitals */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Emergency Hospitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyHospitals.map((hospital) => (
            <div key={hospital._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{hospital.name}</h3>
              <div className="flex items-start space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{hospital.address}</p>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{hospital.phone}</span>
              </div>
              <button
                onClick={() => onNavigate('book-appointment', { hospital, analysis })}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
              >
                Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UrgentHelp;