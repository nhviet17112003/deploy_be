const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    minTransactionAmount: { type: Number, default: 0 },
    applicableCustomers: {
      type: String,
      enum: ["All", "Custom"],
      default: "All",
    },
    allowedPhones: [{ type: String }],

    // NEW
    usageLimitPerPhone: { type: Number, default: 1 }, // số lần tối đa / phone
    usageHistory: [
      {
        phone: String,
        transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
        usedAt: { type: Date, default: Date.now },
      },
    ],

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
