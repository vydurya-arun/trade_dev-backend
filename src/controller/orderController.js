
import OrderModel from "../models/orderModel.js";
import { sendOrderToWhatsApp } from "../utils/whatsapp.js";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, taxAmount, shippingFee, discountAmount, subtotal, totalAmount } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }
    if (!subtotal || !totalAmount) {
      return res.status(400).json({ success: false, message: "Subtotal and total amount are required" });
    }
    if (!shippingAddress || !taxAmount || !discountAmount || !shippingFee) {
      return res.status(400).json({ success: false, message: "Invalid Fields" });
    }

    // ✅ Map items
    const finalItems = items.map((item) => ({
      product: item.product,     // ✅ matches frontend
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity,
    }));

    // ✅ Create order
    const newOrder = new OrderModel({
      items: finalItems,
      subtotal,
      tax: taxAmount,  
      shippingFee,
      discount: discountAmount,
      totalAmount,
      shippingAddress,
    });

    const savedOrder = await newOrder.save();

    // ✅ Populate for WhatsApp
    const tosendData = await OrderModel.findById(savedOrder._id)
      .populate("items.product")
      .populate("items.variant")
      .lean();

    await sendOrderToWhatsApp(tosendData);

    res.status(201).json({ success: true, order: tosendData });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
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