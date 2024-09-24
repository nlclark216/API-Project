const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { Spot } = require('../../db/models');

const router = express.Router();

// const { check } = require('express-validator');
// const { handleValidationErrors } = require('../../utils/validation');

router.post('/', async (req, res) => {
    const { ownerId, address, city, state, country, 
        lat, lng, name, description, price } = req.body;

    const spot = await Spot.create({ownerId, address, city, state, country, 
        lat, lng, name, description, price});

    const validSpot = {
        ownerId: spot.ownerId, 
        address: spot.address, 
        city: spot.city, 
        state: spot.state, 
        country: spot.country, 
        lat: spot.lat, 
        lng: spot.lng, 
        name: spot.name, 
        description: spot.description, 
        price: spot.price
    }

    return res.json({ spot: validSpot })
})

router.get('/', async (req, res) => {
    const spots = await Spot.findAll();

    // if(!spots){}

    return res.json({Spots: spots})
})





module.exports = router;