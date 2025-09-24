import wishlistModel from "../models/wishlistModel.js";
import ProductModel from "../models/productModel.js";

// ✅ Create or Add to Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // assuming JWT middleware sets req.user
    const { productId, variantId } = req.body;

    // Check if wishlist exists
    let wishlist = await wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new wishlistModel({ user: userId, items: [] });
    }

    // Check if product already exists in wishlist
    const alreadyExists = wishlist.items.some(
      (item) =>
        item.product.toString() === productId &&
        (!variantId || item.variant?.toString() === variantId)
    );

    if (alreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "Item already in wishlist" });
    }

    wishlist.items.push({
      product: productId,
      variant: variantId || undefined,
    });

    await wishlist.save();

    res.status(201).json({ success: true, data:wishlist });
  } catch (error) {
    console.error("Add to Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to add item" });
  }
};

// ✅ Get All Wishlists (admin use)
export const getAllWishlists = async (req, res) => {
  try {
    const wishlists = await wishlistModel.find()
      .populate("user", "username")
      .populate("items.product", "product_name sale_price product_imageUrl")
      .populate("items.variant", "productvarient_name");

    res.json({ success: true, wishlists });
  } catch (error) {
    console.error("Get All Wishlists Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wishlists" });
  }
};

// ✅ Get Wishlist by User
export const getWishlistByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const wishlist = await wishlistModel.findOne({ user: userId })
      .populate("items.product", "product_name sale_price product_imageUrl")
      .populate("items.variant", "productvarient_name");

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    res.json({ success: true, data:wishlist });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

// ✅ Update Wishlist Item (replace variant for example)
export const updateWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { variantId } = req.body;

    const wishlist = await wishlistModel.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    const item = wishlist.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    item.variant = variantId;
    await wishlist.save();

    res.json({ success: true, wishlist });
  } catch (error) {
    console.error("Update Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to update item" });
  }
};

// ✅ Delete Item from Wishlist
export const deleteWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const wishlist = await wishlistModel.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter((item) => item._id.toString() !== itemId);
    await wishlist.save();

    res.json({ success: true, message: "Item removed", wishlist });
  } catch (error) {
    console.error("Delete Wishlist Item Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};

// ✅ Delete Entire Wishlist (optional, admin use)
export const deleteWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await wishlistModel.findOneAndDelete({ user: userId });

    res.json({ success: true, message: "Wishlist deleted" });
  } catch (error) {
    console.error("Delete Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete wishlist" });
  }
};
