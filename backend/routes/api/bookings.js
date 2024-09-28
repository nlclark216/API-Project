const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { requireAuth, authorizeBookingOwner } = require('../../utils/auth');
const router = express.Router();
const { Booking, Spot } = require('../../db/models')


//Get Current User Bookings

router.get('/current', requireAuth, async (req, res) => {
   
const bookings = await Booking.findAll ({
    where: { userId: req.user.id },
    include: {
        model: Spot,
        attributes: {exclude: ['createdAt', 'updatedAt']}
    }
});
return res.status(200).json(bookings)

})

module.exports = router;