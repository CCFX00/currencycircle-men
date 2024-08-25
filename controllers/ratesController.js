const { getRate } = require('../utils/getRate')

// Get the rate
exports.displayRate = async(req, res) => {
    try{
        const { rate, rndRate } = await getRate(req)

        res.status(200).json({
            success: true,
            rate,
            rndRate
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }   
}
