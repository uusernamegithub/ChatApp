const User = require('../models/UserModel');
const Chat = require('../models/ChatModel');

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChats = async (req, res) => {
  const userId_1 = req.body.userId;
  const userId_2 = req.user._id;

  // Validate inputs
  if (!userId_1) {
    return res.status(400).json({ message: "UserId parameter is required" });
  }

  try {
    // Try to find an existing one-on-one chat between the two users
    let chat;
    try {
      chat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [userId_1, userId_2] }, // Ensure both users exist in the chat
      })
        .populate("users", "-password") // Populate user details excluding passwords
        .populate("latestMessage");
    } catch (findError) {
      console.error("Error while querying the chat:", findError);
      return res.status(500).json({ message: "Failed to query the chat" });
    }

    // If chat exists, populate the latest message sender details and return it
    if (chat) {
      try {
        chat = await User.populate(chat, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
      } catch (populateError) {
        console.error("Error while populating latest message sender:", populateError);
        return res.status(500).json({ message: "Failed to populate chat details" });
      }
      return res.status(200).json(chat); // Return the existing chat
    }

    // If no existing chat, create a new one
    let fullChat;
    try {
      const chatData = {
        chatName: "sender", // Placeholder for the chat name
        isGroupChat: false,
        users: [userId_1, userId_2],
      };

      const newChat = await Chat.create(chatData);
      fullChat = await Chat.findById(newChat._id).populate("users", "-password");
    } catch (createError) {
      console.error("Error while creating a new chat:", createError);
      return res.status(500).json({ message: "Failed to create a new chat" });
    }

    return res.status(201).json(fullChat); // Return the new chat
  } catch (error) {
    console.error("Unexpected error in accessChats function:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = async (req, res) => {
  try {
    // Find all chats where the user is a participant
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password") // Populate users but exclude their passwords
      .populate("groupAdmin", "-password") // Populate group admin details
      .populate("latestMessage") // Populate the latest message
      .sort({ updatedAt: -1 }); // Sort by the most recently updated chats

    // Populate the sender details of the latest message
    const populatedChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    // Send the response
    res.status(200).json(populatedChats);
  } catch (error) {
    // Handle errors and send appropriate response
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: error.message || "Failed to fetch chats" });
  }
};

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = async (req, res) => {
  // Validate input
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }
  (req.body);
  let users = req.body.users;

  // Ensure there are at least two users in the group
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // Add the current user to the group
  users.push(req.user);

  try {
    // Create the group chat
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // Fetch and populate the group chat
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password") // Exclude password from user details
      .populate("groupAdmin", "-password"); // Exclude password from groupAdmin details

    // Return the newly created group chat
    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ message: error.message || "Failed to create group chat" });
  }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    // Find and update the chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true } // This makes sure the updated document is returned
    )
      .populate("users", "-password") // Exclude password from user details
      .populate("groupAdmin", "-password"); // Exclude password from groupAdmin details

    // Check if chat was found
    if (!updatedChat) {
      return res.status(404).json({ message: "Chat Not Found" });
    }

    // Return the updated chat
    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error renaming group:", error);
    res.status(500).json({ message: error.message || "Failed to rename group" });
  }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
  (req.body);
  const { chatId, userId } = req.body;

  try {
    // Find and update the chat, pulling the user from the users array
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },  // Remove the user from the chat's users array
      },
      { new: true }
    )
      .populate("users", "-password") // Exclude password from user details
      .populate("groupAdmin", "-password"); // Exclude password from groupAdmin details

    // Check if the chat was found and updated
    if (!removed) {
      return res.status(404).json({ message: "Chat Not Found" });
    }

    // Return the updated chat with the user removed
    res.status(200).json(removed);
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(500).json({ message: error.message || "Failed to remove user from group" });
  }
};


// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    // Add the user to the chat's users array
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },  // Push the user to the users array
      { new: true }
    )
      .populate("users", "-password")  // Exclude password from user details
      .populate("groupAdmin", "-password");  // Exclude password from groupAdmin details

    // Check if the chat was found and updated
    if (!added) {
      return res.status(404).json({ message: "Chat Not Found" });
    }

    // Return the updated chat with the user added
    res.status(200).json(added);
  } catch (error) {
    console.error("Error adding user to group:", error);
    res.status(500).json({ message: error.message || "Failed to add user to group" });
  }
};



  module.exports = {accessChats, fetchChats, createGroupChat, renameGroup, removeFromGroup,addToGroup };