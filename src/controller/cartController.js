import cartModel from "../models/cartModel.js";
import ProductModel from "../models/productModel.js";
import productVarientModel from "../models/ProductVariant.js";


// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Login or invalid user" });
    }

    const { productId, variantId, quantity } = req.body;

    // ✅ Get product price (from variant if exists, else from product)
    let price = 0;

    if (variantId) {
      const variant = await productVarientModel.findById(variantId);
      if (!variant) {
        return res
          .status(404)
          .json({ success: false, message: "Product variant not found" });
      }
      price = variant.productvarient_sale_price; // <<-- ensure your schema field is `sale_price`
    } else {
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      price = product.sale_price; // <<-- fallback
    }

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }

    // ✅ Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (!variantId || item.variant?.toString() === variantId)
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
      existingItem.price = price; // update price (if it changed)
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId || null,
        quantity: quantity || 1,
        price,
        totalPrice: (quantity || 1) * price,
      });
    }

    await cart.save();

    res.json({ success: true, data:cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const cart = await cartModel
      .findOne({ user: userId })
      .populate("items.product", "product_name product_price product_imageUrl sale_price") // only needed fields
      .populate("items.variant", "productvarient_name");

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const { itemId, quantity } = req.body;

    const cart = await cartModel.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item
export const removeCartItem = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const { itemId } = req.params;

    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // ✅ Get the subdocument by id
    const item = cart.items.id(itemId);
    console.log(item,"testing")
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    cart.items.pull(itemId); // ✅ correct way
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
