const mongoose = require("mongoose");

const Businesschema = new mongoose.Schema({
    username: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    contact: {
        required: true,
        type: String
    },
    accountType: {
        type: String,
        default: "Business"
    },
    shopOpen: {
        type: Boolean,
        default: false
    },
    referralCode: {
        required: true,
        type: String
    },
    referredBy: {
        required: true,
        type: String
    },
    productDetails: [
        {
            productName: String,
            priceForOne: Number,
            minimumOrder: Number,
        },
    ],
    daysAmount: {
        type: Number,
        default: 0
    },
    monthsAmount: {
        type: Number,
        default: 0
    },
    totalPins: {
        type: Number,
        default: 0
    },
    businessLocation: {
        lat: {
            type: Number,
            default: -1.1010048
        },
        lng: {
            type: Number,
            default: 37.0180096
        }
    }

})
module.exports = mongoose.model("BusinessData", Businesschema);