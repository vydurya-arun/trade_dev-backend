import contactModel from "../models/contactModel.js";

// GET all contacts
export const getContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find().sort({ createdAt: -1 });
    res.status(200).json({success:true, data:contacts});
  } catch (error) {
    res.status(500).json({success:false, message: "Failed to fetch contacts", error });
  }
};

// POST a new contact
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, comment } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({success:false, message: "Name, email and phone are required" });
    }

    const newContact = await contactModel.create({ name, email, phone, comment });
    res.status(201).json({success:true,data:newContact});
  } catch (error) {
    res.status(500).json({success:false, message: "Failed to create contact", error });
  }
};

// DELETE a contact by ID
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactModel.findById(id);

    if (!contact) {
      return res.status(404).json({ success:false, message: "Contact not found" });
    }

    await contact.deleteOne();
    res.status(200).json({success:true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({success:false, message: "Failed to delete contact", error });
  }
};
