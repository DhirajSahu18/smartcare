import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const hospitalSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  role: { type: String, default: 'hospital' },
  type: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  specialties: [String],
  diseases: [String],
  rating: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

const sampleHospitals = [
  {
    _id: new mongoose.Types.ObjectId('67a1b2c3d4e5f6a7b8c9d0e1'),
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    email: 'info@kokilabenhospital.com',
    phone: '+91-22-4269-6969',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEJreQm',
    type: 'Multi-Specialty Hospital',
    address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai, Maharashtra 400053',
    location: { type: 'Point', coordinates: [72.8347, 19.1334] },
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Gastroenterology'],
    diseases: ['Heart Disease', 'Cancer', 'Stroke', 'Arthritis', 'Liver Disease'],
    rating: 4.8
  },
  {
    _id: new mongoose.Types.ObjectId('67a1b2c3d4e5f6a7b8c9d0e2'),
    name: 'Lilavati Hospital and Research Centre',
    email: 'info@lilavatihospital.com',
    phone: '+91-22-2675-1000',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEJreQm',
    type: 'Multi-Specialty Hospital',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050',
    location: { type: 'Point', coordinates: [72.8200, 19.0596] },
    specialties: ['Emergency Medicine', 'Cardiology', 'Neurosurgery', 'Pediatrics'],
    diseases: ['Heart Attack', 'Brain Tumor', 'Emergency Care', 'Child Care'],
    rating: 4.7
  },
  {
    _id: new mongoose.Types.ObjectId('67a1b2c3d4e5f6a7b8c9d0e3'),
    name: 'Hinduja Hospital',
    email: 'info@hindujahospital.com',
    phone: '+91-22-4510-8888',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEJreQm',
    type: 'Multi-Specialty Hospital',
    address: 'Veer Savarkar Marg, Mahim, Mumbai, Maharashtra 400016',
    location: { type: 'Point', coordinates: [72.8406, 19.0330] },
    specialties: ['Cardiology', 'Nephrology', 'Pulmonology', 'Endocrinology'],
    diseases: ['Heart Disease', 'Kidney Disease', 'Diabetes', 'Lung Disease'],
    rating: 4.6
  },
  {
    _id: new mongoose.Types.ObjectId('67a1b2c3d4e5f6a7b8c9d0e4'),
    name: 'Apollo Hospital Mumbai',
    email: 'info@apollomumbai.com',
    phone: '+91-22-3982-3982',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEJreQm',
    type: 'Multi-Specialty Hospital',
    address: 'Plot No. 13, Parsik Hill Road, Off Uran Road, CBD Belapur, Navi Mumbai, Maharashtra 400614',
    location: { type: 'Point', coordinates: [73.0297, 19.0144] },
    specialties: ['Cardiology', 'Oncology', 'Neurosurgery', 'Transplant Surgery'],
    diseases: ['Heart Disease', 'Cancer', 'Brain Tumors', 'Organ Failure'],
    rating: 4.5
  },
  {
    _id: new mongoose.Types.ObjectId('67a1b2c3d4e5f6a7b8c9d0e5'),
    name: 'Fortis Hospital Mulund',
    email: 'info@fortismulund.com',
    phone: '+91-22-6754-4444',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEJreQm',
    type: 'Multi-Specialty Hospital',
    address: 'Mulund Goregaon Link Road, Mulund West, Mumbai, Maharashtra 400078',
    location: { type: 'Point', coordinates: [72.9560, 19.1646] },
    specialties: ['Emergency Medicine', 'Cardiology', 'Orthopedics', 'Gastroenterology'],
    diseases: ['Emergency Care', 'Heart Disease', 'Bone Fractures', 'Digestive Issues'],
    rating: 4.4
  }
];

async function seedHospitals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing hospitals with these IDs
    await Hospital.deleteMany({
      _id: { $in: sampleHospitals.map(h => h._id) }
    });
    console.log('Cleared existing sample hospitals');

    // Insert hospitals
    await Hospital.insertMany(sampleHospitals);
    console.log(`✅ Successfully seeded ${sampleHospitals.length} hospitals`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding hospitals:', error);
    process.exit(1);
  }
}

seedHospitals();
