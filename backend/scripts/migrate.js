import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrations = [
  // Create patients table
  `CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create hospitals table
  `CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'hospital',
    type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    specialties JSONB DEFAULT '[]',
    diseases JSONB DEFAULT '[]',
    rating DECIMAL(3, 2) DEFAULT 4.0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create appointments table
  `CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(100) NOT NULL,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    hospital_name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    symptoms TEXT,
    disease VARCHAR(200),
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create hospital_slots table
  `CREATE TABLE IF NOT EXISTS hospital_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(hospital_id, date, time_slot)
  )`,

  // Create ai_sessions table
  `CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    disease VARCHAR(200),
    specialty VARCHAR(100),
    urgency VARCHAR(20),
    guidance TEXT,
    preventive_measures JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create chat_messages table
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_id UUID REFERENCES ai_sessions(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Create indexes for better performance
  `CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)`,
  `CREATE INDEX IF NOT EXISTS idx_hospital_slots_hospital_date ON hospital_slots(hospital_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_ai_sessions_patient_id ON ai_sessions(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chat_messages_patient_id ON chat_messages(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals(latitude, longitude)`,
  `CREATE INDEX IF NOT EXISTS idx_hospitals_specialties ON hospitals USING GIN(specialties)`,
  `CREATE INDEX IF NOT EXISTS idx_hospitals_diseases ON hospitals USING GIN(diseases)`
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`📊 Running migration ${i + 1}/${migrations.length}...`);
      await query(migrations[i]);
    }
    
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();