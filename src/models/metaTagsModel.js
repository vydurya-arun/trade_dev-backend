import mongoose from "mongoose";

const metaTagSchema = new mongoose.Schema(
  {
    metaTags_colour: { type: String, trim: true },
    metaTags_size: { type: String, trim: true },
    metaTags: { type: [String], default: [], set: (arr) => arr.map((t) => t.trim()).filter((t) => t.length > 0) },
  },
  {
    timestamps: true,
  }
);

const metaTagsModel = mongoose.model("MetaTags", metaTagSchema);
export default metaTagsModel;
