const ErrorHandler = require('../utils/ErrorHandler')

module.exports = (err, req, res, next) => {
    err.message = err.message || 'Internal server error'
    err.statusCode = err.statusCode || 500

    // wrong mongodb id error handling (cast error)
    if(err.name === 'CastError'){
        const message = `Resource not found with this id...Invalid ${err.path}`
        err = new ErrorHandler(message, 404)
    }

    // Duplicate key error handling
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }

    // Jwt error handling
    if(err.name === "jsonWebTokenError"){
        const message = `Your token is invalid`
        err = new ErrorHandler(message, 400)
    }

    // Jwt expired error handling
    if(err.name === "TokenExpiredError"){
        const message = `Your token is expired`
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}