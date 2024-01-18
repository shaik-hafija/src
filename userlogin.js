// userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uuserid: { type: String, },
    upassword: { type: String, },
    // name: { type: String },
    // photo: { type: String } // You might want to store the path or URL to the user's photo
});

const Userlogin = mongoose.model('Userlogin', userSchema);

module.exports = Userlogin;
