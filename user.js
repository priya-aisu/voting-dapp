// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    dob: { type: Date, required: true },
    password: { type: String, required: true },
    aadhar: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    voterId: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model('User', UserSchema);
