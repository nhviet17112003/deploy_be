const Booking = require("../models/Booking");
const User = require("../models/User");
const Service = require("../models/Service");
const nodemailer = require("nodemailer");
const customerController = require("./customerController");

exports.createBooking = async (req, res) => {
  try {
    const { userId, serviceId, booking_date, fullname, phone, email, note } = req.body;

    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const booking = new Booking({
      user: user ? user._id : null,
      service: serviceId,
      booking_date,
      fullname: user ? user.fullname : fullname,
      phone,
      email,
      note,
    });

    await booking.save();
    await customerController.addBookingToCustomerHistory(booking._id);


    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

const mailOptions = {
  from: `"Nanie Spa" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🌸 Xác nhận đặt lịch tại Nanie Beauty 🌸",
  html: `
  <div style="font-family: Arial, sans-serif; background-color: #fff5f8; padding: 20px; border-radius: 10px; color: #333; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://i.imgur.com/Lr6zS2s.png" alt="logo gan sau" style="width: 120px; border-radius: 50%;"/>
      <h1 style="color: #e75480; margin-top: 10px;">Nanie Beauty</h1>
    </div>

    <h2 style="color: #e75480;">Xin chào ${user ? user.fullname : "quý khách"},</h2>
    <p style="font-size: 16px;">Quý khách đã đặt lịch thành công tại <b style="color:#e75480;">Nanie Beauty</b> 🎉</p>

    <div style="background: #ffe6ef; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p><b>Dịch vụ:</b> ${service.name}</p>
      <p><b>Giá:</b> ${service.price} VND</p>
      <p><b>Thời gian:</b> ${new Date(booking_date).toLocaleString("vi-VN")}</p>
      <p><b>Số điện thoại:</b> ${phone}</p>
      <p><b>Ghi chú:</b> ${note || "Không có"}</p>
    </div>

    <p style="font-size: 15px;">Cảm ơn bạn đã tin tưởng <b style="color:#e75480;">Nanie Beauty</b> <br/>
    Chúng tôi hân hạnh được phục vụ bạn và chúc bạn có trải nghiệm thư giãn tuyệt vời!</p>

    <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #777;">
      <p>📍 Địa chỉ: Gần trường LQĐ</p>
      <p>📞 Hotline: 0000 000 000</p>
      <p>© 2025 Nanie Spa. All rights reserved.</p>
    </div>
  </div>
  `,
};


    await transporter.sendMail(mailOptions);

    res
      .status(201)
      .json({ message: "Booking created successfully & email sent", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
};

exports.updateCheckIn = async (req, res) => {
  try {
    const { check_in } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.check_in = check_in;
    booking.check_in_time = check_in ? new Date() : null;

    await booking.save();

    res.json({ message: "Check-in status updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating check-in", error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "fullname phone email")
      .populate("service", "name price duration");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "fullname phone email")
      .populate("service", "name price duration");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
};


exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user", "fullname phone email")
      .populate("service", "name price duration");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_date, serviceId, fullname, phone, email, note, status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });
      booking.service = serviceId;
    }

    if (booking_date) booking.booking_date = booking_date;
    if (fullname) booking.fullname = fullname; 
    if (phone) booking.phone = phone;
    if (email) booking.email = email;
    if (note) booking.note = note;
    if (status) booking.status = status; 

    await booking.save();

    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
};


// Xóa booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking", error: error.message });
  }
};
