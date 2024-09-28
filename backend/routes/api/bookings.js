const express = require('express');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth, bookingAuth } = require('../../utils/auth');
const router = express.Router();
const { Booking, Spot } = require('../../db/models');
const { where } = require('sequelize');

const currentDate = new Date().toISOString().slice(0, 10);

// need variable that checks and returns req start date - no req to pull from here
const validateBooking = [
    check('startDate')
        .exists({checkFalsy: true})
        .isAfter(currentDate)
        .withMessage("Start date must be in the future."),
    check('endDate')
        .exists({checkFalsy: true})
        .custom(async userId => {
            const booking = await Booking.findAll({
                where: {userId: userId}
            });
            const startDate = new Date((booking.startDate)).getTime();
            const endDate = new Date(Number(booking.endDate)).getTime();
            // currently returning strings - need integers
            if (endDate.isBefore(startDate)){
                throw new Error("End date must be after start date.")
            }
        }),
    check('endDate')
        .isAfter(currentDate)
        .withMessage("Past bookings can't be modified."),
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

module.exports = [ router, validateBooking ];