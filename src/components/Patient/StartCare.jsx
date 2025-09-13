import React, { useState } from 'react';
import { Brain, MapPin, MessageCircle, Loader2, AlertTriangle, Heart, Lightbulb } from 'lucide-react';
import { analyzeSymptoms } from '../../utils/gemini';

const StartCare = ({ onNavigate, onAnalysisComplete }) => {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    
    setLoading(true);
    try {
      const result = await analyzeSymptoms(symptoms);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high':
      case 'emergency':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handleFindHospitals = () => {
    onNavigate('find-hospitals', { analysis });
  };

  const handleUrgentHelp = () => {
    onNavigate('urgent-help', { analysis });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your Care Journey</h1>
        <p className="text-lg text-gray-600">
          Describe your symptoms and get AI-powered analysis and recommendations
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">Medical Disclaimer</p>
            <p className="text-yellow-700">
              This AI analysis is for informational purposes only and does not replace professional medical advice. 
              Always consult with a qualified healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>

      {/* Symptom Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <label htmlFor="symptoms" className="block text-lg font-medium text-gray-900 mb-3">
          Describe your symptoms
        </label>
        <textarea
          id="symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Please describe what you're experiencing in detail. Include when symptoms started, their severity, and any relevant factors..."
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {symptoms.length} characters
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 ${
              !symptoms.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                <span>Analyze Symptoms</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              AI Analysis Results
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Predicted Disease & Urgency */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Predicted Condition</h3>
                <p className="text-2xl font-bold text-blue-600">{analysis.predictedDisease}</p>
                <p className="text-sm text-gray-500">Specialty: {analysis.specialty}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg border font-medium ${getUrgencyColor(analysis.urgencyLevel)}`}>
                Urgency: {analysis.urgencyLevel.charAt(0).toUpperCase() + analysis.urgencyLevel.slice(1)}
              </div>
            </div>

            {/* Care Guidance */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Immediate Care Guidance
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{analysis.careGuidance}</p>
            </div>

            {/* Preventive Measures */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Preventive Measures
              </h3>
              <ul className="space-y-2">
                {analysis.preventiveMeasures.map((measure, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                    <span className="text-gray-700">{measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleFindHospitals}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="h-5 w-5" />
                <span>Find Hospitals</span>
              </button>
              <button
                onClick={handleUrgentHelp}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Urgent Help Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartCare;