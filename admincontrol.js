// userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uuserid: { type: String, required: true, unique: true },
    upassword: { type: String, required: true },
    uname: {
        type: String,
    },
    uphoto: {
        type: String,
      
    },
    status:
    {
        type:Number,
    }
    // name: { type: String },
    // photo: { type: String } // You might want to store the path or URL to the user's photo
});

const AdminControl = mongoose.model('AdminControl', userSchema);

module.exports = AdminControl;
