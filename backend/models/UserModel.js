const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true
    },
    password: { type: String, required: true },
    pic: {
        type: String,
        required: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
    createdAt: {
        type: Date,
        default: Date.now // Use reference to Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Hash only if the password field is modified
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Add a method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if the password was changed after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
