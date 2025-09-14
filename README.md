# SmartCare - AI-Powered Healthcare Platform for India

SmartCare is a comprehensive healthcare platform designed specifically for India, featuring AI-powered symptom analysis, intelligent hospital finder, and seamless appointment booking system.

## 🚀 Features

### For Patients
- **AI Symptom Analysis**: Get instant analysis of your symptoms using advanced AI
- **Smart Hospital Finder**: Find nearby hospitals based on your condition and location
- **Urgent Help Chatbot**: 24/7 AI medical assistant for urgent queries
- **Easy Appointment Booking**: Book, reschedule, or cancel appointments with ease
- **Appointment Management**: Track all your healthcare appointments in one place

### For Hospitals
- **Dashboard**: Comprehensive view of appointments and patient statistics
- **Slot Management**: Manage available time slots and appointments
- **Patient Management**: View and manage patient appointments
- **Real-time Updates**: Live synchronization of appointment data

## 🏥 Hospital Database Schema

### Hospital Model Structure
```javascript
{
  name: String,              // Hospital name
  email: String,             // Contact email (unique)
  phone: String,             // Contact phone number
  password: String,          // Encrypted password for hospital login
  role: String,              // Always 'hospital'
  type: String,              // Hospital type (Multi-Specialty, Government, etc.)
  address: String,           // Full address
  location: {                // GeoJSON Point for location queries
    type: 'Point',
    coordinates: [lng, lat]  // [longitude, latitude]
  },
  specialties: [String],     // Array of medical specialties
  diseases: [String],        // Array of diseases/conditions treated
  rating: Number,            // Hospital rating (0-5)
  isActive: Boolean          // Hospital status
}
```

### Supported Hospital Types
- Multi-Specialty Hospital
- Super Specialty Hospital
- Government Medical Institute
- Eye Specialty Hospital
- Cancer Specialty Hospital
- Mental Health & Neuroscience Institute
- Emergency Hospital
- Children's Hospital
- And many more...

## 🌍 Indian Healthcare Context

### Emergency Numbers
- **108**: National Emergency Number
- **102**: Ambulance Service

### Coverage
The platform includes hospitals from major Indian cities:
- Mumbai (3 hospitals)
- Delhi (3 hospitals)
- Bangalore (3 hospitals)
- Chennai (2 hospitals)
- Hyderabad (2 hospitals)
- Kolkata (2 hospitals)
- Pune (2 hospitals)
- Ahmedabad (2 hospitals)
- Jaipur (2 hospitals)
- Specialty hospitals (3 hospitals)

## 🛠 Technology Stack

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Gemini AI** for symptom analysis
- **Geospatial queries** for location-based search

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gemini API key (optional - will use mock responses if not provided)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smartcare
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. **Environment Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string and other configs
```

4. **Seed the database with Indian hospitals**
```bash
cd backend
node scripts/seed-indian-hospitals.js
```

5. **Start the development servers**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from root directory)
npm run dev
```

## 🔗 API Endpoints

### Bulk Hospital Insert
```http
POST /api/hospitals/bulk
Content-Type: application/json

{
  "hospitals": [
    {
      "name": "Hospital Name",
      "email": "contact@hospital.com",
      "phone": "+91-XXXXXXXXXX",
      "password": "password123",
      "type": "Multi-Specialty Hospital",
      "address": "Full address",
      "location": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "specialties": ["Cardiology", "Neurology"],
      "diseases": ["Heart Disease", "Stroke"],
      "rating": 4.5
    }
  ]
}
```

### Other Endpoints
- **Authentication**: `/api/auth/*`
- **Hospitals**: `/api/hospitals/*`
- **Appointments**: `/api/appointments/*`
- **AI Services**: `/api/ai/*`
- **Patients**: `/api/patients/*`

## 🔐 Demo Credentials

### Patient Account
- **Email**: patient@demo.com
- **Password**: patient123

### Hospital Account
- **Email**: info@kokilabenhospital.com
- **Password**: hospital123

## 🌟 Key Features

### AI-Powered Analysis
- Real-time symptom analysis using Gemini AI
- Disease prediction with care recommendations
- Preventive measures and health guidance
- Medical chatbot for urgent queries

### Geospatial Hospital Search
- Distance-based hospital recommendations
- Specialty and disease filtering
- Real-time availability checking
- Rating-based sorting

### Appointment Management
- Conflict-free booking system
- Real-time slot management
- Appointment history tracking
- Rescheduling and cancellation

### Security & Performance
- JWT-based authentication
- Role-based access control
- Rate limiting and CORS protection
- Optimized MongoDB queries with indexing

## 📱 Mobile Responsive
The platform is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features
- Encrypted password storage
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- Rate limiting to prevent abuse

## 🚀 Deployment
The application is ready for deployment on:
- **Frontend**: Netlify, Vercel, or any static hosting
- **Backend**: Heroku, Railway, or any Node.js hosting
- **Database**: MongoDB Atlas (cloud) or self-hosted MongoDB

## 📄 License
This project is licensed under the MIT License.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support
For support and queries, please contact the development team or create an issue in the repository.