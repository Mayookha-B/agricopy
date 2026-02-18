const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const multer = require('multer');

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// @route    POST /api/products/add
router.post('/add', auth, upload.single('image'), async (req, res) => {
  try {
    const { cropName, category, harvestDate, expiryDate, quantity, priceInINR, manualAddress, lat, lon } = req.body;

    if (!lat || !lon) return res.status(400).json({ success: false, message: "Coordinates required" });

    const newProduct = new Product({
      farmerId: req.user.id,
      cropName,
      category,
      harvestDate,
      expiryDate,
      quantity,
      priceInINR: parseFloat(priceInINR),
      manualAddress,
      image: req.file ? req.file.path : 'uploads/placeholder.jpg',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lon), parseFloat(lat)]
      }
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: "Crop listing created!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route    GET /api/products/my-inventory
// @desc     Fetch only the products belonging to the logged-in farmer
router.get('/my-inventory', auth, async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.id }).populate('farmerId', 'fullName farmerCustomId').sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory" });
  }
});

// @route    DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});


// @route    GET /api/products/all
// @desc     Fetch all products from all farmers globally
router.get('/all', async (req, res) => {
  try {
    // We find all products where quantity is greater than 0
    // We use .populate to get the Farmer's name from the User model
    const products = await Product.find({ 
      $or: [
        { unsoldQuantity: { $gt: 0 } },
        { quantity: { $gt: 0 } }
      ]
    })
    .populate('farmerId', 'name')
    .sort({ createdAt: -1 }); // Show newest products first

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching marketplace", error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmerId', 'name');
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching product details" });
  }
});

// @route    GET /api/products/filter/nearby
// @desc     Fetch products within a specific radius
router.get('/filter/nearby', async (req, res) => {
  const { lat, lon, radius } = req.query;

  try {
    // If no coordinates are provided, just return all products
    if (!lat || !lon) {
      const allProducts = await Product.find({ quantity: { $gt: 0 } }).sort({ createdAt: -1 });
      return res.json(allProducts);
    }

    const products = await Product.find({
      quantity: { $gt: 0 },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)] // [Longitude, Latitude]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      }
    }).populate('farmerId', 'fullName farmerCustomId');

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Location search failed", error: err.message });
  }
});

module.exports = router;