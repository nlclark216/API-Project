// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Booking, Spot, Review } = require('../db/models');

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

//booking date validator
const validateBookingDates = async (startDate, endDate, booking) => {
  const errors = {};
  const today = new Date();
  
  // Convert input dates to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if start date is in the past
  if (start < today) {
      errors.startDate = "Start date must be in the future.";
  }
  
  // Check if end date is before start date
  if (end <= start) {
      errors.endDate = "End date must be after start date.";
  }
  
  // Check if end date is in the past
  if (end < today) {
      errors.paradox = "Past bookings can't be modified.";
  }
  
  // Check for booking conflicts
  const conflictingBooking = await Booking.findOne({
      where: {
          spotId: booking.spotId,
          [Op.or]: [
              { startDate: { [Op.lt]: endDate }, endDate: { [Op.gt]: startDate } }
          ]
      }
  });

  if (conflictingBooking) {
      errors.conflict = "Sorry, this spot is already booked for the specified dates.";
      errors.startDate = "Start date conflicts with an existing booking.";
      errors.endDate = "End date conflicts with an existing booking.";
  }

  // Return errors if any
  return Object.keys(errors).length ? errors : null;
};

// authorize Ownership
const authorizeBookingOwner = (req, res, next) => {
const { bookingId } = req.params;
const userId = req.user.id; // Assuming user ID is stored in req.user

Booking.findByPk(bookingId)
    .then(booking => {
        if (!booking) {
            return res.status(404).json({ message: "Booking couldn't be found" });
        }
        if (booking.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to edit this booking" });
        }
        req.booking = booking; // Attach booking to request for further use
        next();
    })
};

  const spotAuth = async function (req, _res, next) {
    const spot = await Spot.findOne({where: {
      id: req.params.spotId
    }});
  
    if(spot === null) return next();
  
    if (spot.ownerId === req.user.id) return next();
  
    const err = new Error('Forbidden');
    err.title = 'Forbidden';
    err.errors = { message: 'Forbidden' };
    err.status = 403;
    return next(err);
  };
  
  const reviewAuth = async function (req, _res, next) {
    const review = await Review.findOne({where: {
      id: req.params.reviewId
    }});
  
    if(review === null) return next();
  
    if (review.userId === req.user.id) return next();
  
    const err = new Error('Forbidden');
    err.title = 'Forbidden';
    err.errors = { message: 'Forbidden' };
    err.status = 403;
    return next(err);
  };




module.exports = { setTokenCookie, restoreUser, requireAuth, authorizeBookingOwner, spotAuth, reviewAuth, validateBookingDates };