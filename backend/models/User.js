const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Nam" },
    dob: { type: Date },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    address: { type: String },
    join_date: { type: Date, default: Date.now },
    loyalty_point: { type: Number, default: 0 },
    otp: { type: String }, 
    otp_expired: { type: Date }, 
    role: { type: String, enum: ["User", "Admin"], default: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
