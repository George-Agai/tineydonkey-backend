const express = require("express");
const router = express.Router();
const Email = require("../TineyDonkeyModels/Email");

router.post('/subscribe', async (req, res) => {
    try {
        const { emailAddress } = req.body;

        const email = new Email({
            email: emailAddress
        });

        const savedEmailAddress = await email.save();

        if (savedEmailAddress) {
            res.json({ message: 'Email address saved successfully', savedEmailAddress });
        } else {
            console.log('Error saving email address');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error saving sale:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;