import React, { useState, useEffect } from 'react';
import { MapPin, Star, Phone, Navigation, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { sampleHospitals } from '../../data/hospitals';
import { getUserLocation, calculateDistance, getDefaultLocation } from '../../utils/location';

const FindHospitals = ({ onNavigate, analysis }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');

  useEffect(() => {
    initializeHospitals();
  }, []);

  const initializeHospitals = async () => {
    try {
      // Get user location
      let location;
      try {
        location = await getUserLocation();
        setLocationError(false);
      } catch (error) {
        console.warn('Could not get user location, using default:', error);
        location = getDefaultLocation();
        setLocationError(true);
      }
      
      setUserLocation(location);
      
      // Filter and sort hospitals
      let filteredHospitals = [...sampleHospitals];
      
      // Filter by disease/specialty if analysis is available
      if (analysis?.predictedDisease) {
        filteredHospitals = filteredHospitals.filter(hospital => {
          const matchesDisease = hospital.diseases.some(disease =>
            disease.toLowerCase().includes(analysis.predictedDisease.toLowerCase()) ||
            analysis.predictedDisease.toLowerCase().includes(disease.toLowerCase())
          );
          const matchesSpecialty = hospital.specialties.some(specialty =>
            specialty.toLowerCase().includes(analysis.specialty.toLowerCase()) ||
            analysis.specialty.toLowerCase().includes(specialty.toLowerCase())
          );
          return matchesDisease || matchesSpecialty;
        });
      }
      
      // Calculate distances and sort
      const hospitalsWithDistance = filteredHospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(location.latitude, location.longitude, hospital.lat, hospital.lng)
      }));
      
      hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
      setHospitals(hospitalsWithDistance);
    } catch (error) {
      console.error('Failed to initialize hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHospitals = () => {
    return hospitals.filter(hospital => {
      const distanceFilter = selectedDistance === 'all' || 
        (selectedDistance === '5' && hospital.distance <= 5) ||
        (selectedDistance === '10' && hospital.distance <= 10) ||
        (selectedDistance === '25' && hospital.distance <= 25);
      
      const ratingFilter = selectedRating === 'all' || 
        (selectedRating === '4' && hospital.rating >= 4) ||
        (selectedRating === '4.5' && hospital.rating >= 4.5);
      
      return distanceFilter && ratingFilter;
    });
  };

  const handleBookAppointment = (hospital) => {
    onNavigate('book-appointment', { hospital, analysis });
  };

  const filteredHospitals = getFilteredHospitals();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Finding nearby hospitals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Hospitals</h1>
        <p className="text-lg text-gray-600">
          {analysis 
            ? `Hospitals specializing in ${analysis.specialty} for ${analysis.predictedDisease}`
            : 'Discover healthcare providers near you'
          }
        </p>
      </div>

      {/* Location Notice */}
      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Using default location</p>
              <p className="text-yellow-700">
                We couldn't access your location. Showing hospitals near New York City. 
                Enable location services for accurate distance calculations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
              Distance
            </label>
            <select
              id="distance"
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All distances</option>
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating
            </label>
            <select
              id="rating"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All ratings</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>
          
          <div className="sm:pt-6">
            <span className="text-sm text-gray-500">
              {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{hospital.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{hospital.type}</p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{hospital.rating}</span>
                </div>
              </div>

              {/* Location & Distance */}
              <div className="flex items-start space-x-2 mb-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{hospital.address}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Navigation className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">{hospital.distance} miles away</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center space-x-2 mb-4">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{hospital.contact}</span>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {hospital.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {specialty}
                    </span>
                  ))}
                  {hospital.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      +{hospital.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Diseases Treated */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-900 mb-2">Conditions Treated:</p>
                <div className="flex flex-wrap gap-2">
                  {hospital.diseases.slice(0, 4).map((disease, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {disease}
                    </span>
                  ))}
                  {hospital.diseases.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      +{hospital.diseases.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Book Appointment Button */}
              <button
                onClick={() => handleBookAppointment(hospital)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default FindHospitals;