const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, isAdmin, upload.array("images", 5), productController.createProduct);
router.get("/",  productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", authMiddleware, isAdmin, upload.array("images", 5), productController.updateProduct);
router.delete("/:id", authMiddleware, isAdmin, productController.deleteProduct);
router.patch("/:id/status", authMiddleware, isAdmin, productController.updateProductStatus);

module.exports = router;
