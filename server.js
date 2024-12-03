const app = require('./app')
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

// Starting express server
const PORT = process.env.PORT || 3000
const expressServer = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

// Creating a new instance of Socket.IO and passing express server to it
const io = new Server(expressServer, {
    cors: {
        origin: process.env._NODE_ENV === 'production' ? false : 
        [`http://localhost:${process.env._FRONTEND_PORT}`, `http://127.0.0.1:${process.env._FRONTEND_PORT}`]
    }
})

// Importing and using the socket handler
require('./utils/socketHandler')(io)

// unhandled promise rejection
process.on('unhandledRejection', (err) => {
    console.log(`Shutting down server for ${err.message}`)
    console.log(`Shutting down server for unhandled promise rejection`)
    httpServer.close(() => {
        process.exit(1)
    })
})