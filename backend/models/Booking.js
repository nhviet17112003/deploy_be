const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, 
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    booking_date: { type: Date, required: true }, 
    created_at: { type: Date, default: Date.now }, 
    fullname: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    check_in: { type: Boolean, default: false }, 
    check_in_time: { type: Date }, 
  },
  { timestamps: true }
);


module.exports = mongoose.model("Booking", bookingSchema);
