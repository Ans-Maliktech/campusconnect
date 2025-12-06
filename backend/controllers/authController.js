const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: process.env.SMTP_PORT, 
    secure: process.env.SMTP_PORT == 465, 
    
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER
const signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, whatsapp } = req.body;
    const cleanPhone = phoneNumber ? String(phoneNumber).trim() : "";

    if (!name || !email || !password || cleanPhone === "") {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = Date.now() + 15 * 60 * 1000; 

    const user = await User.create({
      name, email, password, phoneNumber: cleanPhone, whatsapp: whatsapp || '',
      verificationCode, verificationCodeExpires, isVerified: false
    });

    if (user) {
      await transporter.sendMail({
        from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email',
        html: `<h3>Your Code: ${verificationCode}</h3>`
      });
      res.status(201).json({ message: 'Verification code sent', email: user.email });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email,
        phoneNumber: user.phoneNumber, role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id, name: user.name, email: user.email,
      phoneNumber: user.phoneNumber, role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password',
      html: `<h3>Reset Code: ${code}</h3>`
    });

    res.json({ message: 'Reset code sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.password = newPassword; 
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. GET ME
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 EXPORT ALL FUNCTIONS (This is likely what was missing!)
module.exports = { 
  signup, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getMe 
};