import mongoose from "mongoose";

const productVarientSchema = new mongoose.Schema(
  {
    productvarient_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", 
        required: true,
    },
    productvarient_description: {
      type: String,
      trim: true,
    },
    productvarient_price: {
      type: Number,
      required: true,
      min: 0,
    },
    productvarient_color:{
      type:String,
      enum:['red','blue','orange','white','black','green']
    },
    productvarient_size:{
      type:String,
      enum:["XS", "S", "M", "L", "XL"]
    },
    tags:{
      type:[String],
      enum: {
        values: ["buckets", "brushes", "cleaning"],
        message: "Invalid tag value",
      },
    },
    productvarient_images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    productvarient_sale_price: {
      type: Number,
      min: 0,
      default: null,
    },
    productvarient_stock_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const productVarientModel = mongoose.model(
  "Product_Varient",
  productVarientSchema
);

export default productVarientModel;
