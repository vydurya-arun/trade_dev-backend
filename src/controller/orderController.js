import cartModel from "../models/cartModel.js";
import ChargesModel from "../models/chargesModel.js";
import OrderModel from "../models/orderModel.js"; // adjust path
import { sendOrderToWhatsApp } from "../utils/whatsapp.js";

export const createOrder = async (req, res) => {
  try {
    const { items, cartId, shippingAddress, notes } = req.body;
    const userId = req.user?.id;
    let finalItems = [];

    // ✅ Direct buy or cart checkout
    if (items && items.length > 0) {
      // Buy Now (Do NOT clear cart)
      finalItems = items.map((item) => ({
        product: item.product,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      }));
    } else if (cartId) {
      // Checkout from Cart
      const cart = await cartModel
        .findById(cartId)
        .populate("items.product items.variant");

      if (!cart || !cart.items.length) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty" });
      }

      finalItems = cart.items.map((item) => ({
        product: item.product?._id,
        variant: item.variant?._id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
      }));

      // ✅ Only clear cart when order is from cart
      cart.items = [];
      await cart.save();
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    // ✅ Auto calculate subtotal
    const subtotal = finalItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // ✅ Fetch charges from DB
    const charges = await ChargesModel.findOne();
    const tax = charges?.tax || 0;
    const shippingFee = charges?.shippingFee || 0;
    const discount = charges?.discount || 0;

    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = (subtotal * discount) / 100;

    const totalAmount = subtotal + taxAmount + shippingFee - discountAmount;

    // ✅ Create new order
    const newOrder = new OrderModel({
      user: userId,
      items: finalItems,
      subtotal,
      tax: taxAmount,
      shippingFee,
      discount: discountAmount,
      totalAmount,
      shippingAddress,
      notes,
    });

    const savedOrder = await newOrder.save();

    // ✅ Populate products & variants for WhatsApp message
    const tosendData = await OrderModel.findById(savedOrder._id)
      .populate("items.product")
      .populate("items.variant");

      // Send WhatsApp notification to seller
    await sendOrderToWhatsApp(tosendData);

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error("Create Order Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create order" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
    .populate("user", "username") 
    .populate("items.product", "product_name product_price product_imageUrl") 
    .populate("items.variant", "productvarient_name"); 
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

export const deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await OrderModel.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
};

// ✅ Delete all orders
export const deleteAllOrders = async (req, res) => {
  try {
    const result = await OrderModel.deleteMany();

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "No orders found to delete" });
    }

    res.status(200).json({ success: true, message: "All orders deleted successfully" });
  } catch (error) {
    console.error("Delete All Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete all orders" });
  }
};