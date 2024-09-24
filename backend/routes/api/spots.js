const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { Spot } = require('../../db/models');

const router = express.Router();

 const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const validateSpot = [
  check('address')
    .exists({checkFalsy: true})
    .isLength({min: 2})
    .withMessage("Street address is required"),
  check('city')
  .exists({checkFalsy: true})
  .isLength({min: 2})
  .withMessage("City is required"),
  check('state')
  .exists({checkFalsy: true})
  .isLength({min: 2})
  .withMessage("State is required"),
    check('country')
  .exists({checkFalsy: true})
  .isLength({min: 2})
  .withMessage( "Country is required"),
  check('lat')
  .exists({checkFalsy: true})
  .isFloat({
    min: -90,
    max: 90})
  .withMessage("Latitude must be within -90 and 90"),
  check('lng')
  .exists({checkFalsy: true})
  .isFloat({
    min: -180,
    max: 180})
  .withMessage("Longitude must be within -180 and 180"),
  check('name')
  .exists({checkFalsy: true})
  .isLength({max: 50})
  .withMessage("Name must be less than 50 characters"),
  check('description')
  .exists({checkFalsy: true})
  .isLength({min: 1})
  .withMessage("Description is required"),
  check('price')
  .exists({checkFalsy: true})
 .isFloat({ min: 0})
  .withMessage("Price per day must be a positive number"),
    handleValidationErrors
]
router.post('/',validateSpot, async (req, res) => {
    const {address, city, state, country, 
        lat, lng, name, description, price } = req.body;

    const spot = await Spot.create({address, city, state, country, 
        lat, lng, name, description, price});

    const validSpot = {
        id: spot.id,
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

router.get('/current', async (req, res) => {
    const {user} = req;
    const spot = await Spot.findAll({
        where: {ownerId: user.id}
    })
    return res.json(spot);
})





module.exports = router;