// controllers/chargesController.js
import ChargesModel from "../models/chargesModel.js";


export const createCharges = async (req, res) => {
  try {
    const { tax, shippingFee, discount } = req.body;

    // Validate input
    if (
      tax === "" ||
      shippingFee === "" ||
      discount === ""
    ) {
      return res.status(400).json({ success: false, message: "Invalid charges" });
    }

    // Delete all old charges (ensure only one exists)
    await ChargesModel.deleteMany({});

    // Create new charges
    const newCharge = new ChargesModel({
      tax,
      shippingFee,
      discount,
    });

    const savedCharge = await newCharge.save();

    res.status(201).json({ success: true, data: savedCharge });
  } catch (error) {
    console.error("Create Charges Error:", error);
    res.status(500).json({ success: false, message: "Failed to create charges" });
  }
};

// ✅ Get current charges
export const getCharges = async (req, res) => {
  try {
    const charges = await ChargesModel.findOne();
    res.json({ success: true, data:charges });
  } catch (error) {
    console.error("Get Charges Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch charges" });
  }
};

// ✅ Admin update or create charges
export const updateCharges = async (req, res) => {
  try {
    const { tax = 0, shippingFee = 0, discount = 0 } = req.body;

    let charges = await ChargesModel.findOne();

    if (!charges) {
      charges = new ChargesModel({ tax, shippingFee, discount });
    } else {
      charges.tax = tax;
      charges.shippingFee = shippingFee;
      charges.discount = discount;
    }

    await charges.save();

    res.json({ success: true, data:charges });
  } catch (error) {
    console.error("Update Charges Error:", error);
    res.status(500).json({ success: false, message: "Failed to update charges" });
  }
};

export const deleteCharge = async (req, res) => {
  try {
    const result = await ChargesModel.deleteMany();

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "No charges found to delete" });
    }

    res.status(200).json({ success: true, message: "Charges deleted successfully" });
  } catch (error) {
    console.error("Delete Charges Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete charges" });
  }
};
