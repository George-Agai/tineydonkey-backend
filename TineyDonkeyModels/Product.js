const mongoose = require("mongoose");

const Product = new mongoose.Schema({
    image: [String],
    productName: {
        required: true,
        type: String
    },
    price: {
        required: true,
        type: Number
    },
    status: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model("Product", Product);