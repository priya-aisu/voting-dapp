// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const candidates=require('./models/candidates');


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/votingApp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Route for creating new user
app.post('/register', async (req, res) => {
    try {
        const { name, username, dob, password,  aadhar, mobile, address, pincode,voterId } = req.body;
        
        // Validate Age (18+)
        const birthDate = new Date(dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 18) {
            return res.status(400).json({ message: "You must be at least 18 years old to sign up." });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username,
            dob,
            password:hashedPassword,  
            aadhar,
            mobile,
            address,
            pincode,
            voterId
        });

        await newUser.save()
        .then((savedUser) => {
            console.log('Saved user:', savedUser);  // Log saved user to confirm it worked
            res.status(201).json({ message: 'User created successfully', user: savedUser });
        })
        .catch((error) => {
            console.error('Error saving user:', error);
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0]; // Get the field that caused the error
                return res.status(400).json({ message: `Duplicate value for ${field}. This ${field} is already registered.` });
            }
            res.status(500).json({ message: 'Server error', error });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { username, aadhar, password } = req.body;

        // Find user by both username and aadhar
        const user = await User.findOne({ username, aadhar });

        if (!user) {
            return res.status(400).json({ message: 'Invalid username, aadhar, or password' });
        }

        // Compare the entered password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username, aadhar, or password' });
        }

        // Respond with success and user details
        res.status(200).json({
            message: 'Login successful',
            user: {
                username: user.username,
                aadhar: user.aadhar,
                pincode: user.pincode,
            },
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/register-candidate', async (req, res) => {
    try {
        const { partyName, pincode, candidateName, aadharNumber,partyID } = req.body;
        console.log('partyName',partyName);
        console.log('pincode',pincode);
        console.log('candidateName',candidateName);
        console.log('aadharNumber',aadharNumber);
        console.log('partyId',partyID);

        const exists = await candidates.findOne({ partyName, pincode });
        if (exists) {
            return res.status(400).json({ success: false, message: 'This pincode is already registered under the same party.' });
        }

        const newCandidate = new candidates({ partyName, pincode, candidateName, aadharNumber, partyID });
        await newCandidate.save();
        console.log('newCandidate',newCandidate);

        res.status(201).json({ success: true, message: 'Candidate registered successfully', candidate: newCandidate, objectId: newCandidate._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
app.get('/candidates', async (req, res) => {
    try {
        const { pincode } = req.query;

        // Find candidates matching the pincode
        const candidate = await candidates.find({ pincode });

        if (candidate.length > 0) {
            res.status(200).json(candidate);
        } else {
            res.status(404).json({ message: 'No candidates found for this pincode.' });
        }
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/candidate/:id', async (req, res) => {
    try {
        // Trim and validate the ID
        const id = req.params.id.trim();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Fetch candidate by ID
        const candidate = await candidates.findById(new mongoose.Types.ObjectId(id));

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.json(candidate);
    } catch (error) {
        console.error('Error fetching candidate:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/party-name/:partyID', async (req, res) => {
    const { partyID } = req.params;
    console.log('Received partyId:', partyID);
    try {
        const party = await candidates.findOne({ partyID: partyID });

        if (party) {
            res.json({ partyName: party.partyName });
        } else {
            res.status(404).json({ message: 'Party not found' });
        }
    } catch (error) {
        console.error('Error fetching party:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
