const Voucher = require("../models/Voucher");

// tao voucher
exports.createVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create({
      ...req.body,
      createdBy: req.user ? req.user._id : null,
    });
    res.status(201).json({ message: "Voucher created successfully", voucher });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//get all voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// get voucher theo sdt
exports.getVouchersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const vouchers = await Voucher.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { applicableCustomers: "All" },
            { allowedPhones: phone }
          ]
        },
        {
          $or: [
            { startDate: { $lte: new Date() } },
            { startDate: { $exists: false } }
          ]
        },
        {
          $or: [
            { endDate: { $gte: new Date() } },
            { endDate: { $exists: false } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

