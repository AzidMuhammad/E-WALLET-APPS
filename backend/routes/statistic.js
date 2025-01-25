const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const User = require("../models/User");

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const incomeTransactions = wallet.transactions.filter(tx => tx.amount > 0 && tx.type === "E-WALLET");
    const expenseTransactions = wallet.transactions.filter(tx => tx.amount > 0 && tx.type === "BANK");

    const income = incomeTransactions.reduce((total, tx) => total + tx.amount, 0);
    const expense = expenseTransactions.reduce((total, tx) => total + tx.amount, 0);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      balance: wallet.balance,
      transactions: wallet.transactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        createdAt: tx.createdAt,
        recipientId: tx.recipientId,
      })),
      income: formatRupiah(income),
      expense: formatRupiah(expense),
    });
  } catch (error) {
    console.error("Error fetching statistics:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch statistics" });
  }
});

module.exports = router;
