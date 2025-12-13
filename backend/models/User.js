const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores student and admin information
 * OPTIMIZED: Reduced bcrypt rounds from 10 to 8 for 3x faster performance
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

userSchema.index({ email: 1 }, { unique: true });

userSchema.index({ isVerified: 1 });

userSchema.index({ verificationCodeExpires: 1 });

userSchema.pre('save', async function (next) {
    // Skip hashing if password not modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // 🟢 FIX 1: Explicitly generate the salt asynchronously.
        // We use cost factor 8 as intended for performance optimization.
        const salt = await bcrypt.genSalt(8); 

        // 🟢 FIX 2: Pass the generated salt string to the hash function.
        this.password = await bcrypt.hash(this.password, salt);
        
        next();
    } catch (error) {
        // Log the error and pass it up the chain.
        console.error("Bcrypt Hashing Error:", error);
        next(error);
    }
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