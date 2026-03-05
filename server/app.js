const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy in production (Vercel, Render, etc.)
if (isProduction) {
    app.set('trust proxy', 1);
}

// --------------- Middleware ---------------
app.use(express.json());
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// --------------- Session ---------------
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'fallback-secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions',
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
        },
    })
);

// --------------- Passport ---------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    user.displayName = profile.displayName;
                    user.avatar = profile.photos?.[0]?.value || '';
                    await user.save();
                    return done(null, user);
                }

                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails?.[0]?.value || '',
                    avatar: profile.photos?.[0]?.value || '',
                });

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// --------------- Routes ---------------
// All routes under /api/ for Vercel serverless compatibility

// Health check (before auth-protected routes)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// --------------- MongoDB Connection (cached for serverless) ---------------
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
}

module.exports = { app, connectDB };
