const mongoose = require("mongoose");

const User = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    description: {
        required: true,
        type: String
    },
    target: {
        required: true,
        type: String
    },
    avatar: String

})
module.exports = mongoose.model("days_ngapi_users", User);