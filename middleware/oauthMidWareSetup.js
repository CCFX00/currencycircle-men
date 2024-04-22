const session = require('express-session');
const passport = require('passport');

module.exports = function (app) {
    app.use(session({
        secret: process.env._SESSION_SECRET, 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
};
