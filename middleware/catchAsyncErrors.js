// Handle async errors and prevents server from halting
module.exports = (thefunc) => (req, res, next) => {
    Promise.resolve(thefunc(req, res, next)).catch(next)
}