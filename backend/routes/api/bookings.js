const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { requireAuth, authorizeBookingOwner,validateBookingDates } = require('../../utils/auth');
const router = express.Router();
const { Booking, Spot } = require('../../db/models')




//GET Current User Bookings

router.get('/', requireAuth, async (req, res) => {
const userId = req.user.id;
const bookings = await Booking.findAll ({
    where: { userId },
    include: {
        model: Spot,
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
    }
});
return res.status(200).json(bookings)

})

//EDIT a booking
router.put('/:bookingId', requireAuth,authorizeBookingOwner, async(req, res) => {
    const {startDate, endDate} = req.body;
    const book = req.booking;
    const validationErrors = validateBookingDates(startDate, endDate);
    if (validationErrors){
        return res.status(400).json({
        message: "Bad Request", errors: validationErrors });
    }
})
module.exports = router;