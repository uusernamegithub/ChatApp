const express = require('express');
const authController = require('../Controllers/authController');

const userRoutes = express.Router();

userRoutes.route('/signup').post(authController.signup);
userRoutes.route('/login').post(authController.login);
userRoutes.route('/allUsers').get(authController.protect,authController.allUsers);

module.exports = userRoutes;