const mongoose = require("mongoose");

const Email = new mongoose.Schema({
    email: String
})

module.exports = mongoose.model("Newsletter", Email);