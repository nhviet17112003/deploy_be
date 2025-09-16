const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");


router.post("/", authMiddleware, isAdmin, transactionController.createTransaction);
router.get("/", authMiddleware, isAdmin, transactionController.getAllTransactions);
router.get("/:phone", transactionController.getTransactionsByCustomer);

module.exports = router;
