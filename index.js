const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/order-hook', async (req, res) => {
  const order = req.body;

  if (!order || !order.email || !order.shipping_address) {
    return res.status(400).send('Invalid order data');
  }

  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: "Catalyst Verification",
        email: "verify@orders.catalystcase.com"
      },
      to: [{
        email: order.email,
        name: order.customer?.first_name || "Customer"
      }],
      templateId: 3,
      params: {
        firstName: order.customer?.first_name || "Customer",
        email: order.email,
        orderName: order.name,
        shippingName: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        company: order.shipping_address.company || "",
        address1: order.shipping_address.address1,
        address2: order.shipping_address.address2 || "",
        city: order.shipping_address.city,
        province: order.shipping_address.province,
        zip: order.shipping_address.zip,
        country: order.shipping_address.country,
        phone: order.shipping_address.phone || ""
      }
    }, {
      headers: {
        'api-key': process.env.vfffwfqw42154646hjghgh,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).send('✅ Email sent via Brevo');
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('❌ Failed to send email');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Node server running");
});
