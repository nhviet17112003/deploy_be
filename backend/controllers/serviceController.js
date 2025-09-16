const Service = require("../models/Service");

// get all 
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get by id
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Dịch vụ không tồn tại" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// tao moi
const createService = async (req, res) => {
  if (req.user.role !== "Admin") 
    return res.status(403).json({ message: "Chỉ Admin mới được tạo dịch vụ" });

  try {
    const { name, description, category, duration, price, status } = req.body;

    let images = [];
    if (req.files) {
      images = req.files.map(file => file.path); 
    }

    const newService = new Service({ name, description, category, duration, price, status, images });
    await newService.save();

    res.status(201).json({ message: "Tạo dịch vụ thành công", service: newService });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//update
const updateService = async (req, res) => {
  if (req.user.role !== "Admin")
    return res.status(403).json({ message: "Chỉ Admin mới được cập nhật dịch vụ" });

  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Dịch vụ không tồn tại" });

    const { name, description, category, duration, price, status, existingImages } = req.body;
    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (duration !== undefined) service.duration = duration;
    if (price !== undefined) service.price = price;
    if (status !== undefined) service.status = status;

 
    let images = Array.isArray(existingImages) ? existingImages : [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path); 
      images = [...images, ...newImages];
    }
    service.images = images;

    await service.save();

    res.json({ message: "Cập nhật dịch vụ thành công", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// xoa service
const deleteService = async (req, res) => {
  if (req.user.role !== "Admin") 
    return res.status(403).json({ message: "Chỉ Admin mới được xóa dịch vụ" });

  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Dịch vụ không tồn tại" });
    await Service.deleteOne({ _id: req.params.id });
    res.json({ message: "Xóa dịch vụ thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
