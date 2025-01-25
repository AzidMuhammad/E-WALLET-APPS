const mongoose = require('mongoose');
const User = require('./User');

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  banks: [
    {
      name: { type: String, required: true },
      accountNumber: { type: String, required: true },
    },
  ],
  eWallets: [
    {
      name: { type: String, required: true },
      accountId: { type: String, required: true },
    },
  ],
  transactions: [
    {
      type: { type: String, enum: ["BANK", "E-WALLET", 'TOP_UP', 'WITHDRAW'], required: true },
      amount: { type: Number, required: true },
      description: String,
      method: { type: String, required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
      recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User",},
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

walletSchema.pre('save', async function (next) {
  try {
    console.log('Wallet Balance:', this.balance);
    const user = await mongoose.model('User').findById(this.userId);
    if (user) {
      console.log('User Before Update:', user.balance);
      user.balance = this.balance;
      await user.save();
      console.log('User After Update:', user.balance);
    }
    next();
  } catch (error) {
    console.error('Error in Wallet Middleware:', error.message);
    next(error);
  }
});

module.exports = mongoose.model('Wallet', walletSchema);
