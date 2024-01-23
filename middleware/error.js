const ErrorHandler = require('../utils/ErrorHandler')

module.exports = (err, req, res, next) => {
    err.message = err.message || 'Internal server error'
    err.statusCode = err.statusCode || 500

    // wrong mongodb id error handling (cast error)
    if(err.name === 'CastError'){
        const message = `Resource not found with this id...Invalid ${err.path}`
        err = new ErrorHandler(message, 404)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}