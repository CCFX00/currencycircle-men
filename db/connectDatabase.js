const mongoose = require('mongoose')

const connectDatabase = () => {
    mongoose.connect(process.env._DBURI).then(data => {
        console.log(`MongoDb is connected successfully on server: ${data.connection.host}`)
    })   
}

module.exports = connectDatabase    