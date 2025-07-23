const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const TEMPLATE_ID = 3;

app.post('/shopify-webhook', async (req, res) => {
  try {
    const order = req.body;

    // 🐞 Debug: Print raw payload from Shopify
    console.log('📩 Raw Shopify Payload:', JSON.stringify(order, null, 2));

    // ✅ Construct shipping name in comma-separated format
    const shippingFirst = order.shipping_address?.first_name || '';
    const shippingLast = order.shipping_address?.last_name || '';
    const company = order.shipping_address?.company || '';
    const shippingName = [shippingFirst, shippingLast, company].filter(Boolean).join(', ');

    // ✅ Prepare dynamic params for Brevo email template
    const params = {
      firstName: order.customer?.first_name || '',
      orderName: order.name || '',
      email: order.email || '',
      shippingName,
      company,
      address1: order.shipping_address?.address1 || '',
      address2: order.shipping_address?.address2 || '',
      city: order.shipping_address?.city || '',
      province: order.shipping_address?.province || '',
      zip: order.shipping_address?.zip || '',
      country: order.shipping_address?.country || '',
      phone: order.shipping_address?.phone || ''
    };

    console.log('📦 Sending email with params:', params);

    // ✅ Call Brevo API
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Catalyst Verification',
          email: 'verify@orders.catalystcase.com'
        },
        to: [{ email: order.email }],
        templateId: TEMPLATE_ID,
        params: params
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Brevo response:', response.data);
    res.status(200).send('✅ Email sent successfully via Brevo');
  } catch (err) {
    console.error('❌ Email sending failed:', err?.response?.data || err.message);
    res.status(500).send('❌ Error sending email');
  }
});

app.listen(3000, () => {
  console.log('🚀 Shopify-Brevo Webhook running on port 3000');
});
