const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const Voucher = require("../models/Voucher");
const VoucherRule = require("../models/VoucherRule");

// Tạo giao dịch
exports.createTransaction = async (req, res) => {
  try {
    const { phone, serviceId = [], productId = [], used_points = 0, payment_method, voucherCode } = req.body;

    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const services = await Service.find({ _id: { $in: serviceId } });
    const totalServicePrice = services.reduce((sum, s) => sum + s.price, 0);

    const products = await Product.find({ _id: { $in: productId } });
    const totalProductPrice = products.reduce((sum, p) => sum + p.price, 0);

    let total_amount = totalServicePrice + totalProductPrice;

    // loyalty points
    let discountByPoint = used_points;
    if (discountByPoint > customer.loyalty_point) {
      return res.status(400).json({ message: "Not enough loyalty points" });
    }

    // voucher
    let voucher = null;
    let discountByVoucher = 0;

    if (voucherCode) {
      voucher = await Voucher.findOne({ code: voucherCode, isActive: true });
      if (!voucher) return res.status(400).json({ message: "Invalid voucher" });

      const now = new Date();
      if (voucher.startDate > now || (voucher.endDate && voucher.endDate < now)) {
        return res.status(400).json({ message: "Voucher expired" });
      }

      if (voucher.applicableCustomers === "Custom" && !voucher.allowedPhones.includes(phone)) {
        return res.status(403).json({ message: "Voucher not allowed for this customer" });
      }

      if (total_amount < voucher.minTransactionAmount) {
        return res.status(400).json({ message: "Transaction amount too low for voucher" });
      }

      // check so lan su dung
      const usedCount = voucher.usageHistory.filter(u => u.phone === phone).length;
      if (usedCount >= voucher.usageLimitPerPhone) {
        return res.status(400).json({ message: "Voucher usage limit reached for this phone" });
      }

      // tinh discount
      if (voucher.discountType === "percent") {
        discountByVoucher = (voucher.discountValue / 100) * total_amount;
      } else {
        discountByVoucher = voucher.discountValue;
      }
    }

    let final_amount = total_amount - discountByPoint - discountByVoucher;
    if (final_amount < 0) final_amount = 0;

    const earned_points = Math.floor(final_amount / 100000) * 1000;
    customer.loyalty_point = customer.loyalty_point - discountByPoint + earned_points;
    await customer.save();

    const transaction = await Transaction.create({
      customer: customer._id,
      services: services.map(s => s._id),
      products: products.map(p => p._id),
      voucher: voucher ? voucher._id : null,
      total_amount,
      used_points: discountByPoint,
      final_amount,
      earned_points,
      payment_method,
      createdBy: req.user ? req.user._id : null,
    });

    if (voucher) {
      voucher.usageHistory.push({
        phone,
        transaction: transaction._id,
      });
      await voucher.save();
    }

const rules = await VoucherRule.find({ isActive: true });

for (const rule of rules) {
  if (rule.conditionType === "amount" && final_amount >= rule.conditionValue) {
 
    const alreadyUsed = rule.usedTransactions.some(
      u => u.phone === phone && u.transactionIds.includes(transaction._id)
    );
    if (!alreadyUsed) {

      await Voucher.create({
        code: rule.name.toUpperCase() + Date.now() + phone,
        description: rule.description,
        discountType: rule.discountType,
        discountValue: rule.discountValue,
        minTransactionAmount: rule.minTransactionAmount,
        usageLimitPerPhone: rule.usageLimitPerPhone,
        isActive: true,
        allowedPhones: [phone],
        createdBy: req.user ? req.user._id : null,
      });

 
      rule.usedTransactions.push({
        phone,
        transactionIds: [transaction._id],
      });
      await rule.save();
    }
  }

  if (rule.conditionType === "serviceCount") {
    for (const sId of serviceId) {

      const usedForPhone = rule.usedTransactions.find(u => u.phone === phone);
      const usedIds = usedForPhone ? usedForPhone.transactionIds : [];

      const serviceTransactions = await Transaction.find({
        customer: customer._id,
        services: sId,
        _id: { $nin: usedIds }, 
      }).sort({ createdAt: 1 });

      if (serviceTransactions.length >= rule.conditionValue) {

        const batch = serviceTransactions.slice(0, rule.conditionValue);


        await Voucher.create({
          code: rule.name.toUpperCase() + Date.now() + phone,
          description: rule.description,
          discountType: rule.discountType,
          discountValue: rule.discountValue,
          minTransactionAmount: rule.minTransactionAmount,
          usageLimitPerPhone: rule.usageLimitPerPhone,
          isActive: true,
          allowedPhones: [phone],
          createdBy: req.user ? req.user._id : null,
        });


        if (usedForPhone) {
          usedForPhone.transactionIds.push(...batch.map(t => t._id));
        } else {
          rule.usedTransactions.push({
            phone,
            transactionIds: batch.map(t => t._id),
          });
        }
        await rule.save();
      }
    }
  }
}
    res.status(201).json({ message: "Transaction created successfully", transaction });
  } catch (error) {
    console.error("Error createTransaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get giao dich by id customer
exports.getTransactionsByCustomer = async (req, res) => {
  try {
    const { phone } = req.params;
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const transactions = await Transaction.find({ customer: customer._id })
      .populate("services")
      .populate("products")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy tất cả transaction
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("customer", "fullname phone loyalty_point")
      .populate("services")
      .populate("products")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
