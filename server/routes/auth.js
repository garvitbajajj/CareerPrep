const express = require('express');
const passport = require('passport');
const router = express.Router();

// @route   GET /auth/google
// @desc    Start Google OAuth flow
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login-failed' }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    }
);

// @route   GET /auth/logout
// @desc    Logout user and destroy session
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to destroy session' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        });
    });
});

// @route   GET /auth/current-user
// @desc    Get current logged-in user
router.get('/current-user', (req, res) => {
    if (req.user) {
        res.json({
            id: req.user._id,
            googleId: req.user.googleId,
            displayName: req.user.displayName,
            email: req.user.email,
            avatar: req.user.avatar,
        });
    } else {
        res.json(null);
    }
});

// @route   GET /auth/login-failed
// @desc    Login failure redirect
router.get('/login-failed', (req, res) => {
    res.status(401).json({ error: 'Google authentication failed' });
});

module.exports = router;
