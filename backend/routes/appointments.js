import express from 'express';
import mongoose from 'mongoose';
import { Appointment, Hospital, HospitalSlot } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Private (Patient only)
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      const { hospitalId, date, timeSlot, symptoms, disease } = req.body;
      const patientId = req.user._id;

      // Validate hospitalId
      if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
        throw new Error('Invalid hospital ID');
      }

      // Check if hospital exists
      const hospital = await Hospital.findById(hospitalId).session(session);
      if (!hospital) {
        throw new Error('Hospital not found');
      }

      // Check if patient already has appointment at this time
      const conflictingAppointment = await Appointment.findOne({
        patient: patientId,
        date: new Date(date),
        timeSlot,
        status: { $in: ['scheduled', 'confirmed'] }
      }).session(session);

      if (conflictingAppointment) {
        throw new Error('You already have an appointment at this time');
      }

      // Create appointment directly
      const appointment = new Appointment({
        patient: patientId,
        patientName: req.user.name,
        hospital: hospitalId,
        hospitalName: hospital.name,
        date: new Date(date),
        timeSlot,
        symptoms,
        disease,
        status: 'scheduled'
      });

      await appointment.save({ session });
      return appointment;
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment: result }
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('already have')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment'
    });
  } finally {
    await session.endSession();
  }
});

// @route   GET /api/appointments
// @desc    Get user's appointments
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query
    let query = {};
    
    if (userRole === 'patient') {
      query.patient = userId;
    } else if (userRole === 'hospital') {
      query.hospital = userId;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('hospital', 'name address phone email')
      .populate('patient', 'name email phone')
      .sort({ date: -1, timeSlot: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: {
        appointments,
        total: appointments.length
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = { _id: id };

    // Ensure user can only access their own appointments
    if (userRole === 'patient') {
      query.patient = userId;
    } else if (userRole === 'hospital') {
      query.hospital = userId;
    }

    const appointment = await Appointment.findOne(query)
      .populate('hospital', 'name address phone email')
      .populate('patient', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment'
    });
  }
});

// @route   PATCH /api/appointments/:id
// @desc    Update appointment (reschedule/cancel)
// @access  Private
router.patch('/:id', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      const { id } = req.params;
      const { status, date, timeSlot } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Get current appointment
      let query = { _id: id };
      if (userRole === 'patient') {
        query.patient = userId;
      } else if (userRole === 'hospital') {
        query.hospital = userId;
      }

      const appointment = await Appointment.findOne(query).session(session);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Handle cancellation
      if (status === 'cancelled') {
        // Release the slot
        await HospitalSlot.findOneAndUpdate(
          { 
            hospital: appointment.hospital,
            date: appointment.date,
            timeSlot: appointment.timeSlot
          },
          { 
            $inc: { currentAppointments: -1 },
            isAvailable: true
          },
          { session }
        );

        // Update appointment status
        appointment.status = 'cancelled';
        await appointment.save({ session });
        return appointment;
      }

      // Handle rescheduling
      if (date && timeSlot) {
        // Check if new slot is available
        const newSlot = await HospitalSlot.findOne({
          hospital: appointment.hospital,
          date: new Date(date),
          timeSlot
        }).session(session);

        if (!newSlot || !newSlot.actuallyAvailable) {
          throw new Error('New time slot is not available');
        }

        // Release old slot
        await HospitalSlot.findOneAndUpdate(
          { 
            hospital: appointment.hospital,
            date: appointment.date,
            timeSlot: appointment.timeSlot
          },
          { 
            $inc: { currentAppointments: -1 },
            isAvailable: true
          },
          { session }
        );

        // Book new slot
        await HospitalSlot.findByIdAndUpdate(
          newSlot._id,
          { 
            $inc: { currentAppointments: 1 },
            isAvailable: newSlot.currentAppointments + 1 >= newSlot.maxAppointments ? false : newSlot.isAvailable
          },
          { session }
        );

        // Update appointment
        appointment.date = new Date(date);
        appointment.timeSlot = timeSlot;
        await appointment.save({ session });
        return appointment;
      }

      // Handle status updates (for hospitals)
      if (status && userRole === 'hospital') {
        appointment.status = status;
        await appointment.save({ session });
        return appointment;
      }

      throw new Error('Invalid update parameters');
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment: result }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('not available') || 
        error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment'
    });
  } finally {
    await session.endSession();
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Get appointment
      let query = { _id: id };
      if (userRole === 'patient') {
        query.patient = userId;
      } else if (userRole === 'hospital') {
        query.hospital = userId;
      }

      const appointment = await Appointment.findOne(query).session(session);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Release slot if appointment was scheduled
      if (appointment.status === 'scheduled') {
        await HospitalSlot.findOneAndUpdate(
          { 
            hospital: appointment.hospital,
            date: appointment.date,
            timeSlot: appointment.timeSlot
          },
          { 
            $inc: { currentAppointments: -1 },
            isAvailable: true
          },
          { session }
        );
      }

      // Delete appointment
      await Appointment.findByIdAndDelete(id).session(session);
    });

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting appointment'
    });
  } finally {
    await session.endSession();
  }
});

export default router;