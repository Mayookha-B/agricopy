const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true }, // Total ETH paid
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Delivered', 'Cancelled'], 
    default: 'Active' 
  },
  transactionHash: { type: String }, // For DeFi/Blockchain tracking
  blockchainOrderId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);