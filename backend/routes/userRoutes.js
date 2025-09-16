const express = require("express");
const { registerUser, loginUser, forgotPassword, resetPassword, updatePassword } = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", authMiddleware, updatePassword);

module.exports = router;
