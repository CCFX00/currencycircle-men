const app = require('./app')
const { createServer } = require('http')
const { Server } = require('socket.io')

// handling uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Shutting down server: ${err.message}`)
    console.log(`Shutting down server for handling uncaught exception`)
})

// Importing and invocking the .env module
require('dotenv').config({
    path: 'config/.env'
})

// Importing and connecting to database module
require('./db/connectDatabase')()

// Create HTTP server and pass to Socket.IO
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        method: ["GET", "POST", "PUT", "DELETE"]
    }
})

// Importing and using the socket handler
require('./utils/socketHandler')(io)

// Starting HTTP server
const PORT = process.env._PORT || 3000
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

// unhandled promise rejection
process.on('unhandledRejection', (err) => {
    console.log(`Shutting down server for ${err.message}`)
    console.log(`Shutting down server for unhandled promise rejection`)
    httpServer.close(() => {
        process.exit(1)
    })
})