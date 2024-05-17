const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

require('dotenv').config({
  path: 'config/.env'
})

passport.use(new GoogleStrategy({
    clientID: process.env._GOOGLE_CLIENT_ID,
    clientSecret: process.env._GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/ccfx/api/v1/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})
