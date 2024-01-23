const app = require('./app')
const dotenv = require('dotenv')
const connectDatabase = require('./db/connectDatabase')

// handling uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Shutting down server: ${err.message}`)
    console.log(`Shutting down server for handling uncaught exception`)
})

dotenv.config({
    path: 'config/.env'
})

// connect to database
connectDatabase()

const server = app.listen(process.env._PORT, (req, res) => {
    console.log(`Server running on http://localhost: ${process.env._PORT}`)
})

// unhandled promise rejection
process.on('unhandledRejection', (err) => {
    console.log(`Shutting down server for ${err.message}`)
    console.log(`Shutting down server for unhandled promise rejection`)
    server.close(() => {
        process.exit(1)
    })
})