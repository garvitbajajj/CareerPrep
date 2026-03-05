const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware: require authentication for all API routes
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
}

router.use(requireAuth);

// @route   GET /api/interviews
// @desc    Get user's interview chats and scores
router.get('/interviews', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            chats: user.interviewChats || [],
            scores: user.interviewScores || [],
        });
    } catch (err) {
        console.error('Error fetching interviews:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/interviews/chats
// @desc    Save a new interview chat session
router.post('/interviews/chats', async (req, res) => {
    try {
        const { chat } = req.body;
        if (!chat) {
            return res.status(400).json({ error: 'Chat data is required' });
        }

        const user = await User.findById(req.user._id);
        user.interviewChats.push(chat);
        await user.save();

        res.json({ message: 'Chat saved successfully', totalChats: user.interviewChats.length });
    } catch (err) {
        console.error('Error saving chat:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/interviews/scores
// @desc    Save a new interview score
router.post('/interviews/scores', async (req, res) => {
    try {
        const { score } = req.body;
        if (!score) {
            return res.status(400).json({ error: 'Score data is required' });
        }

        const user = await User.findById(req.user._id);
        user.interviewScores.push(score);
        await user.save();

        res.json({ message: 'Score saved successfully', totalScores: user.interviewScores.length });
    } catch (err) {
        console.error('Error saving score:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/interviews
// @desc    Clear all interview data for the user
router.delete('/interviews', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.interviewChats = [];
        user.interviewScores = [];
        await user.save();

        res.json({ message: 'All interview data cleared' });
    } catch (err) {
        console.error('Error clearing data:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
