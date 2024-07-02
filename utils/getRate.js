const axios = require('axios');
const querystring = require('querystring');
// const CC = require('currency-converter-lt');


const getRate = async (req) => {

    // Convert the request body to a query string
    const { from, to } = req.body;
    const queryString = querystring.stringify({base: from, symbols: to});

    // Construct the URL

    // Exchange rates url currency conversion
    // const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${process.env._EXCHANGERATES_API_KEY}&${queryString}`;

    // Currency freaks url currency conversion
    const url = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${process.env._CURRENCYFREAKS_API_KEY}&${queryString}`;

    try {
        // Make the HTTP request
        const response = await axios.get(url);

        // Send response to client
        const rates = response.data.rates;

        return {
            rate: parseFloat(Object.values(rates)[0]).toFixed(4)
        }   
    } catch (error) {
        // Handle errors
        return{
            success: false,
            message: error.response ? error.response.data : error.message
        };
    }
};



module.exports = {
    getRate
}
