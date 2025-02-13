const express = require("express");
const router = express.Router();
// const cache = require("../cacheMiddleware");
const mongoose = require('mongoose');
const multer = require('multer');
var apicache = require('apicache');
const fs = require('fs')
const path = require('path');
const Product = require("../TineyDonkeyModels/Product");

var cache = apicache.middleware

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "Public/Images");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname + ".webp");
    },
});

const upload = multer({ storage: storage });

router.post("/uploadProduct", upload.array('image', 5), async (req, res) => {
    const { productName, price } = req.body;

    // Use Array.isArray to check if req.files is an array
    const images = Array.isArray(req.files) ? req.files : [req.files];

    try {
        const product = {
            productName,
            price,
            image: images.map(image => image.filename)
        };

        const result = await Product.create(product);
        if (result) {
            const data = await Product.find({});
            res.json({ message: "Upload successful", data });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error uploading product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/getProduct", async (req, res) => {
    try {
        Product.find({}).then((data) => {
            res.json(data);
        });
    } catch (error) {
        res.json({ status: error });
    }
});

router.get('/fetchProduct/:slug', cache('1 day'), async (req, res) => {
    try {
        // const productId = req.query.id;
        // if (productId.length == 24) {
        //     const sanitizedId = new mongoose.Types.ObjectId(productId);
        //     await Product.findById(sanitizedId)
        //         .then((data) => {
        //             res.json(data)
        //         })
        //         .catch(err => console.log(err))
        // }
        // else{
        //     res.json({message: "Haha, nothing here fam"})
        // }
        console.log("fetchProduct Endpoint hit")
        const data = await Product.findOne({ slug: req.params.slug });
        if (!data) return res.status(404).json({ message: "Product not found" });
        console.log(data)
        res.json(data);

    }
    catch (error) {
        console.log(error)
    }
})

const getProductStatusById = async (_id) => {
    try {
        const product = await Product.findOne({ _id });
        return product;
    } catch (error) {
        console.error('Error fetching product status:', error);
        return null;
    }
};

router.post('/checkProduct', async (req, res) => {
    const idArray = req.body;
    const productStatusResults = await Promise.all(idArray.map(id => getProductStatusById(id)));
    res.json({ productStatusResults, message: "Found products" });
});

router.delete('/deleteProduct/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Define image directory path
        const imageDir = path.join(__dirname, '../Public/Images/');

        // Delete each image file
        product.image.forEach((imageName) => {
            const imagePath = path.join(imageDir, imageName);

            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error(`Failed to delete ${imageName}:`, err);
                });
            }
        });

        // Delete product from database
        await Product.findByIdAndDelete(req.params.id);
        const updatedProducts = await Product.find({});

        res.json({ message: 'Product and images deleted successfully', updatedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;