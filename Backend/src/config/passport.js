import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { supabase } from './supabase.js';

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return done(error, null);
        done(null, data);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            const { data: existingUser, error: findError } = await supabase
                .from('users')
                .select('*')
                .eq('google_id', profile.id)
                .single();

            if (existingUser) {
                // User exists, return user
                return done(null, existingUser);
            }

            // Create new user
            const newUser = {
                google_id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                profile_picture: profile.photos[0]?.value,
                created_at: new Date().toISOString()
            };

            const { data: createdUser, error: createError } = await supabase
                .from('users')
                .insert([newUser])
                .select()
                .single();

            if (createError) {
                console.error('Error creating user:', createError);
                return done(createError, null);
            }

            return done(null, createdUser);

        } catch (err) {
            console.error('Google Auth Error:', err);
            return done(err, null);
        }
    }));

export default passport;
