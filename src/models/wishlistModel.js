import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product_Varient",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } 
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ one wishlist per user
    },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

const wishlistModel =  mongoose.model("Wishlist", wishlistSchema);
export default wishlistModel;
