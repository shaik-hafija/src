// userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uuserid: { type: String, required: true, unique: true },
    upassword: { type: String, required: true },
    // name: { type: String },
    // photo: { type: String } // You might want to store the path or URL to the user's photo
});

const AdminUserDetails = mongoose.model('AdminUserDetails', userSchema);

module.exports = AdminUserDetails;
