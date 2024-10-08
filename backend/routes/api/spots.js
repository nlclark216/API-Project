const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { requireAuth, spotAuth } = require('../../utils/auth');

const { Spot, SpotImage, Review, User, ReviewImage, Booking, sequelize, Sequelize } = require('../../db/models');




const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateReview  = require('./reviews');
const validateBooking = require('./bookings');


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
  const spots = await Spot.findAll({
    attributes: {
      include: [
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating'],
        [Sequelize.col('SpotImages.url'), 'previewImage']

      ]
    },
    include: [
      {
        model: Review, 
        attributes: []
      },
      {
        model: SpotImage,
        attributes: []
      }
    ],
    group: ['Spot.id', 'SpotImages.url'] 
  });

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
    avgRating: spot.get('avgRating') ? +parseFloat(spot.get('avgRating')).toFixed(1) : null,
    previewImage: spot.get('previewImage') || null
  }));

  return res.status(200).json({
    Spots: formattedSpots});
  // return res.json({Spots: spots});
});

router.get('/current', requireAuth, async (req, res) => {
    const {user} = req;
    const spot = await Spot.findAll({
        where: {ownerId: user.id},
        attributes: {
          include: [
            [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating'],
            [Sequelize.col('SpotImages.url'), 'previewImage']
          ]
        },
        include: [
          {
            model: Review, 
            attributes: ['stars']
          },
          {
            model: SpotImage,
            attributes: ['url']
          }
        ]
    });

    let Spots = [];
    spot.map((s) => {
      Spots.push(s.toJSON())
    });

    const formattedSpots = Spots.map(spot => ({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: parseFloat(spot.lat),
      lng: parseFloat(spot.lng),
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      avgRating: spot.avgRating,
      previewImage: spot.previewImage // 
    }));

    return res.json(formattedSpots);
});

router.get('/:spotId', async (req, res) => {
    const { spotId } = req.params;
    const spot = await Spot.findByPk(spotId,
    { 
      attributes: {
        include: [
          [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating'],
          [Sequelize.fn('COUNT', Sequelize.col('Reviews.id')), 'numReviews']
        ]
      },
    include: [
      { 
        model: SpotImage,
        attributes: ['id', 'url', 'preview']
      }, 
      {
        model: User,
        as: 'Owner',
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: Review,
        attributes: ['stars']
      }
    ]
    });


    if(!spot) res.status(404).json({
        "message": "Spot couldn't be found"
      });

    const formattedSpots = 
      {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: parseFloat(spot.lat),
        lng: parseFloat(spot.lng),
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: spot.get('avgRating') ? +parseFloat(spot.get('avgRating')).toFixed(1) : null,
        numReviews: spot.get('numReviews') ? +parseFloat(spot.get('numReviews')).toFixed(1) : null,
        SpotImages: spot.SpotImages,
        Owner: spot.Owner
      };

    
    return res.json(formattedSpots);
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
  const spotId = req.params.spotId;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);

  if(!spot){return res.status(404).json({"message": "Spot couldn't be found"});};


  if (spot.ownerId === userId){
    const ownerBooking = await Booking.findAll({
      where: { spotId: spotId },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }]
    });
    return res.status(200).json(ownerBooking);
  }else {
    const simpleBooking = await Booking.findAll({
      where: { spotId: spotId },
      attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt']}
    });
    return res.status(200).json(simpleBooking);
  }

})

//Create A Booking Based On spotId
router.post('/:spotId/bookings', requireAuth, validateBooking, async (req, res) => {

  const { startDate, endDate } = req.body;
  if(startDate >= endDate){
    return res.status(400).json({
      errors: { endDate: "endDate cannot be on or before startDate" }
    })
  };
  const spotId = req.params.spotId;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);

  if (!spot){
    return res.status(404).json({
     message: "Spot couldn't be found" });
  };

  const existingBooking = await Booking.findOne({
    where: {
      spotId: spotId,
      startDate: {[Op.lte]: endDate},
      endDate: {[Op.gte]: startDate}
      
    }
  });

  if (existingBooking){
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking"
      }
    });
  };

  if(spot.ownerId !== userId){
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
  };

});
  



module.exports = router;