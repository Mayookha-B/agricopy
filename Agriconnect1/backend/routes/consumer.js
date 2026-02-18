const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Consumer = require('../models/Consumer'); // Ensure the path to your model is correct

// @route   POST /api/consumer/register
// @desc    Register a new consumer
// @access  Public
router.post('/register', async (req, res) => {
  const { fullName, email, metamaskId, phoneNumber, address, password } = req.body;

  try {
    // 1. Check if consumer already exists (by email or wallet ID)
    let consumer = await Consumer.findOne({ 
      $or: [{ email }, { metamaskId }] 
    });

    if (consumer) {
      return res.status(400).json({ 
        message: 'Consumer already exists with this email or MetaMask ID' 
      });
    }

    // 2. Create new instance
    consumer = new Consumer({
      fullName,
      email,
      metamaskId,
      phoneNumber,
      address,
      password // Note: In production, hash this password using bcrypt
    });

    // 3. Save to MongoDB
    await consumer.save();

    res.status(201).json({
      success: true,
      message: 'Consumer registered successfully',
      data: {
        id: consumer._id,
        fullName: consumer.fullName,
        email: consumer.email
      }
    });

  } catch (err) {
    console.error('Error in Consumer Register:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server Error during registration' 
    });
  }
});



// @route   POST /api/consumer/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if consumer exists
    const consumer = await Consumer.findOne({ email });
    if (!consumer) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 2. Compare Hashed Password
    const isMatch = await bcrypt.compare(password, consumer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 3. Create JWT Payload (Role is set to 'consumer')
    // --- PAYLOAD WITH CUSTOM ID ---
    const payload = {
      id: consumer.id,
      consumerCustomId: consumer.consumerCustomId, // The C-XXXXXX ID
      role: 'consumer'
    };

    // 4. Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          message: `Welcome back, ${consumer.fullName}`,
          role: 'consumer'
        });
      }
    );
  } catch (err) {
    res.status(500).send('Server error');
  }
});



module.exports = router;