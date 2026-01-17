import User from '../model/user.js';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            user = await User.create({
                name,
                email,
                password,
                phone,
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                });
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    }
];

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });

            if (user && (await user.matchPassword(password))) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error: ' + error.message });
        }
    }
];

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // In JWT-based auth, logout is handled client-side by removing the token
        // Optionally, you could maintain a blacklist of tokens in Redis
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            isAdmin: req.user.isAdmin,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

