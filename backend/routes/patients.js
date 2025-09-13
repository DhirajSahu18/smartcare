import express from 'express';
import { Patient, Appointment, AISession } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/patients/profile
// @desc    Get patient profile
// @access  Private (Patient only)
router.get('/profile', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      data: { patient }
    });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient profile'
    });
  }
});

// @route   PATCH /api/patients/profile
// @desc    Update patient profile
// @access  Private (Patient only)
router.patch('/profile', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { patient }
    });

  } catch (error) {
    console.error('Update patient profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating patient profile'
    });
  }
});

// @route   GET /api/patients/dashboard
// @desc    Get patient dashboard data
// @access  Private (Patient only)
router.get('/dashboard', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patientId = req.user._id;

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patient: patientId,
      date: { $gte: new Date() },
      status: 'scheduled'
    })
    .populate('hospital', 'name address')
    .sort({ date: 1, timeSlot: 1 })
    .limit(5);

    // Get recent AI sessions
    const recentSessions = await AISession.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('symptoms disease specialty urgency createdAt');

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      { $match: { patient: patientId } },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          scheduledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = appointmentStats[0] || {
      totalAppointments: 0,
      scheduledAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0
    };

    res.json({
      success: true,
      data: {
        upcomingAppointments,
        recentSessions,
        stats
      }
    });

  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

export default router;