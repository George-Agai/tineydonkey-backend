const express = require("express");
const router = express.Router();
// const Business = require("../TineyDonkeyModels/Business");
// const Order = require("../Models/Order");
// const User = require("../Models/User");
// const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const secretKey = process.env.secretKey;

//Check if user is has valid token
router.get('/authentication', (req, res) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.json({ message: 'Access denied. No token provided' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        res.json({ message: 'Access granted', userId: decoded.userId });
    } catch (error) {
        res.json({ message: 'Invalid token' });
    }
});


module.exports = router;