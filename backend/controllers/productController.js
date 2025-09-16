const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary"); 

// tao my pham
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, brand } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: `product/${category}/${brand}`,
          resource_type: "image",
        })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      brand,
      images: imageUrls,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo sản phẩm", error: error.message });
  }
};

// get all
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error: error.message });
  }
};

// get by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
  }
};

// update my pham
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, brand, existingImages } = req.body;
    let finalImages = [];
    if (existingImages) {
      try {
        finalImages = JSON.parse(existingImages); 
      } catch (err) {
        return res.status(400).json({ message: "existingImages phải là JSON array" });
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: `product/${category}/${brand}`,
          resource_type: "image",
        })
      );
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map((result) => result.secure_url);
      finalImages = [...finalImages, ...newImageUrls];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        stock,
        category,
        brand,
        images: finalImages,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
};


// delete
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
};

// update product status
exports.updateProductStatus = async (req, res) => {
  try {
    const { isActive } = req.body; 

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive phải là true hoặc false" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({
      message: "Cập nhật trạng thái sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
  }
};
