// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Booking, Spot, Review } = require('../db/models');
const { Op } = require('sequelize');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );
  
    const isProduction = process.env.NODE_ENV === "production";
  
    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });
  
    return token;
  };

  const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;
  
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }
  
      try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      } catch (e) {
        res.clearCookie('token');
        return next();
      }
  
      if (!req.user) res.clearCookie('token');
  
      return next();
    });
  };
  
 // If Authentication Required:
const requireAuth = function (req, _res, next) {
    if (req.user) return next();
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
}

const spotAuth = async function (req, res, next) {
  const spot = await Spot.findOne({where: {
    id: req.params.spotId
  }});

  if(spot === null) return res.status(404).json({
    message: "Spot couldn't be found"
  });

  if (spot.ownerId === req.user.id) return next();

  return res.status(403).json({ message: 'Forbidden' });
};

const reviewAuth = async function (req, _res, next) {
  const review = await Review.findOne({where: {
    id: req.params.reviewId
  }});

  if(review === null) return res.status(404).json({
    message: "Review couldn't be found"
  });

  if (review.userId === req.user.id) return next();

  return res.status(403).json({ message: 'Forbidden' });
};

const bookingAuth = async function (req, res, next) {
  const booking = await Booking.findOne({where: {
    id: req.params.bookingId
  }});

  if(booking === null) return next();

  if (booking.userId === req.user.id) return next();

  return res.status(403).json({ message: 'Forbidden' });
};




module.exports = { setTokenCookie, restoreUser, requireAuth, spotAuth, reviewAuth, bookingAuth };