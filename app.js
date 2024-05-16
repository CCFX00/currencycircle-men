const express = require('express')
const app = express()
const ErrorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')
// oAuth Google imports
require('./utils/ssoAuth')
const middlewareSetup = require('./middleware/oauthMidWareSetup')

app.use(express.json())
app.use(cookieParser())
middlewareSetup(app)

//importing routes
const userRoutes = require('./routes/userRoutes')
const ssoGoogleRoutes = require('./routes/ssoRoutes')
const tcsRoutes = require('./routes/tscsRoutes') 

app.use('/ccfx/api/v1', userRoutes)
app.use('/ccfx/api/v1', ssoGoogleRoutes)
app.use('/ccfx/api/v1', tcsRoutes)

app.use(ErrorHandler)

module.exports = app