const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// ============================================
// 🟢 FIX #1: OPTIMIZED EMAIL CONFIGURATION
// ============================================
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // 🟢 CRITICAL: Reduced timeouts for fast failure
    connectionTimeout: 5000,   // 5 seconds to connect
    greetingTimeout: 5000,     // 5 seconds for initial greeting
    socketTimeout: 5000,       // 5 seconds for socket inactivity
    // 🟢 Enable connection pooling (reuse connections)
    pool: true,
    maxConnections: 5,
    maxMessages: 10,
    // TLS options
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter on startup (helps catch config errors early)
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================
// 🟢 FIX #2: NON-BLOCKING EMAIL HELPER
// ============================================
/**
 * Send email asynchronously without blocking the response
 * @param {Object} mailOptions - Email configuration
 * @returns {Promise} - Promise that resolves/rejects independently
 */
const sendEmailAsync = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        // Don't throw - just log the error
        // In production, you'd send this to a logging service (Sentry, LogRocket, etc.)
        return null;
    }
};

// ============================================
// 1. REGISTER (FIXED - NON-BLOCKING)
// ============================================
const signup = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, whatsapp } = req.body;
        const cleanPhone = phoneNumber ? String(phoneNumber).trim() : "";

        // Validation
        if (!name || !email || !password || cleanPhone === "") {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Create user in database
        const user = await User.create({
            name,
            email,
            password,
            phoneNumber: cleanPhone,
            whatsapp: whatsapp || '',
            verificationCode,
            verificationCodeExpires,
            isVerified: false
        });

        if (user) {
            // 🟢 CRITICAL FIX: Send response IMMEDIATELY (don't wait for email)
            res.status(201).json({ 
                message: 'Verification code sent to your email', 
                email: user.email 
            });

            // 🟢 Send email AFTER response (non-blocking)
            // This happens in the background
            sendEmailAsync({
                from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Verify Your CampusConnect Account',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                        <div style="background: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to CampusConnect! 🎓</h2>
                            <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                            <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for joining CampusConnect. Please verify your email address using the code below:</p>
                            <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                                <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
                            </div>
                            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">This code expires in 15 minutes.</p>
                            <p style="color: #999; font-size: 14px; text-align: center;">If you didn't create this account, please ignore this email.</p>
                        </div>
                    </div>
                `
            });
        }
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: 'Server error during signup. Please try again.' });
    }
};

// ============================================
// 2. LOGIN (FIXED - VERIFICATION CHECK)
// ============================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            // 🟢 CRITICAL: Block login if not verified
            if (!user.isVerified) {
                return res.status(401).json({ 
                    message: 'Please verify your email address first. Check your inbox for the verification code.',
                    requiresVerification: true,
                    email: user.email
                });
            }

            // Success - return user data with token
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ============================================
// 3. VERIFY EMAIL
// ============================================
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validation
        if (!email || !code) {
            return res.status(400).json({ message: 'Please provide email and verification code' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Check if code matches and hasn't expired
        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // Verify user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        // Return user data with token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("❌ Verify Email Error:", error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// ============================================
// 4. FORGOT PASSWORD (FIXED - NON-BLOCKING)
// ============================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        // Generate reset code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = code;
        user.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // 🟢 CRITICAL FIX: Send response IMMEDIATELY
        res.status(200).json({ 
            message: 'Password reset code sent to your email',
            email: user.email
        });

        // 🟢 Send email AFTER response (non-blocking)
        sendEmailAsync({
            from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔑 Reset Your CampusConnect Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <div style="background: white; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request 🔐</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Use the code below to proceed:</p>
                        <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${code}</h1>
                        </div>
                        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">This code expires in 15 minutes.</p>
                        <p style="color: #ff6b6b; font-size: 14px; text-align: center; font-weight: bold;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

// ============================================
// 5. RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Validation
        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Please provide email, code, and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify code
        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

// ============================================
// 6. GET ME (CURRENT USER)
// ============================================
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        console.error("❌ Get Me Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// 🟢 BONUS: RESEND VERIFICATION CODE
// ============================================
const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate new code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        // Send response immediately
        res.status(200).json({ message: 'New verification code sent to your email' });

        // Send email in background
        sendEmailAsync({
            from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 New Verification Code - CampusConnect',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <div style="background: white; padding: 30px; border-radius: 8px;">
                        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">New Verification Code 🎓</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">Here's your new verification code:</p>
                        <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                            <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
                        </div>
                        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">This code expires in 15 minutes.</p>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error("❌ Resend Code Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    signup, 
    login, 
    verifyEmail, 
    forgotPassword, 
    resetPassword, 
    getMe,
    resendVerificationCode  // Export the new function
};