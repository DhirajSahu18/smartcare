# SmartCare Backend API

A comprehensive Node.js backend for the SmartCare AI-powered healthcare platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **AI Integration**: Gemini AI for symptom analysis and medical chatbot
- **Hospital Management**: CRUD operations for hospitals and slot management
- **Appointment System**: Complete booking, rescheduling, and cancellation
- **Geolocation**: Distance-based hospital search and filtering
- **Database**: PostgreSQL with proper indexing and relationships
- **Security**: Rate limiting, CORS, helmet, input validation
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **AI**: Google Gemini AI
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Gemini API Key (optional - will use mock responses if not provided)

### Installation

1. **Clone and setup**:
```bash
cd backend
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**:
```bash
# Create PostgreSQL database
createdb smartcare_db

# Run migrations
npm run migrate

# Seed sample data
npm run seed
```

4. **Start Development Server**:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/smartcare_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Gemini AI (optional)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register patient or hospital
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Hospitals
- `GET /api/hospitals` - Get hospitals with filtering
- `GET /api/hospitals/:id` - Get single hospital
- `GET /api/hospitals/:id/slots` - Get hospital time slots
- `POST /api/hospitals/:id/slots` - Manage hospital slots (Hospital only)

### Appointments
- `POST /api/appointments` - Book appointment (Patient only)
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/:id` - Get single appointment
- `PATCH /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### AI Services
- `POST /api/ai/analyze` - Analyze symptoms (Patient only)
- `POST /api/ai/chat` - Chat with AI assistant (Patient only)
- `GET /api/ai/sessions` - Get AI analysis history (Patient only)

### Patients
- `GET /api/patients/profile` - Get patient profile (Patient only)
- `PATCH /api/patients/profile` - Update patient profile (Patient only)
- `GET /api/patients/dashboard` - Get dashboard data (Patient only)

## Database Schema

### Tables
- **patients**: Patient user accounts
- **hospitals**: Hospital user accounts with location and specialties
- **appointments**: Appointment bookings between patients and hospitals
- **hospital_slots**: Available time slots for each hospital
- **ai_sessions**: AI symptom analysis sessions
- **chat_messages**: AI chat conversation history

### Key Features
- UUID primary keys for security
- Proper foreign key relationships
- JSON fields for flexible data (specialties, diseases)
- Comprehensive indexing for performance
- Soft deletes and audit trails

## Demo Credentials

After running the seed script:

**Patient Account**:
- Email: `patient@demo.com`
- Password: `patient123`

**Hospital Account**:
- Email: `admin@citygeneral.com`
- Password: `hospital123`

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Detailed error information"
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **SQL Injection Prevention**: Parameterized queries

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Project Structure
```
backend/
├── config/          # Database configuration
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── scripts/         # Database scripts
├── .env.example     # Environment template
├── server.js        # Main server file
└── README.md        # This file
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Set secure JWT secret
4. Configure proper CORS origins
5. Use process manager (PM2)
6. Set up SSL/TLS termination
7. Configure logging and monitoring

## Contributing

1. Follow existing code style
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test all endpoints thoroughly

## License

MIT License - see LICENSE file for details