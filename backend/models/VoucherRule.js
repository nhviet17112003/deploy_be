const mongoose = require("mongoose");

const voucherRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    conditionType: {
      type: String,
      enum: ["amount", "serviceCount"],
      required: true,
    },
    conditionValue: { type: Number, required: true },
    discountType: { type: String, enum: ["fixed", "percent"], required: true },
    discountValue: { type: Number, required: true },
    minTransactionAmount: { type: Number, default: 0 },
    usageLimitPerPhone: { type: Number, default: 1 },


    usedTransactions: [
      {
        phone: String,
        transactionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
      },
    ],

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoucherRule", voucherRuleSchema);
