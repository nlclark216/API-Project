const express = require('express');
const { check, query } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth, bookingAuth } = require('../../utils/auth');
const router = express.Router();
const { Booking, Spot } = require('../../db/models');
const { Op } = require('sequelize');


const currentDate = new Date().toISOString().slice(0, 10);


// need variable that checks and returns req start date - no req to pull from here
const validateBooking = [
    check('startDate')
        .exists({checkFalsy: true})
        .isAfter(currentDate)
        .withMessage("Start date must be in the future."),
    check('endDate')
        .isAfter(currentDate)
        .withMessage("Past bookings can't be modified."),
    check('endDate')
        .custom(async (value, {req}) => {
            if(value <= req.body.startDate){
                throw new Error('endDate cannot be on or before startDate');
            }
        }),
    handleValidationErrors
];



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

// Edit a Booking
router.put('/:bookingId', requireAuth, bookingAuth, validateBooking, async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId);

    if(!booking){
        return res.status(404).json({
            "message": "Booking couldn't be found"
          })
    }
    const { startDate, endDate } = req.body;

    const existingBooking = await Booking.findOne({
    where: {
      spotId: booking.spotId,
      startDate: {[Op.lte]: endDate},
      endDate: {[Op.gte]: startDate}
        }
    });

    if (existingBooking){
        return res.status(403).json({
          message: "Sorry, this spot is already booked for the specified dates",
          errors: {
              startDate: "Start date conflicts with an existing booking",
              endDate: "End date conflicts with an existing booking"
          }
        });
    };


    booking.startDate = startDate,
    booking.endDate = endDate;
    

    res.json(booking)
})

module.exports = [ router, validateBooking ];