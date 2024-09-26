const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Booking, Spot } = require('../../db/models')


//Get Current User Bookings

router.get('/', requireAuth, async (req, res) => {
const userId = req.user.id;
const bookings = await Booking.findAll ({
    where: { userId },
    include: {
        model: Spot, // Assuming Spot is a defined model
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
    }
});
return res.status(200).json(bookings)

})