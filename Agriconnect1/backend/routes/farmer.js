const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');



// POST route for Registration


router.post('/register', async (req, res) => {
  try {
    // Inside Farmer Register Route
    const newFarmer = new Farmer(req.body);
    const savedFarmer = await newFarmer.save();
    res.status(201).json({
      message: "Farmer registered successfully !",
      // Send the custom ID back to the frontend
      farmerCustomId: savedFarmer.farmerCustomId,
      farmerId: savedFarmer._id
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      message: "Registration failed. Check if Email or MetaMask ID already exists."
    });
  }
});


// @route   POST /api/farmer/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if farmer exists
    const farmer = await Farmer.findOne({ email });
    if (!farmer) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 2. Compare Password (assuming you hash it during registration)
    // For now, if you haven't implemented hashing yet, use: if (password !== farmer.password)
    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 3. Create JWT Payload
    const payload = {
      id: farmer.id,
      farmerCustomId: farmer.farmerCustomId, // Your new F-123456 ID
      metamaskId: farmer.metamaskId,
      role: 'farmer' // Adding role is very helpful for DeFi apps
    };

    // 4. Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123', // Store this in your .env file
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          message: "Login Successful",
          farmerName: farmer.fullName 
        });
      }
    );
  } catch (err) {
    res.status(500).send('Server error');
  }
});



module.exports = router;