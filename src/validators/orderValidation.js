import Joi from "joi";

// Cart item validation
const orderItemSchema = Joi.object({
  productName: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  imageUrl: Joi.string().uri().required(), // should be a valid URL
  variantName: Joi.string().min(1).required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  stock_quantity: Joi.number().integer().min(0).required(),
});

// Customer validation
const customerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().lowercase().optional(),
  phone: Joi.string().min(5).required(),
  address: Joi.string().min(1).required(),
  city: Joi.string().min(1).required(),
  postalCode: Joi.string().min(3).required(),
  country: Joi.string().min(1).required(),
});

// Main cart validation
export const orderValidate = Joi.object({
  customer: customerSchema.required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
});
