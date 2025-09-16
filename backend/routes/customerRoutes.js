const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, isAdmin, customerController.createCustomer);
router.get("/", authMiddleware, isAdmin, customerController.getAllCustomers);
router.get("/:id", authMiddleware, isAdmin, customerController.getCustomerById);
router.put("/:id", authMiddleware, isAdmin, customerController.updateCustomer);
router.delete("/:id", authMiddleware, isAdmin, customerController.deleteCustomer);
router.put("/:customerId/history/:historyId/status",
  authMiddleware,
  isAdmin,
  customerController.updateHistoryStatus
);
router.post(
  "/sync-bookings/:phone",
  authMiddleware,
  isAdmin,
  customerController.syncBookingsToCustomer
);
router.patch(
  "/:customerId/history/:historyId/checkin",
  upload.array("images", 5), authMiddleware, isAdmin,
  customerController.checkInCustomerHistory
);
router.get(
  "/:customerId/history",
  authMiddleware,
  isAdmin,
  customerController.getAllHistoryByCustomer
);

router.get(
  "/:customerId/history/:historyId",
  authMiddleware,
  isAdmin,
  customerController.getHistoryById
);
router.put(
  "/:customerId/history/:historyId/status",
  customerController.updateHistoryStatus
);

module.exports = router;
