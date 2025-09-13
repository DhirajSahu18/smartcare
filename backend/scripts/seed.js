import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Hospital, Patient } from '../models/index.js';
import connectDB from '../config/database.js';

dotenv.config();

const sampleHospitals = [
  {
    name: 'City General Hospital',
    email: 'admin@citygeneral.com',
    phone: '+1-555-0101',
    password: 'hospital123',
    type: 'General Hospital',
    address: '123 Healthcare Blvd, Downtown, NY 10001',
    location: {
      type: 'Point',
      coordinates: [-73.9851, 40.7589] // [longitude, latitude]
    },
    specialties: ['Emergency Medicine', 'Internal Medicine', 'Surgery'],
    diseases: ['Heart Disease', 'Diabetes', 'Hypertension', 'Pneumonia'],
    rating: 4.5
  },
  {
    name: 'St. Mary\'s Medical Center',
    email: 'contact@stmarys.com',
    phone: '+1-555-0102',
    password: 'hospital123',
    type: 'Medical Center',
    address: '456 Healing Ave, Midtown, NY 10002',
    location: {
      type: 'Point',
      coordinates: [-73.9776, 40.7614]
    },
    specialties: ['Cardiology', 'Neurology', 'Orthopedics'],
    diseases: ['Heart Disease', 'Stroke', 'Arthritis', 'Migraine'],
    rating: 4.7
  },
  {
    name: 'Metro Children\'s Hospital',
    email: 'info@metrochildren.com',
    phone: '+1-555-0103',
    password: 'hospital123',
    type: 'Children\'s Hospital',
    address: '789 Kids Care St, Uptown, NY 10003',
    location: {
      type: 'Point',
      coordinates: [-73.9712, 40.7831]
    },
    specialties: ['Pediatrics', 'Pediatric Surgery', 'Child Psychology'],
    diseases: ['Asthma', 'Common Cold', 'Allergies', 'Growth Disorders'],
    rating: 4.8
  },
  {
    name: 'Advanced Cardiac Institute',
    email: 'heart@advancedcardiac.com',
    phone: '+1-555-0104',
    password: 'hospital123',
    type: 'Specialty Hospital',
    address: '321 Heart Lane, Medical District, NY 10004',
    location: {
      type: 'Point',
      coordinates: [-73.9934, 40.7505]
    },
    specialties: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
    diseases: ['Heart Disease', 'Arrhythmia', 'Heart Failure', 'Coronary Disease'],
    rating: 4.9
  },
  {
    name: 'Women\'s Health Center',
    email: 'care@womenshealth.com',
    phone: '+1-555-0105',
    password: 'hospital123',
    type: 'Women\'s Hospital',
    address: '654 Wellness Way, Health Plaza, NY 10005',
    location: {
      type: 'Point',
      coordinates: [-73.9942, 40.7282]
    },
    specialties: ['Gynecology', 'Obstetrics', 'Reproductive Medicine'],
    diseases: ['PCOS', 'Endometriosis', 'Pregnancy Care', 'Menstrual Disorders'],
    rating: 4.6
  }
];

// Generate additional hospitals to reach 50
const specialtyOptions = [
  ['Emergency Medicine', 'Trauma Care'],
  ['Neurology', 'Neurosurgery'],
  ['Orthopedics', 'Sports Medicine'],
  ['Gastroenterology', 'Hepatology'],
  ['Dermatology', 'Cosmetic Surgery'],
  ['Oncology', 'Radiation Therapy'],
  ['Pulmonology', 'Sleep Medicine'],
  ['Endocrinology', 'Diabetes Care'],
  ['Urology', 'Nephrology'],
  ['Ophthalmology', 'Optometry'],
  ['ENT', 'Audiology'],
  ['Psychiatry', 'Psychology'],
  ['Radiology', 'Nuclear Medicine'],
  ['Anesthesiology', 'Pain Management'],
  ['Family Medicine', 'Internal Medicine']
];

const diseaseOptions = [
  ['Trauma', 'Emergency Care'],
  ['Epilepsy', 'Parkinson\'s'],
  ['Fractures', 'Sports Injuries'],
  ['IBS', 'Liver Disease'],
  ['Acne', 'Skin Cancer'],
  ['Cancer', 'Chemotherapy'],
  ['Asthma', 'COPD'],
  ['Diabetes', 'Thyroid Disorders'],
  ['Kidney Disease', 'UTI'],
  ['Cataracts', 'Glaucoma'],
  ['Hearing Loss', 'Sinusitis'],
  ['Depression', 'Anxiety'],
  ['Diagnostic Imaging', 'Scans'],
  ['Chronic Pain', 'Surgery'],
  ['Preventive Care', 'Health Screenings']
];

const typeOptions = ['General Hospital', 'Medical Center', 'Specialty Clinic', 'Urgent Care', 'Diagnostic Center'];

for (let i = 6; i <= 50; i++) {
  const randomIndex = (i - 6) % specialtyOptions.length;
  
  sampleHospitals.push({
    name: `Healthcare Center ${i}`,
    email: `contact@healthcare${i}.com`,
    phone: `+1-555-0${i.toString().padStart(3, '0')}`,
    password: 'hospital123',
    type: typeOptions[Math.floor(Math.random() * typeOptions.length)],
    address: `${100 + i} Medical Street, Health District, NY 100${i.toString().padStart(2, '0')}`,
    location: {
      type: 'Point',
      coordinates: [-74.0000 + (Math.random() * 0.1), 40.7000 + (Math.random() * 0.1)]
    },
    specialties: specialtyOptions[randomIndex],
    diseases: diseaseOptions[randomIndex],
    rating: 4.0 + (Math.random() * 1.0)
  });
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if hospitals already exist
    const existingHospitals = await Hospital.countDocuments();
    if (existingHospitals > 0) {
      console.log('⚠️ Hospitals already exist, skipping seed...');
      return;
    }

    console.log('📊 Seeding hospitals...');
    
    // Create hospitals
    await Hospital.insertMany(sampleHospitals);

    // Create a demo patient
    const demoPatient = new Patient({
      name: 'Demo Patient',
      email: 'patient@demo.com',
      phone: '+1-555-DEMO',
      password: 'patient123',
      role: 'patient'
    });

    await demoPatient.save();

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Created ${sampleHospitals.length} hospitals`);
    console.log('👤 Created 1 demo patient');
    console.log('');
    console.log('Demo Credentials:');
    console.log('Patient: patient@demo.com / patient123');
    console.log('Hospital: admin@citygeneral.com / hospital123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();