import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product_Varient", // optional if you use variants
  },
  price: {
    type: Number,
    required: true, // Finalized single-unit price at time of order
  },
  totalPrice: {
    type: Number,
    required: true, // quantity * price
  },
});

// Automatically calculate totalPrice for each item
cartItemSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.price;
  next();
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Helper method to recalc all items (useful for updates)
cartSchema.methods.recalculateTotals = function () {
  this.items.forEach((item) => {
    item.totalPrice = item.quantity * item.price;
  });
};

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;
