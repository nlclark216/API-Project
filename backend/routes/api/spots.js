const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { Spot } = require('../../db/models');

const router = express.Router();

// const { check } = require('express-validator');
// const { handleValidationErrors } = require('../../utils/validation');

router.get('/', async (req, res) => {
    const spots = await Spot.findAll();

    // if(!spots){}

    return res.json({Spots: spots})
})





module.exports = router;