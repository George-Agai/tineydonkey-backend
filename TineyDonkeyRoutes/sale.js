const express = require("express");
const router = express.Router();
const Sale = require("../TineyDonkeyModels/Sale");
const Product = require("../TineyDonkeyModels/Product");
const Cashflow = require("../TineyDonkeyModels/cashflow");

const axios = require('axios');


const setProductStatusFalse = async (id) => {
    try {
        const updateResult = await Product.findByIdAndUpdate(id, { $set: { status: "sold" } }, { new: true });
        return updateResult
    }
    catch (err) {
        console.log(err)
    }
}
router.post('/saveOrder', async (req, res) => {
    try {
        const { boughtBy, products, town, orderNotes, orderStatus, country, totalAmount, contact } = req.body;

        const newSale = new Sale({
            boughtBy: boughtBy,
            products: products,
            town: town,
            orderNotes: orderNotes,
            orderStatus: orderStatus,
            country: country,
            totalAmount: totalAmount,
            contact: contact
        });

        const savedSale = await newSale.save();

        if (savedSale) {
            res.json({ message: 'Sale saved successfully', savedSale });
            const productsArray = products.map(product => product._id)
            const updateResults = await Promise.all(productsArray.map(id => setProductStatusFalse(id)))
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error saving sale:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const getTotalFigurinesInStock = async () => {
    try {
        const totalProducts = await Product.find({ status: "available" });
        const totalRemainingStockWorth = totalProducts.reduce((sum, order) => sum + order.price, 0);
        const stockInfo = {
            totalProductsInStock: totalProducts.length,
            totalRemainingStockWorth: totalRemainingStockWorth
        }
        return stockInfo
    } catch (err) {
        console.log(err)
    }
}

router.get('/getPendingOrders', async (req, res) => {
    try {
        const pendingOrders = await Sale.find({
            $or: [{ orderStatus: "pending" }, { orderStatus: "delivered" }]
        });
        const stockInfo = await getTotalFigurinesInStock()
        res.json({ pendingOrders, stockInfo })
    }
    catch (err) {
        console.log(err)
        res.json(err)
    }
})

router.get('/getAllPreviousOrders', async (req, res) => {
    try {
        const orders = await Sale.find({
            $or: [{ orderStatus: "cancelled" }, { orderStatus: "delivered" }, { orderStatus: "deleted" }, { orderStatus: "giveaway" }]
        });
        res.json(orders);
    }
    catch (err) {
        console.log(err)
        res.json(err)
    }
})


router.post('/orderDelivered', async (req, res) => {
    try {
        const saleId = req.query.id
        const deliveredOrder = await Sale.findByIdAndUpdate(saleId, { $set: { orderStatus: "delivered" } }, { new: true })
        if (deliveredOrder) {
            const cashflow = new Cashflow({
                description: "Sale",
                amount: deliveredOrder.totalAmount,
                type: "Income"
            });
            await cashflow.save()
            res.json({ message: 'success' })
        }
    }
    catch (err) {
        console.log(err)
        res.json(err)
    }
})

const setProductStatusTrue = async (id) => {
    try {
        const updateResult = await Product.findByIdAndUpdate(id, { $set: { status: "available" } }, { new: true });
        return updateResult
    }
    catch (err) {
        console.log(err)
    }
}

router.post('/rejectOrder', async (req, res) => {
    try {
        const { productIds, saleId } = req.body
        await Promise.all(productIds.map(id => setProductStatusTrue(id)))
        const updated = await Sale.findByIdAndUpdate(saleId, { $set: { orderStatus: "cancelled" } }, { new: true });
        if (updated) {
            res.json({ message: 'success' })
        }
        else {
            res.json({ mesage: 'Update failed' })
        }

    } catch (error) {
        consolelog(error)
        res.json(error)
    }
})

router.post('/cancelOrder', async (req, res) => {
    try {
        const { productIds, saleId } = req.body
        await Promise.all(productIds.map(id => setProductStatusTrue(id)))
        const updated = await Sale.findByIdAndUpdate(saleId, { $set: { orderStatus: "deleted" } }, { new: true });
        if (updated) {
            res.json({ message: 'Deleted successfully' })
        }
        else {
            res.json({ mesage: 'Update failed' })
        }

    } catch (error) {
        consolelog(error)
        res.json({ mesage: 'Something went wrong', error })
    }
});


router.post('/giveaway', async (req, res) => {
    try {
        const order = req.body;
        const orderSaved = await axios.post('{http://192.168.0.104:3000}/saveOrder', order)
        if (orderSaved) {
            console.log("Saved order-->", orderSaved.data)
            const saleId = orderSaved.data.savedSale._id
            const deliveredOrder = await Sale.findByIdAndUpdate(saleId, { $set: { orderStatus: "giveaway" } }, { new: true })
            if (deliveredOrder){
                res.json({ message: 'Giveaway sale set successfully'})
            }
        }
        else {
            res.json({ message: 'Failed to save sale' })
        }
    }
    catch (err) {
        console.log(err)
    }
});

module.exports = router;