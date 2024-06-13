const express = require("express");
const router = express.Router();
const Message = require("../TineyDonkeyModels/Message");

router.post('/sendMessage', async (req, res) => {
    try {
        const { message, emailAddress, name, about } = req.body;

        const newMessage = new Message({
            emailAddress: emailAddress,
            message: message,
            name: name,
            subject: about
        });

        const savedMessage = await newMessage.save();

        if (savedMessage) {
            res.json({ message: 'Message saved successfully', savedMessage });
        } else {
            console.log('Error saving email address');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error saving sale:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get', (req, res) =>{
    res.json({message: 'get working'})
})

module.exports = router;