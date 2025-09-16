const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload"); 

const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require("../controllers/serviceController");

router.get("/",  getAllServices);
router.get("/:id",  getServiceById);

//admin
router.post("/", authMiddleware, upload.array("images", 5), createService); 
router.put("/:id", authMiddleware, upload.array("images", 5), updateService);
router.delete("/:id", authMiddleware, deleteService);

module.exports = router;
