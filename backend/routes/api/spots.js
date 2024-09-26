const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { requireAuth, validateBookingDates } = require('../../utils/auth');

const { Spot, SpotImage, Review, Booking } = require('../../db/models');

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
];

router.post('/',validateSpot, async (req, res) => {
    const {address, city, state, country, 
        lat, lng, name, description, price } = req.body;

    const {user} = req;

    const spot = await Spot.create({address, city, state, country, 
        lat, lng, name, description, price, ownerId: user.id});

    const validSpot = {
        id: spot.id,
        ownerId: user.id, 
        address: spot.address, 
        city: spot.city, 
        state: spot.state, 
        country: spot.country, 
        lat: spot.lat, 
        lng: spot.lng, 
        name: spot.name, 
        description: spot.description, 
        price: spot.price
    };

    return res.json({ spot: validSpot });
});

router.get('/', async (req, res) => {
    const spots = await Spot.findAll();

    // if(!spots){}

    return res.json({Spots: spots})
});

router.get('/current', requireAuth, async (req, res) => {
    const {user} = req;
    const spot = await Spot.findAll({
        where: {ownerId: user.id}
    })
    return res.json(spot);
});

router.get('/:spotId', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if(!spot) res.status(404).json({
        "message": "Spot couldn't be found"
      })
    return res.json(spot);
});

router.post('/:spotId/images', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if(!spot){
      return res.status(404).json({
        "message": "Spot couldn't be found"
      })
    };

    const { url, preview } = req.body;
    const img = await SpotImage.create({
      url: url,
      preview: preview,
      spotId: spot.id
    });
    
    return res.json({
      id: img.id,
      url: img.url,
      preview: img.preview
    });
});

router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  const spot = await Spot.findByPk(req.params.spotId);

  if(!spot){
    return res.status(404).json({
      "message": "Spot couldn't be found"
    })
  }

  if(spot.ownerId === req.user.id){
      {
      spot.address = address,
      spot.city = city,
      spot.state = state,
      spot.country = country,
      spot.lat = lat,
      spot.lng = lng,
      spot.name = name,
      spot.description = description,
      spot.price = price
    }
    return res.json(spot)
  } else {
      return res.status(400).json({
      message: 'User not authorized'
    }
  )}
});

router.delete('/:spotId', requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const spot  = await Spot.findByPk(spotId);
  const { user } = req;

  if(!spot || !spot.ownerId){
    return res.status(404).json({
      "message": "Spot couldn't be found"
    })
  }

  if(spot.ownerId === user.id){

    await spot.destroy();

    return res.json({
      "message": "Successfully deleted"
    })
  } else {
    return res.status(404).json({
      "message": "Spot does not belong to user"
    })
  }
});

router.get('/:spotId/reviews', requireAuth, async (req, res) => {
    const { spotId } = req.params;

    const review = await Review.findAll({
      where: { spotId: spotId }
    })

    const spot = await Spot.findByPk(spotId);

    if(!spot){
      return res.status(404).json({
        "message": "Spot couldn't be found"
      })
    } else return res.json(review);

    
});

router.post('/:spotId/reviews', requireAuth, async (req, res) => {
  const { review, stars } = req.body;

  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);

  if(!spot){
    return res.status(404).json({
      "message": "Spot couldn't be found"
    })
  } 

  if (!review) {
    return res.status(400).json({ 
      message: "Bad Request", 
      errors: { review: "Review text is required" } 
    });
  }

  if (!stars) {
    return res.status(400).json({ 
      message: "Bad Request", 
      errors: { 
        stars: "Stars must be an integer from 1 to 5" 
      } 
    });
  }

  const existingReview = await Review.findOne({ 
    where: { userId: req.user.id, 
              spotId: spotId
            } 
  });

  if (existingReview) {
      return res.status(500).json({ 
        message: "User already has a review for this spot" 
      });
  }

  const newReview = await Review.create({ 
    userId: req.user.id, 
    spotId: spotId, 
    review: review, 
    stars: stars 
  });
  return res.status(201).json(newReview);
});

//Get All Bookings Based on SpotId
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
const {spotId} = req.params;
const userId = req.user.id;

const spot = await Spot.findByPk(spotId);
if(!spot){return res.status(404).json({"message": "Spot couldn't be found"});}
const bookings = await Booking.findAll({where: {spotId}});
if (spot.ownerId === userId){
const userBookings = bookings.map (booking => ({
  User: {
    id: booking.userId,
    firstName: booking.user.firstName,
    lastName: booking.user.lastName
  },
  id:booking.id,
  spotId: booking.spotId,
  userId:booking.userId,
  startDate: booking.startDate,
  endDate: booking.endDate,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt
}));
return res.status(200).json(userBookings);
}else {
  const simpleBookings = bookings.map(booking => ({
    spotId: booking.spotId,
    startDate: booking.startDate,
    endDate: booking.endDate
  }));
  return res.status(200).json(simpleBookings);
}
})
//Create A Booking Based On spotId

router.post('/:spotId/bookings', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.body;
  const spotId = req.params.spotId;
  const userId = req.user.id;
  const spot = await Spot.findByPk(spotId);
  const validationErrors = validateBookingDates(startDate, endDate);
  const existingBooking = await Booking.findOne({
    where: {
      spotId,
      [Op.or]: [
        {startDate: {[Op.lte]: endDate}},
        {endDate: {[Op.gte]: startDate}}
      ]
    }
  })

  if (!spot){
    return res.status(404).json({
     message: "Spot couldn't be found" });
}
  if (validationErrors){
    return res.status(400).json({
    message: "Bad Request", errors: validationErrors });
}
if (existingBooking){
  return res.status(403).json({
    message: "Sorry, this spot is already booked for the specified dates",
    errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking"
    }
  });
}
const booking = await Booking.create({spotId,userId,startDate,endDate});

return res.status(201).json({
  id: booking.id,
  spotId: booking.spotId,
  userId: booking.userId,
  startDate: booking.startDate,
  endDate: booking.endDate,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt
});

})
  



module.exports = router;