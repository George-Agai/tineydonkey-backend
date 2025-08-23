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
            const data = await Product.find({ status: "available" });
            res.json({ message: "Upload successful", data });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error uploading product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const updateProductStatus = async () => {
    try {
        const products = await Product.find({});

        for (let product of products) {
            let newStatus = product.status === true ? "available" : "sold";

            await Product.findByIdAndUpdate(product._id, { status: newStatus });
        }

        console.log("Product statuses updated successfully.");
    } catch (error) {
        console.error("Error updating product statuses:", error);
    }
};

router.get("/getProduct", async (req, res) => {
    try {
        Product.find({ status: { $in: ['available', 'sold'] } }).then((data) => {
            res.json(data);
        });
    } catch (error) {
        res.json({ status: error });
    }
});

router.get("/getArchivedProducts", async (req, res) => {
    try {
        Product.find({ status: { $in: ['archived'] } }).then((data) => {
            res.json(data);
        });
    } catch (error) {
        res.json({ status: error });
    }
});

router.get('/fetchProduct/:slug', cache('1 day'), async (req, res) => {
    try {
        const data = await Product.findOne({ slug: req.params.slug });
        if (!data) return res.status(404).json({ message: "Product not found" });
        res.json(data);

    }
    catch (error) {
        console.log(error)
        res.json(error);
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

        await Product.findByIdAndDelete(req.params.id);
        const updatedProducts = await Product.find({});

        res.json({ message: 'Product and images deleted successfully', updatedProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/removeFromShop/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { status: "archived" });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Define image directory path
        const imageDir = path.join(__dirname, '../Public/Images/');

        // Remove all images except the first one
        product.image.slice(1).forEach((imageName) => {
            const imagePath = path.join(imageDir, imageName);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (err) => {
                    if (err) console.error(`Failed to delete ${imageName}:`, err);
                });
            }
        });

        // Keep only the first image in the array
        product.image = product.image.slice(0, 1);

        // Save the updated product (without deleted images)
        await product.save();

        res.json({ message: 'Product removed and images updated', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put("/editProduct/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, status, slug, price, image } = req.body;

        // Validate status
        if (status && !["available", "sold"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                ...(productName && { productName }),
                ...(status && { status }),
                ...(slug && { slug }),
                ...(price && { price }),
                ...(image && { image }),
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product updated",
            updatedProduct,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;