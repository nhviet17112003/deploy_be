const mongoose = require("mongoose");

const customerHistorySchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    visit_date: { type: Date, default: null },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    images: [{ type: String }],
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ["NotYet", "Visited", "Canceled"],
      default: "NotYet",
    },
  },
  { _id: true }
);


const customerSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Nam" },
    dob: { type: Date },
    phone: { type: String, required: true, unique: true },
    email: { type: String, sparse: true, lowercase: true },
    address: { type: String },
    join_date: { type: Date, default: Date.now },
    loyalty_point: { type: Number, default: 0 },
    cosmetics: { type: String, default: "" },
    skin_diseases: { type: String, default: "" },
    other_notes: { type: String, default: "" },

    history: [customerHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
