// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Log in
router.post(
    '/',
    async (req, res, next) => {
      const { credential, password } = req.body;

      if(!credential){
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = { "credential": "Email or username is required" };
        return next(err);
      }

      if(!password){
        const err = new Error("Validation error");
        err.status = 400;
        err.errors = { "password": "Password is required" };
        return next(err);
      }
  
      const user = await User.unscoped().findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });
  
      if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { "message": "Invalid credentials" };
        return next(err.errors);
      }
  
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };
  
      await setTokenCookie(res, safeUser);
  
      return res.json({
        user: safeUser
      });
    }
  );

// Log out
router.delete('/', (_req, res) => {
      res.clearCookie('token');
      return res.json({ message: 'success' });
    }
  );

// Restore session user
router.get('/', (req, res) => {
    const { user } = req;
    if (user) {
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };
      console.log(safeUser);
      return res.json({
        user: safeUser
      });
    } else return res.json({ user: null });
  }
);

module.exports = router;