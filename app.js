const express = require('express')
const app = express()
const ErrorHandler = require('./middleware/error')

app.use(express.json())

//importing routes
const userRoutes = require('./routes/userRoutes')

app.use('/ccfx/api/v1', userRoutes)

app.use(ErrorHandler)

module.exports = app