const express = require('express');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth, bookingAuth, validateBookingDates } = require('../../utils/auth');
const router = express.Router();
const { Booking, Spot } = require('../../db/models');
const { where } = require('sequelize');

const currentDate = new Date().toISOString().slice(0, 10);

// need variable that checks and returns req start date - no req to pull from here


//Get Current User Bookings
router.get('/current', requireAuth, async (req, res) => {
    const bookings = await Booking.findAll ({
        where: { userId: req.user.id },
        include: {
            model: Spot,
            attributes: {exclude: ['createdAt', 'updatedAt']}
        }
    });
    return res.status(200).json(bookings);
})
//EDIT a booking
router.put('/:bookingId', bookingAuth, requireAuth, async (req, res) => {
    const { startDate, endDate } = req.body;
    const bookingId = req.params.bookingId;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
    }
    const validationErrors = await validateBookingDates(startDate, endDate, booking);
    if (validationErrors) {
        if (validationErrors.conflict || validationErrors.paradox) {
            return res.status(403).json({ message: "Conflict", errors: validationErrors });
        }
        return res.status(400).json({ message: "Bad Request", errors: validationErrors });
    }
    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();
    return res.status(200).json(booking);
});
// DELETE a booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;
  
    try {
      const booking = await Booking.findByPk(bookingId, {
        include: {
          model: Spot,
          attributes: ['ownerId']
        }
      });
  
      if (!booking) {
        return res.status(404).json({
          message: "Booking couldn't be found"
        });
      }
  
      // Check if the booking belongs to the current user or the spot belongs to the current user
      if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
        return res.status(403).json({
          message: "You are not authorized to delete this booking"
        });
      }
  
      // Check if the booking has already started
      if (new Date(booking.startDate) <= new Date()) {
        return res.status(403).json({
          message: "Bookings that have been started can't be deleted"
        });
      }
  
      await booking.destroy();
  
      return res.status(200).json({
        message: "Successfully deleted"
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while trying to delete the booking"
      });
    }
  });
  
module.exports = [ router, validateBookingDates ];