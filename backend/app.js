const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const userRoutes = require('./Routes/userRoutes')
const chatRoutes = require('./Routes/chatRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const dotenv = require('dotenv').config();
const cors = require('cors');
// import path from "path";
const path = require('path');


const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

mongoose.connect(process.env.DB_STRING).then(()=>{
    console.log('Connected to DataBase');
})

const _dirname = path.resolve();

app.use('/chatApp/v1/users',userRoutes);
app.use('/chatApp/v1/chat',chatRoutes);
app.use('/chatApp/v1/message',messageRoutes);

app.use(express.static(path.join(_dirname,'/frontend/dist')));
app.get('*',(req,res)=>{
    res.sendFile(path.join(_dirname,"frontend","dist","index.html"));
})

module.exports = app;