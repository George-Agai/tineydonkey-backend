const mongoose = require("mongoose");

const Sale = new mongoose.Schema({
    products: [{
        _id: String,
        productName: String,
        itemTotal: Number,
        image: [String],
        quantity: Number
    }],
    boughtBy: {
        required: true,
        type: String
    },
    totalAmount: {
        required: true,
        type: Number
    },
    town: {
        required: true,
        type: String
    },
    orderNotes: String,
    orderStatus: {
        type: String,
        default: "Pending"
    },
    country: String,
    contact: {
        required: true,
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Sale", Sale);