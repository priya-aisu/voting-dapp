
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    partyName: String,
    pincode: String,
    candidateName: String,
    aadharNumber: String,
    partyID: Number,
}, { timestamps: true });

module.exports = mongoose.model('candidates', candidateSchema);