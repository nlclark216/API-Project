const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { requireAuth, spotAuth, bookingAuth, validateBookingDates  } = require('../../utils/auth');

const { Spot, SpotImage, Review, User, ReviewImage, Booking } = require('../../db/models');


const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateReview  = require('./reviews');
const validateBooking  = require('./bookings');

const buildQueryOptions = async (query) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = query;

  // Set default values and validate query parameters
  page = page && page >= 1 ? parseInt(page) : 1;
  size = size && size >= 1 && size <= 20 ? parseInt(size) : 20;

  const errors = {};
  if (page < 1) errors.page = "Page must be greater than or equal to 1";
  if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
  if (minLat && isNaN(minLat)) errors.minLat = "Minimum latitude is invalid";
  if (maxLat && isNaN(maxLat)) errors.maxLat = "Maximum latitude is invalid";
  if (minLng && isNaN(minLng)) errors.minLng = "Minimum longitude is invalid";
  if (maxLng && isNaN(maxLng)) errors.maxLng = "Maximum longitude is invalid";
  if (minPrice && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
  if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

  if (Object.keys(errors).length) {
    return { errors };
  }

  // Build the query options
  const queryOptions = {
    where: {},
    limit: size,
    offset: (page - 1) * size,
    include: [
      {
        model: Review,
        attributes: []
      },
      {
        model: SpotImage,
        attributes: ['url'],
        where: { preview: true },
        required: false
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgRating'],
        [sequelize.col('SpotImages.url'), 'previewImage']
      ]
    },
    group: ['Spot.id', 'SpotImages.url']
  };

  if (minLat) queryOptions.where.lat = { [Op.gte]: parseFloat(minLat) };
  if (maxLat) queryOptions.where.lat = { ...queryOptions.where.lat, [Op.lte]: parseFloat(maxLat) };
  if (minLng) queryOptions.where.lng = { [Op.gte]: parseFloat(minLng) };
  if (maxLng) queryOptions.where.lng = { ...queryOptions.where.lng, [Op.lte]: parseFloat(maxLng) };
  if (minPrice) queryOptions.where.price = { [Op.gte]: parseFloat(minPrice) };
  if (maxPrice) queryOptions.where.price = { ...queryOptions.where.price, [Op.lte]: parseFloat(maxPrice) };

  return { queryOptions, page, size };
}; 

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

router.post('/', validateSpot, requireAuth, async (req, res) => {
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

    return res.json({Spots: spots});
});
// Search with query
router.get('/api/spots', async (req, res) => {
  const { queryOptions, page, size, errors } = await buildQueryOptions(req.query);

  if (errors) {
    return res.status(400).json({
      message: "Bad Request",
      errors
    });
  }

  // Fetch spots from the database
  const spots = await Spot.findAll(queryOptions);

  // Format the response
  const formattedSpots = spots.map(spot => ({
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
    price: spot.price,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
    avgRating: parseFloat(spot.get('avgRating')).toFixed(1), // 
    previewImage: spot.get('previewImage') // 
  }));

  return res.status(200).json({
    Spots: formattedSpots,
    page,
    size
  });
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

router.post('/:spotId/images', requireAuth, spotAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

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

router.put('/:spotId', requireAuth, spotAuth, validateSpot, async (req, res) => {
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

router.delete('/:spotId', requireAuth, spotAuth, async (req, res) => {
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

router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;

    const review = await Review.findAll({
      where: { spotId: spotId },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }, {
        model: ReviewImage,
        attributes: ['id', 'url']
      }]
    })

    const spot = await Spot.findByPk(spotId);

    if(!spot){
      return res.status(404).json({
        "message": "Spot couldn't be found"
      })
    } else return res.json(review);

    
});

router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const { review, stars } = req.body;

  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);

  if(!spot){
    return res.status(404).json({
      "message": "Spot couldn't be found"
    })
  } 

  const existingReview = await Review.findOne({ 
    where: { userId: req.user.id, 
              spotId: spotId
            } 
  });

  if (existingReview) {
      return res.status(403).json({ 
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

  if(!spot){return res.status(404).json({"message": "Spot couldn't be found"});};


  if (spot.ownerId === userId){
    const ownerBooking = await Booking.findAll({
      where: { spotId: userId },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }]
    });
  return res.status(200).json(ownerBooking);
  }else {
    const simpleBooking = await Booking.findAll({
      where: { spotId: userId },
      attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt']}
    });
    return res.status(200).json(simpleBooking);
  }
})

//Create A Booking Based On spotId

  router.post('/:spotId/bookings', requireAuth, async (req, res) => {
    const { startDate, endDate } = req.body;
    const spotId = req.params.spotId;
    const userId = req.user.id;
  
    const spot = await Spot.findByPk(spotId);
  
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found"
      });
    }
  
    // Validate booking dates
    const validationErrors = await validateBookingDates(startDate, endDate, spotId);
    if (validationErrors) {
      if (validationErrors.conflict || validationErrors.paradox) {
        return res.status(403).json({ message: "Conflict", errors: validationErrors });
      }
      return res.status(400).json({ message: "Bad Request", errors: validationErrors });
    }
  
    // Ensure the user is not booking their own spot
    if (spot.ownerId !== userId) {
      const booking = await Booking.create({
        spotId,
        userId,
        startDate,
        endDate
      });
  
      return res.status(201).json({
        id: booking.id,
        spotId: booking.spotId,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      });
    }
  
    return res.status(403).json({
      message: "You cannot book your own spot"
    });

});
  



module.exports = router;