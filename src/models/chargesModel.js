// models/chargesModel.js
import mongoose from "mongoose";

const chargesSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const ChargesModel = mongoose.model("Charges", chargesSchema);
export default ChargesModel;
