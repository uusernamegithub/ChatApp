const mongoose = require('mongoose');
const User = require('./UserModel');
const Chat = require('./ChatModel');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        trim: true
    },
    chat: { // Renamed from 'Chat' to 'chat' for consistency
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', MessageSchema); // Fixed method call

module.exports = Message;
