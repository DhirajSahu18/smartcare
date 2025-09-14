import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Hospital, Patient } from '../models/index.js';
import connectDB from '../config/database.js';

dotenv.config();

const indianHospitals = [
  // Mumbai Hospitals
  {
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    email: 'info@kokilabenhospital.com',
    phone: '+91-22-4269-6969',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053',
    location: {
      type: 'Point',
      coordinates: [72.8347, 19.1136]
    },
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gastroenterology'],
    diseases: ['Heart Disease', 'Cancer', 'Stroke', 'Arthritis', 'Liver Disease'],
    rating: 4.8
  },
  {
    name: 'Lilavati Hospital and Research Centre',
    email: 'contact@lilavatihospital.com',
    phone: '+91-22-2675-1000',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
    location: {
      type: 'Point',
      coordinates: [72.8181, 19.0596]
    },
    specialties: ['Emergency Medicine', 'Cardiology', 'Neurosurgery', 'Pediatrics'],
    diseases: ['Heart Attack', 'Brain Tumor', 'Emergency Care', 'Child Care'],
    rating: 4.7
  },
  {
    name: 'Hinduja Hospital',
    email: 'info@hindujahospital.com',
    phone: '+91-22-4510-8888',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'Veer Savarkar Marg, Mahim, Mumbai, Maharashtra 400016',
    location: {
      type: 'Point',
      coordinates: [72.8406, 19.0330]
    },
    specialties: ['Cardiology', 'Nephrology', 'Pulmonology', 'Endocrinology'],
    diseases: ['Heart Disease', 'Kidney Disease', 'Diabetes', 'Lung Disease'],
    rating: 4.6
  },

  // Delhi Hospitals
  {
    name: 'All India Institute of Medical Sciences (AIIMS)',
    email: 'director@aiims.edu',
    phone: '+91-11-2658-8500',
    password: 'hospital123',
    type: 'Government Medical Institute',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.5672]
    },
    specialties: ['All Specialties', 'Research', 'Emergency Medicine', 'Surgery'],
    diseases: ['All Diseases', 'Complex Cases', 'Research Cases', 'Emergency Care'],
    rating: 4.9
  },
  {
    name: 'Fortis Hospital Shalimar Bagh',
    email: 'shalimarbagh@fortishealthcare.com',
    phone: '+91-11-4713-3333',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'A Block, Shalimar Bagh, Delhi 110088',
    location: {
      type: 'Point',
      coordinates: [77.1644, 28.7196]
    },
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
    diseases: ['Heart Disease', 'Cancer', 'Brain Disorders', 'Bone Fractures'],
    rating: 4.5
  },
  {
    name: 'Max Super Speciality Hospital Saket',
    email: 'saket@maxhealthcare.com',
    phone: '+91-11-2651-5050',
    password: 'hospital123',
    type: 'Super Specialty Hospital',
    address: '1, 2, Press Enclave Road, Saket, New Delhi, Delhi 110017',
    location: {
      type: 'Point',
      coordinates: [77.2167, 28.5245]
    },
    specialties: ['Cardiology', 'Neurosurgery', 'Transplant', 'Cancer Care'],
    diseases: ['Heart Surgery', 'Brain Surgery', 'Organ Transplant', 'Cancer'],
    rating: 4.7
  },

  // Bangalore Hospitals
  {
    name: 'Manipal Hospital Bangalore',
    email: 'bangalore@manipalhospitals.com',
    phone: '+91-80-2502-4444',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '98, Rustom Bagh, Airport Road, Bangalore, Karnataka 560017',
    location: {
      type: 'Point',
      coordinates: [77.6413, 12.9716]
    },
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology'],
    diseases: ['Heart Disease', 'Neurological Disorders', 'Joint Problems', 'Digestive Issues'],
    rating: 4.6
  },
  {
    name: 'Apollo Hospital Bangalore',
    email: 'bangalore@apollohospitals.com',
    phone: '+91-80-2630-0300',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '154/11, Opposite IIM-B, Bannerghatta Road, Bangalore, Karnataka 560076',
    location: {
      type: 'Point',
      coordinates: [77.6068, 12.8996]
    },
    specialties: ['Cardiology', 'Oncology', 'Neurosurgery', 'Transplant Surgery'],
    diseases: ['Heart Disease', 'Cancer', 'Brain Tumors', 'Organ Failure'],
    rating: 4.8
  },
  {
    name: 'Narayana Health City',
    email: 'info@narayanahealth.org',
    phone: '+91-80-7122-2200',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bangalore, Karnataka 560099',
    location: {
      type: 'Point',
      coordinates: [77.6292, 12.8056]
    },
    specialties: ['Cardiac Surgery', 'Pediatric Surgery', 'Neurosurgery', 'Oncology'],
    diseases: ['Heart Surgery', 'Child Surgery', 'Brain Surgery', 'Cancer'],
    rating: 4.7
  },

  // Chennai Hospitals
  {
    name: 'Apollo Hospital Chennai',
    email: 'chennai@apollohospitals.com',
    phone: '+91-44-2829-3333',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827]
    },
    specialties: ['Cardiology', 'Transplant Surgery', 'Oncology', 'Neurology'],
    diseases: ['Heart Disease', 'Organ Transplant', 'Cancer', 'Neurological Disorders'],
    rating: 4.8
  },
  {
    name: 'Fortis Malar Hospital',
    email: 'malar@fortishealthcare.com',
    phone: '+91-44-4289-2222',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '52, 1st Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu 600020',
    location: {
      type: 'Point',
      coordinates: [80.2574, 13.0067]
    },
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine'],
    diseases: ['Heart Disease', 'Stroke', 'Bone Fractures', 'Emergency Care'],
    rating: 4.5
  },

  // Hyderabad Hospitals
  {
    name: 'Apollo Hospital Hyderabad',
    email: 'hyderabad@apollohospitals.com',
    phone: '+91-40-2360-7777',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'Jubilee Hills, Hyderabad, Telangana 500033',
    location: {
      type: 'Point',
      coordinates: [78.4089, 17.4126]
    },
    specialties: ['Cardiology', 'Oncology', 'Neurosurgery', 'Transplant'],
    diseases: ['Heart Disease', 'Cancer', 'Brain Surgery', 'Organ Transplant'],
    rating: 4.7
  },
  {
    name: 'KIMS Hospital Hyderabad',
    email: 'info@kimshospitals.com',
    phone: '+91-40-4488-5555',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '1-8-31/1, Minister Rd, Krishna Nagar Colony, Begumpet, Hyderabad, Telangana 500003',
    location: {
      type: 'Point',
      coordinates: [78.4744, 17.4399]
    },
    specialties: ['Cardiology', 'Neurology', 'Gastroenterology', 'Pulmonology'],
    diseases: ['Heart Disease', 'Neurological Disorders', 'Liver Disease', 'Lung Disease'],
    rating: 4.4
  },

  // Kolkata Hospitals
  {
    name: 'Apollo Gleneagles Hospital Kolkata',
    email: 'kolkata@apollohospitals.com',
    phone: '+91-33-2320-3040',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '58, Canal Circular Road, Kadapara, Phool Bagan, Kolkata, West Bengal 700054',
    location: {
      type: 'Point',
      coordinates: [88.3639, 22.5726]
    },
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
    diseases: ['Heart Disease', 'Neurological Disorders', 'Cancer', 'Joint Problems'],
    rating: 4.6
  },
  {
    name: 'Fortis Hospital Kolkata',
    email: 'kolkata@fortishealthcare.com',
    phone: '+91-33-6628-4444',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '730, Anandapur, E M Bypass, Anandapur, Kolkata, West Bengal 700107',
    location: {
      type: 'Point',
      coordinates: [88.3962, 22.5074]
    },
    specialties: ['Cardiology', 'Neurosurgery', 'Gastroenterology', 'Emergency Medicine'],
    diseases: ['Heart Disease', 'Brain Surgery', 'Digestive Disorders', 'Emergency Care'],
    rating: 4.5
  },

  // Pune Hospitals
  {
    name: 'Ruby Hall Clinic Pune',
    email: 'info@rubyhall.com',
    phone: '+91-20-2611-2121',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '40, Sassoon Road, Pune, Maharashtra 411001',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204]
    },
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
    diseases: ['Heart Disease', 'Neurological Disorders', 'Bone Problems', 'Child Care'],
    rating: 4.5
  },
  {
    name: 'Jehangir Hospital Pune',
    email: 'info@jehangirhospital.com',
    phone: '+91-20-2670-1000',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: '32, Sassoon Road, Pune, Maharashtra 411001',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5196]
    },
    specialties: ['Cardiology', 'Oncology', 'Neurosurgery', 'Emergency Medicine'],
    diseases: ['Heart Disease', 'Cancer', 'Brain Surgery', 'Emergency Care'],
    rating: 4.4
  },

  // Ahmedabad Hospitals
  {
    name: 'Apollo Hospital Ahmedabad',
    email: 'ahmedabad@apollohospitals.com',
    phone: '+91-79-2678-6666',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'Plot No 1A, GIDC Estate, Bhat, Gandhinagar, Gujarat 382428',
    location: {
      type: 'Point',
      coordinates: [72.6369, 23.2599]
    },
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Gastroenterology'],
    diseases: ['Heart Disease', 'Neurological Disorders', 'Cancer', 'Digestive Issues'],
    rating: 4.6
  },
  {
    name: 'Sterling Hospital Ahmedabad',
    email: 'info@sterlinghospitals.com',
    phone: '+91-79-6677-0000',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'Behind Drive-In Cinema, Thaltej, Ahmedabad, Gujarat 380054',
    location: {
      type: 'Point',
      coordinates: [72.5194, 23.0545]
    },
    specialties: ['Cardiology', 'Neurosurgery', 'Orthopedics', 'Emergency Medicine'],
    diseases: ['Heart Disease', 'Brain Surgery', 'Joint Problems', 'Emergency Care'],
    rating: 4.3
  },

  // Jaipur Hospitals
  {
    name: 'Fortis Escorts Hospital Jaipur',
    email: 'jaipur@fortishealthcare.com',
    phone: '+91-141-254-7000',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur, Rajasthan 302017',
    location: {
      type: 'Point',
      coordinates: [75.8077, 26.8854]
    },
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
    diseases: ['Heart Disease', 'Neurological Disorders', 'Cancer', 'Bone Problems'],
    rating: 4.4
  },
  {
    name: 'Narayana Multispeciality Hospital Jaipur',
    email: 'jaipur@narayanahealth.org',
    phone: '+91-141-517-7777',
    password: 'hospital123',
    type: 'Multi-Specialty Hospital',
    address: 'Sector 28, Pratap Nagar, Sanganer, Jaipur, Rajasthan 303906',
    location: {
      type: 'Point',
      coordinates: [75.7849, 26.8467]
    },
    specialties: ['Cardiology', 'Neurosurgery', 'Gastroenterology', 'Pulmonology'],
    diseases: ['Heart Disease', 'Brain Surgery', 'Digestive Issues', 'Lung Disease'],
    rating: 4.2
  },

  // Specialty Hospitals
  {
    name: 'Sankara Nethralaya Chennai',
    email: 'info@sankaranethralaya.org',
    phone: '+91-44-2827-1616',
    password: 'hospital123',
    type: 'Eye Specialty Hospital',
    address: '18, College Road, Chennai, Tamil Nadu 600006',
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0878]
    },
    specialties: ['Ophthalmology', 'Retinal Surgery', 'Corneal Transplant', 'Pediatric Eye Care'],
    diseases: ['Cataracts', 'Glaucoma', 'Retinal Disorders', 'Eye Injuries'],
    rating: 4.9
  },
  {
    name: 'Tata Memorial Hospital Mumbai',
    email: 'info@tmc.gov.in',
    phone: '+91-22-2417-7000',
    password: 'hospital123',
    type: 'Cancer Specialty Hospital',
    address: 'Dr. E Borges Road, Parel, Mumbai, Maharashtra 400012',
    location: {
      type: 'Point',
      coordinates: [72.8406, 19.0176]
    },
    specialties: ['Medical Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Pediatric Oncology'],
    diseases: ['All Types of Cancer', 'Blood Cancer', 'Solid Tumors', 'Pediatric Cancer'],
    rating: 4.8
  },
  {
    name: 'NIMHANS Bangalore',
    email: 'director@nimhans.ac.in',
    phone: '+91-80-2699-5000',
    password: 'hospital123',
    type: 'Mental Health & Neuroscience Institute',
    address: 'Hosur Road, Bangalore, Karnataka 560029',
    location: {
      type: 'Point',
      coordinates: [77.6413, 12.9431]
    },
    specialties: ['Psychiatry', 'Neurology', 'Neurosurgery', 'Clinical Psychology'],
    diseases: ['Mental Health Disorders', 'Neurological Disorders', 'Brain Tumors', 'Addiction'],
    rating: 4.7
  }
];

async function seedIndianHospitals() {
  console.log('🌱 Starting Indian hospitals seeding...');
  
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing hospitals
    await Hospital.deleteMany({});
    console.log('🗑️ Cleared existing hospitals');

    console.log('📊 Seeding Indian hospitals...');
    
    // Create hospitals
    const insertedHospitals = await Hospital.insertMany(indianHospitals);

    // Create a demo patient
    await Patient.deleteMany({});
    const demoPatient = new Patient({
      name: 'Demo Patient',
      email: 'patient@demo.com',
      phone: '+91-9876543210',
      password: 'patient123',
      role: 'patient'
    });

    await demoPatient.save();

    console.log('✅ Indian hospitals seeded successfully!');
    console.log(`📊 Created ${insertedHospitals.length} hospitals across major Indian cities`);
    console.log('👤 Created 1 demo patient');
    console.log('');
    console.log('Demo Credentials:');
    console.log('Patient: patient@demo.com / patient123');
    console.log('Hospital: info@kokilabenhospital.com / hospital123');
    console.log('');
    console.log('Cities covered:');
    console.log('- Mumbai (3 hospitals)');
    console.log('- Delhi (3 hospitals)');
    console.log('- Bangalore (3 hospitals)');
    console.log('- Chennai (2 hospitals)');
    console.log('- Hyderabad (2 hospitals)');
    console.log('- Kolkata (2 hospitals)');
    console.log('- Pune (2 hospitals)');
    console.log('- Ahmedabad (2 hospitals)');
    console.log('- Jaipur (2 hospitals)');
    console.log('- Specialty hospitals (3 hospitals)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedIndianHospitals();