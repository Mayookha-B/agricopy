const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // ADD THIS LINE
const auth = require('../middleware/auth');

// @route    GET /api/orders/my-orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userRole = req.user.role; 
    let query = userRole === 'farmer' ? { farmerId: req.user.id } : { consumerId: req.user.id };

    const orders = await Order.find(query)
      .populate('productId', 'cropName category image')
      .populate('consumerId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching orders" });
  }
});

// @route    POST /api/orders/place
router.post('/place', auth, async (req, res) => {
  const { productId, farmerId, quantity, totalPrice, transactionHash, blockchainOrderId} = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const newOrder = new Order({
      consumerId: req.user.id,
      farmerId,
      productId,
      quantity,
      totalPrice,       // 2. Matches the 'required' field in Order.js
      transactionHash, // 3. Store the hash so you can track it later
      blockchainOrderId, // 4. Store the blockchain order ID for future reference
      status: 'Active' // Setting to 'Active' as per your model default
    });

    product.quantity -= quantity; 
    await product.save();
    await newOrder.save();

    res.json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (err) {
    console.error("DETAILED SERVER ERROR:", err);
    res.status(500).json({ message: "Server error during checkout" });
  }
});

router.patch('/complete/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = 'Delivered';
    await order.save();
    res.json({ message: "Order marked as delivered" });
  } catch (err) {
    res.status(500).json({ message: "Error updating order" });
  }
});

module.exports = router;