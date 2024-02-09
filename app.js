const express = require('express')
const app = express()
const ErrorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())

//importing routes
const userRoutes = require('./routes/userRoutes')

app.use('/ccfx/api/v1', userRoutes)

app.use(ErrorHandler)

module.exports = app