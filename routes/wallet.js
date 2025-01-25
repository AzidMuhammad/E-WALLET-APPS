const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Notification = require("../models/Notification");
const { verifyToken } = require('../utils/jwtUtils');

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount) + '.000';
}

router.get('/:userId', async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    res.json({ balance: formatRupiah(wallet.balance), banks: wallet.banks, eWallets: wallet.eWallets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { userId, initialBalance, banks, eWallets } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
      return res.status(400).json({ message: 'Wallet already exists for this user' });
    }

    const wallet = new Wallet({
      userId,
      balance: initialBalance || 0,
      banks: banks || [],
      eWallets: eWallets || [],
    });

    const newWallet = await wallet.save();
    user.wallet = newWallet._id;
    await user.save();

    res.status(201).json(newWallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:userId/transaction", async (req, res) => {
  const { type, amount, description, method, recipientId } = req.body;

  if (!type || !amount || amount <= 0 || !method || !recipientId) {
    return res.status(400).json({
      message: "Valid type, positive amount, method, and recipientId are required",
    });
  }

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const senderWallet = await Wallet.findOne({ userId: req.params.userId }).session(session);
    if (!senderWallet) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Sender wallet not found" });
    }

    let recipientWallet = null;

    if (type === "E-WALLET") {
      recipientWallet = await Wallet.findOne({ "eWallets.accountId": recipientId }).session(session);
    } else if (type === "BANK") {
      recipientWallet = await Wallet.findOne({ "banks.accountNumber": recipientId }).session(session);
    }

    if (!recipientWallet) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient wallet not found" });
    }

    // Ambil nama penerima dari koleksi User berdasarkan recipientId
    const recipientUser = await User.findById(recipientWallet.userId);
    if (!recipientUser) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient user not found" });
    }

    const recipientName = recipientUser.name; // Ambil nama penerima

    if (type === "E-WALLET" && senderWallet.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance for this transaction" });
    }

    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    senderWallet.transactions.push({
      type,
      amount,
      description,
      method,
      senderId: senderWallet.userId,
      recipientId: recipientWallet.userId,
    });

    recipientWallet.transactions.push({
      type,
      amount,
      description: `Received from userId ${req.params.userId}`,
      method,
      senderId: senderWallet.userId,
    });

    await senderWallet.save({ session });
    await recipientWallet.save({ session });

    await Notification.create(
      [
        {
          user: req.params.userId,
          message: `You have successfully sent Rp ${formatRupiah(amount)} to ${recipientName}.`,
        },
        {
          user: recipientWallet.userId,
          message: `You have received Rp ${formatRupiah(amount)} from ${senderWallet.userId}.`,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Transaction successful',
      transaction: {
        amount,
        recipientName,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        referenceId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        fee: 0,
        recipientBalance: recipientWallet.balance,
        senderBalance: senderWallet.balance,
      },
    });

  } catch (error) {
    console.error("Error processing transaction:", error.message);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

router.get('/:userId/transactions', async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transactions = await Promise.all(
      wallet.transactions.map(async (transaction) => {
        const transactionObj = transaction.toObject();
        transactionObj.amount = formatRupiah(transaction.amount);

        if (transaction.recipientId) {
          console.log(`Fetching recipient for ID: ${transaction.recipientId}`);
          const recipient = await User.findById(transaction.recipientId);
          if (recipient) {
            console.log(`Recipient found: ${recipient.name}`);
            transactionObj.recipientName = recipient.name;
            transactionObj.recipientPhone = recipient.phone || 'No Phone Number';
          } else {
            console.log("Recipient not found.");
            transactionObj.recipientName = 'Unknown Recipient';
            transactionObj.recipientPhone = 'Unknown Phone';
          }
        } else {
          transactionObj.recipientName = null;
          transactionObj.recipientPhone = null;
        }

        return transactionObj;
      })
    );

    res.json(transactions);
  } catch (error) {
    console.error("Error in transactions endpoint:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/:userId/topup", async (req, res) => {
  const { amount, description } = req.body;

  console.log("Topup Request:", { 
    userId: req.params.userId, 
    amount, 
    description 
  });

  if (!amount || amount <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid top-up amount",
      details: { amount }
    });
  }

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId }).session(session);
    
    if (!wallet) {
      console.error("Wallet not found for user:", req.params.userId);
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "Wallet not found",
        details: { userId: req.params.userId }
      });
    }

    const topUpAmount = Number(amount);
    if (isNaN(topUpAmount)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid amount format",
        details: { amount }
      });
    }

    wallet.balance += topUpAmount;
    
    wallet.transactions.push({
      type: "TOP_UP",
      amount: topUpAmount,
      description: description || "Top Up",
      method: "E-WALLET"
    });

    await wallet.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Top-up successful",
      newBalance: wallet.balance
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Top-up Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process top-up",
      details: error.message
    });
  }
});

router.post("/:userId/withdraw", verifyToken, async (req, res) => {
  const { amount, description } = req.body;

  // Validate amount
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid withdraw amount"
    });
  }

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    // Find wallet
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    
    if (!wallet) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: "Wallet not found"
      });
    }

    // Check sufficient balance
    if (wallet.balance < parsedAmount) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient balance" 
      });
    }

    // Update wallet balance
    wallet.balance -= parsedAmount;
    
    // Add transaction record
    wallet.transactions.push({
      type: "WITHDRAW",
      amount: parsedAmount,
      description: description || "Withdraw",
      method: "E-WALLET",
      date: new Date()
    });

    await wallet.save();

    res.json({
      success: true,
      message: "Withdraw successful",
      newBalance: wallet.balance
    });

  } catch (error) {
    console.error("Withdraw Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process withdrawal"
    });
  }
});

module.exports = router;
