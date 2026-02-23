const mongoose = require('mongoose');

const upcomingHarvestSchema = new mongoose.Schema({
  // If your model is named 'Farmer', change 'User' to 'Farmer'
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true }, 
  cropName: { type: String, required: true },
  category: { type: String, required: true },
  expectedHarvestDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  priceInINR: { type: Number, required: true },
  manualAddress: { type: String, required: true },
  image: { type: String, default: 'uploads/placeholder.jpg' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  status: { type: String, default: 'Growing' }
}, { timestamps: true });

const UpcomingHarvest = mongoose.model('UpcomingHarvest', upcomingHarvestSchema);
module.exports = UpcomingHarvest;