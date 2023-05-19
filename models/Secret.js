const mongoose = require('mongoose');

const secretSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    secret: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('secret', secretSchema)