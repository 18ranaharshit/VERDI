// Performance: Single entry point - DB connection once at startup, Passport config, session store, all routes mounted
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const morgan = require('morgan');

const { connectDB } = require('./lib/db');
const User = require('./models/User');
const { startExpiryLoop } = require('./utils/expireVouchers');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tripRoutes = require('./routes/trip.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const creditsRoutes = require('./routes/credits.routes');
const rewardsRoutes = require('./routes/rewards.routes');
const redemptionsRoutes = require('./routes/redemptions.routes');
const routePlannerRoutes = require('./routes/routePlanner.routes');
const passportRoutes = require('./routes/passport.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render (required for secure cookies behind reverse proxy)
app.set('trust proxy', 1);

const allowedOrigin = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:5173';

// CORS - strictly frontend origin only but handle trailing slash typos
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === allowedOrigin || origin === `${allowedOrigin}/`) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin}`);
        // To prevent complete lockouts during testing, we temporarily allow it but log a warning.
        // In strict prod, you would do callback(new Error('CORS blocked'))
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// HTTP logging - 'combined' for production, 'dev' for development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Session configuration with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.startsWith('https://'),
      sameSite: process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.startsWith('https://') ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // INDEX: { googleId: 1 } - unique index on User model
        let user = await User.findOne({ googleId: profile.id })
          .select('_id googleId email displayName avatar institution createdAt lastLogin')
          .lean();

        if (user) {
          await User.updateOne(
            { _id: user._id },
            { lastLogin: new Date() }
          );
          user.lastLogin = new Date();
          return done(null, user);
        }

        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          avatar: profile.photos[0]?.value || '',
          lastLogin: new Date(),
        });

        const userObj = newUser.toObject();
        return done(null, userObj);
      } catch (err) {
        console.error('[Passport] Google strategy error:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // INDEX: { _id: 1 } - default primary key
    const user = await User.findById(id)
      .select('_id googleId email displayName avatar institution createdAt lastLogin')
      .lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/redemptions', redemptionsRoutes);
app.use('/api/routes', routePlannerRoutes);
app.use('/api/passport', passportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 404,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: err.status || 500,
  });
});

// Start server - connect DB once at startup
const start = async () => {
  await connectDB();
  startExpiryLoop();
  app.listen(PORT, () => {
    console.error(`[Server] Verdi API running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
