const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

router.post("/", bookingController.createBooking);


router.get("/", authMiddleware, isAdmin, bookingController.getAllBookings);
router.get("/:id", authMiddleware, isAdmin, bookingController.getBookingById);
router.put("/:id/status", authMiddleware, isAdmin, bookingController.updateBookingStatus);
router.delete("/:id", authMiddleware,isAdmin,bookingController.deleteBooking);
router.put("/:id", authMiddleware, isAdmin,bookingController.updateBooking);
router.put("/:id/checkin", authMiddleware, isAdmin, bookingController.updateCheckIn);

module.exports = router;
