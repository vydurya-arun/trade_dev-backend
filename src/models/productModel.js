
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // if each product name must be unique
    },
    product_description: {
      type: String,
      trim: true,
    },
    product_price: {
      type: Number,
      required: true,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    product_imageUrl:{type:String,required:true},
    imagePublicId:{type:String,required:true},
    sale_price: {
      type: Number,
      min: 0,
      default: null, // optional: only if product is on sale
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    low_stock_threshold: {
      type: Number,
      default: 5, // you can set your business logic default
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
      required: true,
    },
  },
  { timestamps: true } 
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;