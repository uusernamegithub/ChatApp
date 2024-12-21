const mongoose = require('mongoose');
const User = require('./UserModel');
const Message = require('./MessageModel'); 

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Reference the model name as a string
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId, // Fix the typo
        ref: 'Message' // Ensure Message is correctly defined or imported
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference the model name as a string
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model('Chat', chatSchema); // Use the correct schema
module.exports = Chat;
