const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, 
    description: { type: String, trim: true }, 
    price: { type: Number, required: true }, 
    stock: { type: Number, default: 0 }, 
    category: { type: String, required: true }, 
    brand: { type: String, trim: true }, 
    images: [{ type: String }], 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
