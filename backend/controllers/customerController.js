const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const cloudinary = require("../config/cloudinary");


// add new customer
exports.createCustomer = async (req, res) => {
  try {
    const { fullname, gender, dob, phone, email, address, cosmetics, skin_diseases, other_notes } = req.body;

    const existCustomer = await Customer.findOne({ phone });
    if (existCustomer) {
      return res.status(400).json({ message: "Customer with this phone already exists" });
    }

    const customer = new Customer({
      fullname,
      gender,
      dob,
      phone,
      email,
      address,
      cosmetics: cosmetics || "",
      skin_diseases: skin_diseases || "",
      other_notes: other_notes || "",
    });

    await customer.save();

    res.status(201).json({ message: "Customer created successfully", customer });
  } catch (error) {
    res.status(500).json({ message: "Error creating customer", error: error.message });
  }
};


// get all
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("history.service", "name price duration");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
};

// get by id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("history.service", "name price duration");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error: error.message });
  }
};

// update information
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, gender, dob, phone, email, address, cosmetics, skin_diseases, other_notes } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (fullname) customer.fullname = fullname;
    if (gender) customer.gender = gender;
    if (dob) customer.dob = dob;
    if (phone) customer.phone = phone;
    if (email) customer.email = email;
    if (address) customer.address = address;
    if (cosmetics !== undefined) customer.cosmetics = cosmetics;
    if (skin_diseases !== undefined) customer.skin_diseases = skin_diseases;
    if (other_notes !== undefined) customer.other_notes = other_notes;

    await customer.save();
    res.json({ message: "Customer updated successfully", customer });
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error: error.message });
  }
};


// delete
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error: error.message });
  }
};

// push booking to history
exports.addBookingToCustomerHistory = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate("service");
    if (!booking) return;

    const { fullname, phone, email, service, note } = booking;

    let customer = await Customer.findOne({ phone });

  if (!customer) {
  customer = new Customer({
    fullname,
    phone,
    email: email || `${phone}@example.com`,
    cosmetics: "",       
    skin_diseases: "",   
    other_notes: "",     
    history: [],
  });
}


    customer.history.push({
      booking: booking._id,
      service: service._id,
      note: note || "",
      status: "NotYet",
      visit_date: null,
    });

    await customer.save();
  } catch (error) {
    console.error("Error adding booking to customer history:", error.message);
  }
};


// update check in status
exports.updateHistoryStatus = async (req, res) => {
  try {
    const { customerId, historyId } = req.params;
    const { status } = req.body; 

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const history = customer.history.id(historyId);
    if (!history) return res.status(404).json({ message: "History not found" });

    history.status = status;

    if (status === "Visited") {
      history.visit_date = new Date();
    }
    if (status === "NotYet") {
      history.visit_date = null;
    }

    await customer.save();
    res.json({ message: "History status updated successfully", customer });
  } catch (error) {
    res.status(500).json({ message: "Error updating history status", error: error.message });
  }
};

// Sync tất cả booking theo phone vào history customer
exports.syncBookingsToCustomer = async (req, res) => {
  try {
    const { phone } = req.params;

    const bookings = await Booking.find({ phone }).populate("service");
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this phone" });
    }

    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({
        fullname: fullname,
        phone: phone,
        email: bookings[0].email || `${phone}@example.com`,
        history: [],
      });
    }

    bookings.forEach((booking) => {
      const alreadyExists = customer.history.some(
        (h) =>
          h.service.toString() === booking.service._id.toString() &&
          h.note === (booking.note || "")
      );

      if (!alreadyExists) {
        customer.history.push({
          service: booking.service._id,
          note: booking.note || "",
          status: "NotYet",
          visit_date: null,
        });
      }
    });

    await customer.save();

    res.json({
      message: "Bookings synced to customer history successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error syncing bookings to customer history",
      error: error.message,
    });
  }
};

exports.checkInCustomerHistory = async (req, res) => {
  try {
    const { customerId, historyId } = req.params;
    const { note } = req.body;
    const files = req.files;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const history = customer.history.id(historyId);
    if (!history) return res.status(404).json({ message: "History not found" });

    const now = new Date();
    const folderPath = `spa/customers/${customer.phone}/${now.getDate()}_${now.getMonth()+1}_${now.getFullYear()}`;

    let uploadedImages = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: folderPath });
        uploadedImages.push(result.secure_url);
      }
    }

    history.status = "Visited";
    history.visit_date = now;
    if (note) history.note = note;
    if (uploadedImages.length > 0) history.images.push(...uploadedImages);

    await customer.save();

    if (history.booking) {
      await Booking.findByIdAndUpdate(history.booking, {
        check_in: true,
        check_in_time: now,
      });
    }

    res.json({ message: "Check-in completed & booking synced", history });
  } catch (error) {
    res.status(500).json({ message: "Error during check-in", error: error.message });
  }
};


// get all history by customer id
exports.getAllHistoryByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId).populate(
      "history.service",
      "name price duration"
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json({
      customerId: customer._id,
      fullname: customer.fullname,
      phone: customer.phone,
      history: customer.history,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customer history",
      error: error.message,
    });
  }
};

// get history by id
exports.getHistoryById = async (req, res) => {
  try {
    const { customerId, historyId } = req.params;

    const customer = await Customer.findById(customerId).populate(
      "history.service",
      "name price duration"
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const history = customer.history.id(historyId);
    if (!history) return res.status(404).json({ message: "History not found" });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching history detail",
      error: error.message,
    });
  }
};

// update check in status
exports.updateHistoryStatus = async (req, res) => {
  try {
    const { customerId, historyId } = req.params;
    const { status } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const history = customer.history.id(historyId);
    if (!history) return res.status(404).json({ message: "History not found" });

    if (!["Visited", "NotYet", "Canceled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    history.status = status;

    if (status === "Visited") {
      history.visit_date = new Date();
    } else {

      history.visit_date = null;
    }

    await customer.save();

    res.json({
      message: `History status updated to ${status} successfully`,
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating history status",
      error: error.message,
    });
  }
};
