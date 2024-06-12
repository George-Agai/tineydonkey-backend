    const mongoose = require("mongoose");

    const Message = new mongoose.Schema({
        message: String,
        name: String,
        emailAddress: String,
        subject: String
    })

    module.exports = mongoose.model("Messages", Message);