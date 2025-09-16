const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    voucher: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher", default: null },
    total_amount: { type: Number, required: true },
    used_points: { type: Number, default: 0 },
    final_amount: { type: Number, required: true },
    earned_points: { type: Number, default: 0 },
    payment_method: { type: String, enum: ["Cash", "Card", "Transfer"], default: "Cash" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
