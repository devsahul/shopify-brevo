const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const BREVO_API_KEY = 'd71ca1e4aa2975e1fd60e1020704c2e001dd227bf16813eeb9f2c99ecbbc2ccd-R600W1u62yQ7d1LU'; // Replace with your real API key
const TEMPLATE_ID = 3; // Your actual Brevo template ID

app.post('/shopify-webhook', async (req, res) => {
  try {
    const order = req.body;

    const params = {
      firstName: order.customer?.first_name || '',
      orderName: order.name || '',
      email: order.email || '',
      shippingName: `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`,
      company: order.shipping_address?.company || '',
      address1: order.shipping_address?.address1 || '',
      address2: order.shipping_address?.address2 || '',
      city: order.shipping_address?.city || '',
      province: order.shipping_address?.province || '',
      zip: order.shipping_address?.zip || '',
      country: order.shipping_address?.country || '',
      phone: order.shipping_address?.phone || ''
    };

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: 'Catalyst Verification', email: 'verify@orders.catalystcase.com' },
      to: [{ email: order.email }],
      templateId: TEMPLATE_ID,
      params: params
    }, {
      headers: {
        'api-key': d71ca1e4aa2975e1fd60e1020704c2e001dd227bf16813eeb9f2c99ecbbc2ccd-R600W1u62yQ7d1LU,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).send('Email sent successfully via Brevo');
  } catch (err) {
    console.error('❌ Email sending failed:', err?.response?.data || err.message);
    res.status(500).send('Error sending email');
  }
});

app.listen(3000, () => {
  console.log('🚀 Listening for Shopify webhooks on port 3000');
});
