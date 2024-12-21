const User = require('../models/UserModel');
const Chat = require('../models/ChatModel');
const Message = require('../models/MessageModel');

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;
  
    (content);
    (chatId);
    // Validate input
    if (!content || !chatId) {
      ("Invalid data passed into request");
      return res.sendStatus(400);
    }
  
    const newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
  
    try {
      // Create the new message
      let message = await Message.create(newMessage);
  
      // Populate the message with necessary details
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
  
      // Update the latest message in the chat
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
  
      // Send the created message as a response
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: error.message || "Failed to create message" });
    }
  };
  

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = async (req, res) => {
  try {
    // Fetch the chat details for the given chat ID
    const chatdata = await Chat.findOne({ _id: req.params.chatId }).populate("users","name email pic");

    if (!chatdata) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Fetch all messages for the given chat ID
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email") // Populate sender details
      .populate("chat"); // Populate chat details

    // Combine chat details with messages
    const response = {
      chatDetails: chatdata,
      messages: messages,
    };

    // Send the combined response
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message || "Failed to fetch messages" });
  }
};



module.exports = {sendMessage, allMessages}