const mongoose = require("mongoose");
const slugify = require("slugify");

const Product = new mongoose.Schema({
    image: [String],
    productName: {
        required: true,
        type: String
    },
    price: {
        required: true,
        type: Number
    },
    status: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        unique: true
    },
})

Product.pre("save", async function (next) {
    let baseSlug = slugify(this.productName, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Reference the model dynamically
    const Model = this.constructor;

    // Check if the slug already exists in the database
    while (await Model.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
    }

    this.slug = uniqueSlug;
    next();
});

module.exports = mongoose.model("Product", Product);