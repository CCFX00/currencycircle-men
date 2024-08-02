const express = require('express');
const app = express();
const ErrorHandler = require('./middleware/error');
const cookieParser = require('cookie-parser');

// oAuth Google imports
require('./utils/ssoAuth');
const middlewareSetup = require('./middleware/oauthMidWareSetup');

app.use(express.json());
app.use(cookieParser());
middlewareSetup(app);

// Importing routes
const userRoutes = require('./routes/userRoutes');
const ssoGoogleRoutes = require('./routes/ssoRoutes');
const tcsRoutes = require('./routes/tscsRoutes');
const deviceInfoRoutes = require('./routes/deviceInfoRoutes');
const offersRoutes = require('./routes/offersRoute');
const tradesRoutes = require('./routes/tradesRoutes');
const ratingRoutes = require('./routes/ratings');

app.use('/ccfx/api/v1', userRoutes);
app.use('/ccfx/api/v1', ssoGoogleRoutes);
app.use('/ccfx/api/v1', tcsRoutes);
app.use('/ccfx/api/v1', deviceInfoRoutes);
app.use('/ccfx/api/v1', offersRoutes);
app.use('/ccfx/api/v1', tradesRoutes);
app.use('/ccfx/api/v1', ratingRoutes);

app.use(ErrorHandler);

module.exports = app;
