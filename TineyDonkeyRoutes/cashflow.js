const express = require("express");
const router = express.Router();
const Cashflow = require("../TineyDonkeyModels/cashflow");

router.post('/cashflow', async (req, res) => {
    try {
        const { description, amount, transactionType } = req.body;

        const cashflow = new Cashflow({
            description: description,
            amount: amount,
            type: transactionType
        });
        const savedCashflow = await cashflow.save();

        if (savedCashflow) {
            await Cashflow.find({})
                .then((payload) => {
                    res.json({ message: 'Cashflow saved successfully', payload })
                })
                .catch(err => console.log(err))
        } else {
            console.log('Error saving cashflow');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error saving sale:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getAllCashflow', async (req, res) => {
    try {
        await Cashflow.find({})
            .then((payload) => {
                res.json({ payload })
            })
            .catch(err => console.log(err))
    }
    catch (error) {
        console.log(error)
    }
})

module.exports = router;