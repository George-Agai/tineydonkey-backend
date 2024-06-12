const mongoose = require("mongoose");

const Cashflow = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model("cashflow", Cashflow);