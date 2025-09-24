import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
export const sendOrderToWhatsApp = async (order) => {
  try {
    // limit items to first 10
    const MAX_ITEMS = 10;
    const itemLines = order.items
      .slice(0, MAX_ITEMS)
      .map(
        i =>
          `- ${i.product?.product_name || i.product.toString()} (${i.variant?.productvarient_name || "N/A"}) x${i.quantity} = ₹${i.price}`
      );

    if (order.items.length > MAX_ITEMS) {
      itemLines.push(`...and ${order.items.length - MAX_ITEMS} more items`);
    }

    const messageBody = `
🛒 *New Order Received!*

👤 Customer: ${order.shippingAddress.fullName}
📞 Phone: ${order.shippingAddress.phone}
🏠 Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.state}, ${order.shippingAddress.country}

📦 *Items:*
${itemLines.join("\n")}

💰 Total Amount: ₹${order.totalAmount}

✅ Please prepare the order!
    `;

    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.SELLER_WHATSAPP_NUMBER,
      body: messageBody,
    });

    console.log("WhatsApp message sent:", msg.sid);
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
  }
};
