const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// @route   POST /api/disputes
router.post('/', async (req, res) => {
  try {
    const { farmerId, dispute } = req.body;

    const newComplaint = new Complaint({
      farmerId: farmerId,
      complaint: dispute
      // remarks and status will use default values from schema
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      success: true,
      message: "Dispute registered successfully",
      complaintId: savedComplaint.complaintId
    });
  } catch (error) {
    console.error("Dispute Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// @route   GET /api/disputes/all
router.get('/all', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/disputes/update/:id
router.put('/update/:id', async (req, res) => {
  try {
    const { remarks, status } = req.body;
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { remarks, status },
      { new: true }
    );
    res.json(updatedComplaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;