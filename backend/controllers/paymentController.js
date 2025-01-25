const axios = require("axios");

async function externalPaymentGateway(paymentDetails) {
  try {
    const response = await axios.post("https://payment-gateway.com/api/pay", paymentDetails);
    return response.data;
  } catch (error) {
    throw new Error("Failed to process payment: " + error.message);
  }
}

module.exports = { externalPaymentGateway };
