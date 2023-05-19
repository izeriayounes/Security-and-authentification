const mongoose = require('mongoose');
const currentDate = new Date();

const secretSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: currentDate.toISOString().slice(0, 10)
    },
    secret: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('secret', secretSchema);