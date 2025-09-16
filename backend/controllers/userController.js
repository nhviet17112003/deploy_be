const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
const registerUser = async (req, res) => {
  try {
    const { fullname, gender, dob, phone, email, password, address, role } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được sử dụng" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      gender,
      dob,
      phone,
      email,
      password: hashedPassword,
      address,
      join_date: new Date(),
      loyalty_point: 0,
      role: role || undefined,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "Đăng ký thành công", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Email hoặc số điện thoại không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot pass
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const otp = generateOTP();
    const otpExpired = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otp_expired = otpExpired;
    await user.save();

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <div style="background: #4CAF50; color: white; padding: 15px; text-align: center;">
            <h2>Reset mật khẩu</h2>
          </div>
          <div style="padding: 20px; text-align: center;">
            <p>Xin chào <b>${user.fullname}</b>,</p>
            <p>Chúng tôi nhận được yêu cầu reset mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng sử dụng mã OTP bên dưới để xác nhận:</p>
            <h1 style="color: #4CAF50; letter-spacing: 4px;">${otp}</h1>
            <p>Mã OTP này sẽ hết hạn trong <b>5 phút</b>.</p>
            <p style="margin-top: 20px;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          </div>
          <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #555;">
            © ${new Date().getFullYear()} Nanie Spa. All rights reserved.
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Nanie Spa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Khôi phục mật khẩu",
      html: htmlTemplate,
    });

    res.json({ message: "OTP đã được gửi đến email của bạn" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset pass
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    if (
      user.otp !== otp ||
      !user.otp_expired ||
      user.otp_expired < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.otp = null;
    user.otp_expired = null;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update pass
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới và xác nhận không khớp" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updatePassword,
};
