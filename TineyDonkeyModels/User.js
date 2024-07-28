const mongoose = require("mongoose");
const Userschema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    username: {
        required: true,
        type: String,
        unique: true
    },
    contact: {
        required: true,
        type: String
    },
    referralCode: {
        type: String
    },
    referredBy: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    accountType: {
        type: String,
        default: 'User'
    },
    pinnedSellers: [
      {
        type: String,
      },
    ],
    previousOrderDetails: {
        previousOrder : {
            type: Boolean,
            default: false
        },
        pinned : {
            type: Boolean,
            default: false
        },
        delivered : {
            type: Boolean,
            default: false
        },
        businessId : {
            type: String,
            default: ""
        },
        username : {
            type: String,
            default: ""
        }
    }

})
module.exports = mongoose.model("UserData", Userschema);