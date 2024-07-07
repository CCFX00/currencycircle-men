countryCurrencyMap = {
    '+237': 'XAF', // Cameroon
    '+44': 'GBP', // United Kingdom
    '+1-UN': 'USD', // United States
    '+971': 'AED', // United Arab Emirates
    '+33': 'EUR', // France
    '+86': 'CNY', // China
    '+20': 'EGP', // Egypt
    '+234': 'NGN', // Nigeria
    '+1-CA': 'CAD', // Canada
    '+49': 'EUR', // Germany
    '+91': 'INR', // India
    '+81': 'JPY', // Japan
    '+61': 'AUD', // Australia
    '+7': 'RUB', // Russia
    '+82': 'KRW', // South Korea
    '+39': 'EUR', // Italy
    '+34': 'EUR', // Spain
    '+55': 'BRL', // Brazil
    '+27': 'ZAR', // South Africa
    '+52': 'MXN' // Mexico
}


exports.getCurrency = (code) => {
    return countryCurrencyMap[code]
}

// module.exports = {
//     getCurrency
// }