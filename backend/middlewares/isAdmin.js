const isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Chỉ admin mới được phép thực hiện" });
  }
  next();
};

module.exports = isAdmin;
