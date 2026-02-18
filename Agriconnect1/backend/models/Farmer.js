const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FarmerSchema = new mongoose.Schema({

  // --- NEW FIELD: CUSTOM FARMER ID ---
  farmerCustomId: { 
    type: String, 
    unique: true, 
    sparse: true // Allows the field to be null until generated
  },

  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  metamaskId: {
    type: String,
    required: true,
    unique: true, // Crucial for DeFi to prevent account duplication
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  organizationName: {
    type: String
  },
  password: {
    type: String,
    required: true // In a real app, you would hash this using bcrypt
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// --- AUTOMATIC HASHING LOGIC ---
FarmerSchema.pre('save', async function () {

  const farmer = this;

  // 1. GENERATE CUSTOM ID (Only if it's a new document)
  if (farmer.isNew) {
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
      const generatedId = `F-${randomDigits}`;

      // Check for collisions
      const existing = await mongoose.models.Farmer.findOne({ farmerCustomId: generatedId });
      if (!existing) {
        farmer.farmerCustomId = generatedId;
        isUnique = true;
      }
    }
  }


  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Farmer', FarmerSchema);