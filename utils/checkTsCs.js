const checkTsCs = (res) => {
    res.status(401).json({
        success: false,
        message: "Sorry you need to accept Terms and Conditions to proceed. Property is TsCs and value must true"
    })
}

module.exports = {
    checkTsCs
}