import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
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
  },
  { timestamps: true }
);

const reviewModel =  mongoose.model("Review", reviewSchema);
export default reviewModel;