const dotenv = require('dotenv').config();
const app = require('./app');

const port = process.env.PORT;
const server = app.listen(port,()=>{
    console.log(`Server is listening on ${port} port`);
})





const { Server } = require("socket.io");
const io = new Server(server,{
    pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST",,"PATCH","PUT"],
    // credentials: true,
  },
});
io.on('connection', (socket) => {
    console.log('a user connected to socket.io');
    socket.on('setup',(userId)=>{
      socket.join(userId);
      socket.emit("connected");
    })
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });


    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stopTyping", (room) => socket.in(room).emit("stopTyping"));

    socket.on("newMessage", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
      console.log('new message sent to all users ');
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id !== newMessageRecieved.sender._id)
      {
          console.log('sending message to '+user.name);
          socket.to(user._id).emit("messageReceived", newMessageRecieved);
        }
      });
      socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
  });

});

