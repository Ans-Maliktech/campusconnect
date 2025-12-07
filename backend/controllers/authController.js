const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); 

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================
// 1. REGISTER (Updated with Campus Code Check)
// ============================================
const signup = async (req, res) => {
    try {
        // 🟢 Get campusCode from request
        const { name, email, password, phoneNumber, whatsapp, campusCode } = req.body;
        const cleanPhone = phoneNumber ? String(phoneNumber).trim() : "";

        if (!name || !email || !password || cleanPhone === "") {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // 🟢 SECURITY CHECK: Validate Campus Code
        // Add any codes you want to allow here. Users MUST enter one of these.
        const ALLOWED_CODES = ['CIT25', 'COMSATS25', 'TEST1234']; 

        if (!campusCode || !ALLOWED_CODES.includes(campusCode.toUpperCase())) {
            return res.status(400).json({ 
                message: "Invalid Campus Access Code. Check the posters on campus for the code!" 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        const user = await User.create({
            name,
            email,
            password,
            phoneNumber: cleanPhone,
            whatsapp: whatsapp || '',
            campusCode: campusCode.toUpperCase(), // Save the code used
            verificationCode,
            verificationCodeExpires,
            isVerified: false
        });

        if (user) {
            // Response First (Fast UI)
            res.status(201).json({ 
                message: 'Verification code sent to your email', 
                email: user.email 
            });

            // Email Second (Background)
            sendEmail({
                to: email,
                subject: '🔐 Verify Your CampusConnect Account',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
                        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; text-align: center;">Welcome to CampusConnect! 🎓</h2>
                            <p style="color: #666; font-size: 16px;">Hi ${name},</p>
                            <p style="color: #666;">Please verify your email address using the code below:</p>
                            <div style="background: #eef2ff; border: 2px dashed #4f46e5; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                                <h1 style="color: #4f46e5; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
                            </div>
                            <p style="color: #999; font-size: 12px; text-align: center;">Expires in 15 minutes.</p>
                        </div>
                    </div>
                `
            });
        }
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// ============================================
// 2. LOGIN (Unchanged)
// ============================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Check Verification
            if (!user.isVerified) {
                return res.status(401).json({ 
                    message: 'Please verify your email address first.',
                    requiresVerification: true,
                    email: user.email
                });
            }

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
// 3. VERIFY EMAIL (Unchanged)
// ============================================
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Missing email or code' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

        if (user.verificationCode !== code) return res.status(400).json({ message: 'Invalid verification code' });

        if (user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            message: 'Email verified successfully!'
        });
    } catch (error) {
        console.error("❌ Verify Email Error:", error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// ============================================
// 4. FORGOT PASSWORD (Unchanged)
// ============================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Please provide an email address' });

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = code;
        user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        res.status(200).json({ 
            message: 'Password reset code sent to your email',
            email: user.email
        });

        sendEmail({
            to: email,
            subject: '🔑 Reset Your CampusConnect Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
                    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center;">Password Reset 🔐</h2>
                        <p style="color: #666;">Hi ${user.name},</p>
                        <p style="color: #666;">You requested a password reset. Use this code:</p>
                        <div style="background: #fff0f0; border: 2px dashed #ff6b6b; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #ff6b6b; margin: 0; letter-spacing: 5px;">${code}</h1>
                        </div>
                        <p style="color: #999; font-size: 12px; text-align: center;">Expires in 15 minutes.</p>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// 5. RESET PASSWORD (Unchanged)
// ============================================
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.verificationCode !== code) return res.status(400).json({ message: 'Invalid reset code' });
        if (user.verificationCodeExpires < Date.now()) return res.status(400).json({ message: 'Code expired' });

        user.password = newPassword;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// 6. GET ME (Unchanged)
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
// 7. RESEND VERIFICATION CODE (Unchanged)
// ============================================
const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Please provide email' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        res.status(200).json({ message: 'New code sent to your email' });

        sendEmail({
            to: email,
            subject: '🔐 New Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; border-radius: 10px;">
                    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center;">New Verification Code 🎓</h2>
                        <div style="background: #eef2ff; border: 2px dashed #4f46e5; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #4f46e5; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
                        </div>
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
    resendVerificationCode 
};