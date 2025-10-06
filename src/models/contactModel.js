import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {

    comment: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      required:true
    },
    email: {
      type: String,
      trim: true,
      required:true
    },
    phone: {
      type: String,
      trim: true,
      required:true
    },
  },
  { timestamps: true }
);

const contactModel =  mongoose.model("contacts", contactSchema);
export default contactModel;