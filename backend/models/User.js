const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores student and admin information
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Do not send back with default queries
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    campusCode: { 
      type: String, 
      default: 'CIT25',
      required: [true, 'Campus code is required for registration']
    },

    // 🟢 CRITICAL FIX: Ensure these are mutable strings
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    whatsapp: {
      type: String,
      default: '',
      trim: true,
    },
    savedListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
    
    // 🟢 NEW: Verification Fields (Added select: false for security)
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// -------------------------------------------------------------
// Middleware: Hash Password before saving
// -------------------------------------------------------------
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password with a salt round of 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// -------------------------------------------------------------
// Schema Methods
// -------------------------------------------------------------

/**
 * Method to compare the entered password with the hashed password in the database.
 * @param {string} enteredPassword - The plain text password entered by the user.
 * @returns {boolean} - True if passwords match, false otherwise.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);