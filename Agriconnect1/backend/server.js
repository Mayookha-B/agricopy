const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // To store your MongoDB URI securely

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON data

// 1. Connect to MongoDB
// Replace 'YOUR_MONGODB_URI' with your actual Atlas connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/agriconnect';

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// 2. Import the Model
const Farmer = require('./models/Farmer'); 

const Consumer = require('./models/Consumer'); // Import the new model

// server.js
const farmerRoutes = require('./routes/farmer');
const consumerRoutes = require('./routes/consumer');
const productRoutes = require('./routes/productRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/farmer', farmerRoutes);
app.use('/api/consumer', consumerRoutes);
// server.js
app.use('/api/products', productRoutes);

// Make uploads folder static so React can display images
app.use('/uploads', express.static('uploads'));

app.use('/api/disputes', disputeRoutes);
app.use('/api/orders', orderRoutes);
// 3. Registration Route
app.post('/api/farmer/register', async (req, res) => {
  try {
    const newFarmer = new Farmer(req.body);
    await newFarmer.save();
    res.status(201).json({ message: "Farmer registered successfully!" });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Email or MetaMask ID already registered." });
    } else {
      res.status(500).json({ message: "Server error during registration." });
    }
  }
});


// Consumer Registration Route
app.post('/api/consumer/register', async (req, res) => {
  try {
    const newConsumer = new Consumer(req.body);
    await newConsumer.save();
    res.status(201).json({ message: "Consumer account created successfully!" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Email or MetaMask ID already in use." });
    } else {
      res.status(500).json({ message: "Error creating consumer account." });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));