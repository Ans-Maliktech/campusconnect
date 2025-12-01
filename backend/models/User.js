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
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    whatsapp: {
      type: String,
      default: '',
    },
    savedListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// -------------------------------------------------------------
// Mongoose Middleware (Hooks)
// -------------------------------------------------------------

// Hash password before saving user
userSchema.pre('save', async function (next) {
  // CRITICAL CHECK: Only hash password if it's new or modified
  if (!this.isModified('password')) {
    return next(); // Use return to exit the middleware function cleanly
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
  // We use .compare() to safely compare the hashed password with the plaintext input.
  // Note: this.password includes 'select: false', so we must manually ensure 
  // the password field is selected during login query using .select('+password').
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);