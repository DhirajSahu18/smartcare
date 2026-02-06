import express from 'express';
import { Hospital, HospitalSlot } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// @route   GET /api/hospitals
// @desc    Get hospitals with filtering and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      disease, 
      specialty, 
      lat, 
      lng, 
      radius = 50, 
      minRating = 0,
      limit = 50,
      offset = 0 
    } = req.query;

    // Build query
    let query = { rating: { $gte: parseFloat(minRating) } };

    // Filter by disease
    if (disease) {
      query.diseases = { $regex: disease, $options: 'i' };
    }

    // Filter by specialty
    if (specialty) {
      query.specialties = { $regex: specialty, $options: 'i' };
    }

    // Filter by hospital type
    if (req.query.type) {
      query.type = { $regex: req.query.type, $options: 'i' };
    }

    // Location-based filtering
    if (lat && lng && radius) {
      const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    let hospitals = await Hospital.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ rating: -1, name: 1 });

    // If no hospitals found and no specific filters, return sample hospitals
    if (hospitals.length === 0 && !disease && !specialty) {
      hospitals = getSampleHospitals();
    }

    // Calculate distances if user location provided
    if (lat && lng) {
      hospitals = hospitals.map(hospital => {
        // Handle both Mongoose documents and plain objects
        const hospitalObj = typeof hospital.toObject === 'function'
          ? hospital.toObject()
          : { ...hospital };
        hospitalObj.distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          hospital.location?.coordinates[1] || hospital.latitude || 19.0760,
          hospital.location?.coordinates[0] || hospital.longitude || 72.8777
        );
        return hospitalObj;
      });

      // Sort by distance if location provided
      hospitals.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    res.json({
      success: true,
      data: {
        hospitals,
        total: hospitals.length,
        filters: {
          disease,
          specialty,
          location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
          radius: parseFloat(radius),
          minRating: parseFloat(minRating)
        }
      }
    });

  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospitals'
    });
  }
});

// Sample hospitals for fallback
const getSampleHospitals = () => {
  return [
    {
      _id: '1',
      name: 'Kokilaben Dhirubhai Ambani Hospital',
      email: 'info@kokilabenhospital.com',
      phone: '+91-22-4269-6969',
      type: 'Multi-Specialty Hospital',
      address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053',
      location: {
        type: 'Point',
        coordinates: [72.8347, 19.1136]
      },
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gastroenterology'],
      diseases: ['Heart Disease', 'Cancer', 'Stroke', 'Arthritis', 'Liver Disease'],
      rating: 4.8,
      distance: 5.2
    },
    {
      _id: '2',
      name: 'Lilavati Hospital and Research Centre',
      email: 'contact@lilavatihospital.com',
      phone: '+91-22-2675-1000',
      type: 'Multi-Specialty Hospital',
      address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
      location: {
        type: 'Point',
        coordinates: [72.8181, 19.0596]
      },
      specialties: ['Emergency Medicine', 'Cardiology', 'Neurosurgery', 'Pediatrics'],
      diseases: ['Heart Attack', 'Brain Tumor', 'Emergency Care', 'Child Care'],
      rating: 4.7,
      distance: 8.1
    },
    {
      _id: '3',
      name: 'Hinduja Hospital',
      email: 'info@hindujahospital.com',
      phone: '+91-22-4510-8888',
      type: 'Multi-Specialty Hospital',
      address: 'Veer Savarkar Marg, Mahim, Mumbai, Maharashtra 400016',
      location: {
        type: 'Point',
        coordinates: [72.8406, 19.0330]
      },
      specialties: ['Cardiology', 'Nephrology', 'Pulmonology', 'Endocrinology'],
      diseases: ['Heart Disease', 'Kidney Disease', 'Diabetes', 'Lung Disease'],
      rating: 4.6,
      distance: 12.3
    },
    {
      _id: '4',
      name: 'Apollo Hospital Navi Mumbai',
      email: 'mumbai@apollohospitals.com',
      phone: '+91-22-3982-3982',
      type: 'Multi-Specialty Hospital',
      address: 'Plot No. 13, Parsik Hill Road, Off Uran Road, CBD Belapur, Navi Mumbai, Maharashtra 400614',
      location: {
        type: 'Point',
        coordinates: [73.0297, 19.0178]
      },
      specialties: ['Cardiology', 'Oncology', 'Neurosurgery', 'Transplant Surgery'],
      diseases: ['Heart Disease', 'Cancer', 'Brain Tumors', 'Organ Failure'],
      rating: 4.5,
      distance: 15.7
    },
    {
      _id: '5',
      name: 'Fortis Hospital Mulund',
      email: 'mulund@fortishealthcare.com',
      phone: '+91-22-6754-4444',
      type: 'Multi-Specialty Hospital',
      address: 'Mulund Goregaon Link Road, Mulund West, Mumbai, Maharashtra 400078',
      location: {
        type: 'Point',
        coordinates: [72.9581, 19.1728]
      },
      specialties: ['Emergency Medicine', 'Cardiology', 'Orthopedics', 'Gastroenterology'],
      diseases: ['Emergency Care', 'Heart Disease', 'Bone Fractures', 'Digestive Issues'],
      rating: 4.4,
      distance: 18.2
    },
    {
      _id: '6',
      name: 'Jaslok Hospital and Research Centre',
      email: 'info@jaslokhospital.net',
      phone: '+91-22-6657-3333',
      type: 'Multi-Specialty Hospital',
      address: '15, Dr. Deshmukh Marg, Pedder Road, Mumbai, Maharashtra 400026',
      location: {
        type: 'Point',
        coordinates: [72.8105, 18.9712]
      },
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Gastroenterology', 'Nephrology'],
      diseases: ['Heart Disease', 'Cancer', 'Neurological Disorders', 'Liver Disease', 'Kidney Disease'],
      rating: 4.6,
      distance: 10.5
    },
    {
      _id: '7',
      name: 'Breach Candy Hospital',
      email: 'info@breachcandyhospital.org',
      phone: '+91-22-2367-1888',
      type: 'Multi-Specialty Hospital',
      address: '60-A, Bhulabhai Desai Road, Mumbai, Maharashtra 400026',
      location: {
        type: 'Point',
        coordinates: [72.8057, 18.9688]
      },
      specialties: ['Cardiology', 'Orthopedics', 'General Surgery', 'Gynecology', 'Pediatrics'],
      diseases: ['Heart Disease', 'Bone Injuries', 'Surgical Care', 'Women Health', 'Child Care'],
      rating: 4.5,
      distance: 11.2
    },
    {
      _id: '8',
      name: 'Nanavati Max Super Speciality Hospital',
      email: 'info@nanavatimaxhospital.org',
      phone: '+91-22-2626-7500',
      type: 'Multi-Specialty Hospital',
      address: 'S.V. Road, Vile Parle West, Mumbai, Maharashtra 400056',
      location: {
        type: 'Point',
        coordinates: [72.8438, 19.0989]
      },
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Urology'],
      diseases: ['Heart Disease', 'Cancer', 'Stroke', 'Joint Problems', 'Urinary Disorders'],
      rating: 4.4,
      distance: 7.8
    },
    {
      _id: '9',
      name: 'Wockhardt Hospital Mumbai Central',
      email: 'mumcentral@wockhardthospitals.com',
      phone: '+91-22-6178-4444',
      type: 'Multi-Specialty Hospital',
      address: '1877, Dr. Anand Rao Nair Marg, Mumbai Central, Mumbai, Maharashtra 400011',
      location: {
        type: 'Point',
        coordinates: [72.8217, 18.9696]
      },
      specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Gastroenterology', 'Nephrology'],
      diseases: ['Heart Disease', 'Spine Problems', 'Brain Disorders', 'Digestive Issues', 'Kidney Disease'],
      rating: 4.3,
      distance: 9.4
    },
    {
      _id: '10',
      name: 'SevenHills Hospital',
      email: 'info@sevenhillshospital.com',
      phone: '+91-22-6767-6767',
      type: 'Multi-Specialty Hospital',
      address: 'Marol Maroshi Road, Andheri East, Mumbai, Maharashtra 400059',
      location: {
        type: 'Point',
        coordinates: [72.8765, 19.1173]
      },
      specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology', 'Emergency Medicine'],
      diseases: ['Heart Disease', 'Cancer', 'Bone Fractures', 'Neurological Disorders', 'Emergency Care'],
      rating: 4.2,
      distance: 6.3
    },
    {
      _id: '11',
      name: 'Bombay Hospital and Medical Research Centre',
      email: 'info@bombayhospital.com',
      phone: '+91-22-2206-7676',
      type: 'Multi-Specialty Hospital',
      address: '12, New Marine Lines, Mumbai, Maharashtra 400020',
      location: {
        type: 'Point',
        coordinates: [72.8258, 18.9432]
      },
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Gastroenterology', 'Pulmonology'],
      diseases: ['Heart Disease', 'Cancer', 'Stroke', 'Liver Disease', 'Lung Disease'],
      rating: 4.5,
      distance: 13.1
    },
    {
      _id: '12',
      name: 'S L Raheja Hospital (A Fortis Associate)',
      email: 'info@rahejahospital.com',
      phone: '+91-22-6652-9999',
      type: 'Multi-Specialty Hospital',
      address: 'Raheja Rugnalaya Marg, Mahim West, Mumbai, Maharashtra 400016',
      location: {
        type: 'Point',
        coordinates: [72.8401, 19.0384]
      },
      specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Gastroenterology', 'Endocrinology'],
      diseases: ['Heart Disease', 'Joint Problems', 'Brain Disorders', 'Digestive Issues', 'Diabetes'],
      rating: 4.3,
      distance: 8.9
    },
    {
      _id: '13',
      name: 'Hiranandani Hospital Powai',
      email: 'info@hiranandanihospital.org',
      phone: '+91-22-2576-3300',
      type: 'Multi-Specialty Hospital',
      address: 'Hillside Avenue, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076',
      location: {
        type: 'Point',
        coordinates: [72.9054, 19.1197]
      },
      specialties: ['Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'General Surgery'],
      diseases: ['Heart Disease', 'Bone Problems', 'Child Care', 'Women Health', 'Surgical Care'],
      rating: 4.4,
      distance: 4.5
    },
    {
      _id: '14',
      name: 'Global Hospital Parel',
      email: 'info@globalhospitalsmumbai.com',
      phone: '+91-22-6767-0101',
      type: 'Multi-Specialty Hospital',
      address: '35, Dr. E. Borges Road, Hospital Avenue, Parel, Mumbai, Maharashtra 400012',
      location: {
        type: 'Point',
        coordinates: [72.8416, 19.0048]
      },
      specialties: ['Transplant Surgery', 'Cardiology', 'Oncology', 'Nephrology', 'Hepatology'],
      diseases: ['Organ Failure', 'Heart Disease', 'Cancer', 'Kidney Disease', 'Liver Disease'],
      rating: 4.6,
      distance: 10.8
    },
    {
      _id: '15',
      name: 'Tata Memorial Hospital',
      email: 'info@tmc.gov.in',
      phone: '+91-22-2417-7000',
      type: 'Specialty Hospital',
      address: 'Dr. E. Borges Road, Parel, Mumbai, Maharashtra 400012',
      location: {
        type: 'Point',
        coordinates: [72.8423, 19.0041]
      },
      specialties: ['Oncology', 'Radiation Oncology', 'Surgical Oncology', 'Medical Oncology'],
      diseases: ['Cancer', 'Tumors', 'Leukemia', 'Lymphoma'],
      rating: 4.9,
      distance: 10.9
    }
  ];
};
// @route   POST /api/hospitals/bulk
// @desc    Add multiple hospitals to database
// @access  Private (Admin only - for now public for seeding)
router.post('/bulk', async (req, res) => {
  try {
    const { hospitals } = req.body;

    if (!hospitals || !Array.isArray(hospitals)) {
      return res.status(400).json({
        success: false,
        message: 'Hospitals array is required'
      });
    }

    // Validate each hospital has required fields
    const requiredFields = ['name', 'email', 'phone', 'password', 'type', 'address', 'location'];
    for (const hospital of hospitals) {
      for (const field of requiredFields) {
        if (!hospital[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing required field: ${field} in hospital: ${hospital.name || 'Unknown'}`
          });
        }
      }
    }

    // Insert hospitals
    const insertedHospitals = await Hospital.insertMany(hospitals);

    res.status(201).json({
      success: true,
      message: `Successfully added ${insertedHospitals.length} hospitals`,
      data: {
        count: insertedHospitals.length,
        hospitals: insertedHospitals
      }
    });

  } catch (error) {
    console.error('Bulk insert hospitals error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate hospital found. Some hospitals may already exist in the database.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding hospitals'
    });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: { hospital }
    });

  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospital'
    });
  }
});

// @route   GET /api/hospitals/:id/slots
// @desc    Get available slots for a hospital
// @access  Public
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Check if hospital exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Get slots for the date
    const slots = await HospitalSlot.find({
      hospital: id,
      date: new Date(date)
    }).sort({ timeSlot: 1 });

    const slotsObj = {};
    slots.forEach(slot => {
      slotsObj[slot.timeSlot] = slot.actuallyAvailable;
    });

    // If no slots exist for this date, generate default slots
    if (Object.keys(slotsObj).length === 0) {
      const defaultSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
      ];

      const slotPromises = defaultSlots.map(async (timeSlot) => {
        const isAvailable = Math.random() > 0.3; // 70% chance of being available
        slotsObj[timeSlot] = isAvailable;

        // Create slot in database
        await HospitalSlot.findOneAndUpdate(
          { hospital: id, date: new Date(date), timeSlot },
          { 
            hospital: id, 
            date: new Date(date), 
            timeSlot, 
            isAvailable,
            maxAppointments: 1,
            currentAppointments: 0
          },
          { upsert: true, new: true }
        );
      });

      await Promise.all(slotPromises);
    }

    res.json({
      success: true,
      data: {
        hospitalId: id,
        date,
        slots: slotsObj
      }
    });

  } catch (error) {
    console.error('Get hospital slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospital slots'
    });
  }
});

// @route   POST /api/hospitals/:id/slots
// @desc    Add or update hospital slot
// @access  Private (Hospital only)
router.post('/:id/slots', authenticate, authorize('hospital'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot, isAvailable } = req.body;

    // Check if this is the hospital's own slots
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own hospital slots'
      });
    }

    // Upsert slot
    const slot = await HospitalSlot.findOneAndUpdate(
      { hospital: id, date: new Date(date), timeSlot },
      { 
        hospital: id, 
        date: new Date(date), 
        timeSlot, 
        isAvailable,
        maxAppointments: 1,
        currentAppointments: 0
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Hospital slot updated successfully',
      data: {
        hospitalId: id,
        date,
        timeSlot,
        isAvailable
      }
    });

  } catch (error) {
    console.error('Update hospital slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating hospital slot'
    });
  }
});

export default router;