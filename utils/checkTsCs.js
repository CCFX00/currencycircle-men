const checkTsCs = (res) => {
    res.status(401).json({
        success: false,
        message: "Sorry you need to accept Terms and Conditions to proceed. "
    })
}

module.exports = {
    checkTsCs
}