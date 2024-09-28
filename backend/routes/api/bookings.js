const express = require('express');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth, authorizeBookingOwner } = require('../../utils/auth');
const router = express.Router();
const { Booking, Spot } = require('../../db/models')
const Sequelize = require('sequelize');

const validateBooking = [
    check('startDate')
        .exists({checkFalsy: true})
        .isBefore(Sequelize.literal('CURRENT_TIMESTAMP'))
        .withMessage("Start date must be in the future."),
    check('endDate')
        .exists({checkFalsy: true})
        .isAfter('startDate')
        .withMessage("End date must be after start date."),
    check('endDate')
        .isBefore(Sequelize.literal('CURRENT_TIMESTAMP'))
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

module.exports = router;