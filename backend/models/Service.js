const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String }, 
    duration: { type: Number, required: true }, 
    price: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"], 
      default: "Inactive" 
    },
    images: [{ type: String }],
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Service", serviceSchema);
