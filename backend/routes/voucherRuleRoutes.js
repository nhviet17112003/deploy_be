const express = require("express");
const router = express.Router();
const voucherRuleController = require("../controllers/voucherRulecontroller");
const authMiddleware = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");


router.post("/", authMiddleware, isAdmin, voucherRuleController.createRule);
router.get("/", authMiddleware, isAdmin, voucherRuleController.getRules);
router.put("/:id", authMiddleware, isAdmin, voucherRuleController.updateRule);
router.delete("/:id", authMiddleware, isAdmin, voucherRuleController.deleteRule);

module.exports = router;
