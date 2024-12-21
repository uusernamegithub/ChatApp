const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const signup = async (req, res) => {
    try {
        // Extracting data from request body
        (req.body);
        const { name, email, password, pic } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        // Create the user
        const userDetails = await User.create({
            name,
            email,
            password, 
            pic
        });

         // Generate token if everything is fine
         const token = jwt.sign(
            { id: userDetails._id }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXP_TIME }
        );

        res.status(201).json({
            message:'User Created Succesful',
            body:{
                user: userDetails,
                token: token
            }
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Error occurred while creating user.", error: error.message });
    }
};

const login = async(req,res) => {
    try {
        (req.body);
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email or password is missing' });
        }

        // Check if the user exists
        const user = await User.findOne({ email: email });

        // If user does not exist or password is incorrect
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token if everything is fine
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXP_TIME }
        );

        // Send the response with the user data and token
        res.status(200).json({
            status: 'success',
            data: {
                user: user,
                token: token
            }
        });
    } catch (err) {
        // If an error occurs, send a response with status code 400 and the error message
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
    

const protect = async(req,res,next) => {
    let token;

    // 1) Getting token and checking if it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        (token);
    }

    if (!token) {
        return res.status(401).json({ message: 'JSON token is missing' });
    }

    try {
        // 2) Verifying token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ message: 'The user belonging to this token does no longer exist.' });
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({ message: 'The user belonging to this token has recently changed their password.' });
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    } catch (err) {
        return res.status(401).json({ message:err.message });
    }
}

const allUsers = async (req, res) => {
    try {
        // Fetch all users and select only the required fields
        (req.user);
        const users = await User.find({}, 'name email pic');

        // Send the response with the user data
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        // Handle any errors during the process
        console.error(error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching users",
            error: error.message
        });
    }
};

module.exports = { signup, login, protect, allUsers};

