const mongoose = require('mongoose');
const moment = require('moment');

const currentDate = moment().format('YYYY-MM-DD');

const secretSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: currentDate
    },
    secret: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('secret', secretSchema);