import MetaTags from "../models/metaTagsModel.js";

// CREATE
export const createMetaTags = async (req, res) => {
  try {
    const meta = await MetaTags.create(req.body);
    return res.status(201).json({ success: true, data: meta });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET ALL
export const getAllMetaTags = async (req, res) => {
  try {
    const all = await MetaTags.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: all });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE
export const getMetaTagById = async (req, res) => {
  try {
    const meta = await MetaTags.findById(req.params.id);
    if (!meta) {
      return res.status(404).json({ success: false, message: "MetaTags not found" });
    }
    return res.status(200).json({ success: true, data: meta });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE
export const updateMetaTags = async (req, res) => {
  try {
    const updated = await MetaTags.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "MetaTags not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE
export const deleteMetaTags = async (req, res) => {
  try {
    const deleted = await MetaTags.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "MetaTags not found" });
    }

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
