import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user';

// Initialize Passport.js with Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback',
}, async (accessToken , refreshToken , profile, done) => {
    try {
        // Check if the user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Create a new user if they don't exist
            user = new User({
                googleId: profile.id,
                email: profile.emails?.[0].value,
                name: profile.displayName,
            });

            await user.save();
        }

        done(null, user);
    } catch (error) {
        done(error, undefined );
    }
}));

// Serialize and deserialize the user for the session
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
