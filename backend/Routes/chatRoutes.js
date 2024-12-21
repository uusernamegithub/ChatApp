const express = require('express');
const {protect} = require('../Controllers/authController');
const chatController = require('../Controllers/chatController')

const chatRouter = express.Router();

chatRouter.route('/').post(protect, chatController.accessChats);
chatRouter.route('/').get(protect, chatController.fetchChats);
chatRouter.route("/group").post(protect, chatController.createGroupChat);
chatRouter.route("/group/rename").patch(protect, chatController.renameGroup);
chatRouter.route("/group/remove").put(protect, chatController.removeFromGroup);
chatRouter.route("/group/add").patch(protect, chatController.addToGroup);

module.exports = chatRouter;