// userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uname: { type: String, },
    uphoto: { type: String, },
    // name: { type: String },
    // photo: { type: String } // You might want to store the path or URL to the user's photo
});

const UserUserDeatials = mongoose.model('UserUserDeatials', userSchema);

module.exports = UserUserDeatials ;
