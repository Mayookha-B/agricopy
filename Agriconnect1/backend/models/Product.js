const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  cropName: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Grains', 'Vegetables', 'Fruits'],
    default: 'Grains'
  },
  harvestDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true, min: 0 }, // Initial Total Quantity
  soldQuantity: { type: Number, default: 0, min: 0 }, // NEW: Tracks sales
  priceInINR: {
    type: Number,
    required: true, 
    min: 0,
},
  manualAddress: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  image: { type: String, default: 'uploads/placeholder.jpg' },
  status: {
    type: String,
    enum: ['Available', 'Sold Out', 'In Transit'],
    default: 'Available'
  },
  createdAt: { type: Date, default: Date.now }
});

ProductSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Product', ProductSchema);