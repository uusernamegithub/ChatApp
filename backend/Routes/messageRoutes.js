const express = require('express');
const {protect} = require('../Controllers/authController');
const messageController = require('../Controllers/messageController');

const messageRouter = express.Router();

messageRouter.route('/').post(protect, messageController.sendMessage);
messageRouter.route('/:chatId').get(protect, messageController.allMessages);


module.exports = messageRouter;