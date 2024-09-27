// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Spot } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie - Create the token after user login
const setTokenCookie = (res, user) => {
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

// verify and parse payload for user matching provided id
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

  // If there is no current user, return an error
const requireAuth = function (req, _res, next) {
    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
}

const authorize = async function (req, _res, next) {
  const userId = req.user.id;
  const user = await User.scope({ method: ['isOwner', userId] }).findAll();
  console.log(user);
  if (user.length > 0) return next();

  const err = new Error('Forbidden');
  err.title = 'Forbidden';
  err.errors = { message: 'Forbidden' };
  err.status = 403;
  return next(err);
}




module.exports = { setTokenCookie, restoreUser, requireAuth, authorize };