const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require('jsonwebtoken');

const secretKey = process.env.secretKey;

router.post("/createUser", async (req, res) => {
    try {
        const { username, description, target, avatar } = req.body;
        let existingUser = await User.findOne({ username }).exec();
        if (existingUser) {
            return res.json({ message: "User already exists" });
        }

        const user = new User({
            username,
            description,
            target,
            avatar
        })

        const savedUser = await user.save();
        const token = jwt.sign({ userId: savedUser._id }, secretKey);
        res.status(200).json({ message: "User created", token, savedUser })
    }
    catch (error) {
        console.log(error)
        return error;
    }
});

const fetchUser = async(id)=> {
    const user = await User.findById(id);
    return user;
}

router.get('/authentication', async(req, res) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.json({ message: 'Access denied. No token provided' });
        }
        const decoded = jwt.verify(token, secretKey);
        const user = await fetchUser(decoded.userId);

        res.status(200).json({ message: 'Access granted', user });
    } catch (error) {
        res.json({ message: 'Invalid token' });
    }
});

router.post("/reset", async(req, res) => {
    try{
        const userId = req.body;
        const newDate = new Date()
        const updatedUser = await User.findByIdAndUpdate(userId, { startDate: newDate }, { new: true});
        res.json({ message: "Date reset successfully", updatedUser })
    }
    catch(error){
        res.json({ message: "Something went wrong", error})
    }
});

module.exports = router;