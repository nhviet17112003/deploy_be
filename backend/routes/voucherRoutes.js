const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const authMiddleware = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

router.post("/", authMiddleware, isAdmin, voucherController.createVoucher);
router.get("/", authMiddleware, isAdmin, voucherController.getAllVouchers);
router.get("/phone/:phone", authMiddleware, voucherController.getVouchersByPhone);

module.exports = router;
