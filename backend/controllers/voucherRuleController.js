const VoucherRule = require("../models/VoucherRule");

// Create
exports.createRule = async (req, res) => {
  try {
    const rule = await VoucherRule.create({
      ...req.body,
      createdBy: req.user ? req.user._id : null,
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: "Error creating rule", error });
  }
};

// Get all
exports.getRules = async (req, res) => {
  try {
    const rules = await VoucherRule.find().sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rules", error });
  }
};

// Update
exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await VoucherRule.findByIdAndUpdate(id, req.body, { new: true });
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: "Error updating rule", error });
  }
};

// Delete
exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await VoucherRule.findByIdAndDelete(id);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json({ message: "Rule deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rule", error });
  }
};
