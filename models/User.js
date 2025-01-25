const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  cooperativeGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cooperative" }],
  balance: { type: Number, default: 0 },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
});

module.exports = mongoose.model("User", userSchema);