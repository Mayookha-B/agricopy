const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true
  },
  // We store the Custom Farmer ID (F-XXXXXX) provided in the form
  farmerId: {
    type: String,
    required: true,
    trim: true
  },
  complaint: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    default: "No remarks yet."
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- PRE-SAVE HOOK TO GENERATE CMPLT-XXXXXX ---
ComplaintSchema.pre('save', async function () {
  if (this.isNew) {
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const generatedId = `CMPLT-${randomDigits}`;

      // Check for collisions in the database
      const existing = await mongoose.models.Complaint.findOne({ complaintId: generatedId });
      if (!existing) {
        this.complaintId = generatedId;
        isUnique = true;
      }
    }
  }
  
});

module.exports = mongoose.model('Complaint', ComplaintSchema);