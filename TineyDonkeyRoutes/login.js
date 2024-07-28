const express = require("express");
const router = express.Router();
const User = require("../TineyDonkeyModels/User");
const Business = require("../TineyDonkeyModels/Business");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const secretKey = process.env.secretKey;

    let userSpecifics = {}
    try {
        let user = await User.findOne({ username }).exec();
        if(user){
            userSpecifics = {
                _id: user._id,
                username: user.username
            }
        }
        let accountType = "User";

        if (!user) {
            user = await Business.findOne({ username }).exec();
            if(user){
                userSpecifics = {
                    _id: user._id,
                    username: user.username
                }
            }
            accountType = "Business";
        }

        if (!user) {
            return res.json({
                message: "User doesn't exist"
            });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.json({
                    message: "Auth Failed"
                });
            }
            const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '4h' });

            return res.status(200).json({
                message: "Auth successful",
                userSpecifics,
                token
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});

module.exports = router;