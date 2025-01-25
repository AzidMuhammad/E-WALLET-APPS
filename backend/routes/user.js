const express = require("express");
const { verifyToken } = require("../utils/jwtUtils");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cooperativeGroups");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = await Wallet.findOne({ userId: user._id });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const contactUserIds = new Set(
      wallet.transactions.map((transaction) => transaction.recipientId?.toString()).filter(Boolean) // Ambil recipientId yang valid
    );
    const contactsCount = contactUserIds.size;

    const cardsCount = (wallet.banks?.length || 0) + (wallet.eWallets?.length || 0);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        balance: wallet.balance || 0,
        transactions: wallet.transactions || [],
        cooperativeGroups: user.cooperativeGroups || [],
        contactsCount,
        cardsCount,
      },
    });
  } catch (error) {
    console.error("Fetch User Data Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch user data" });
  }
});

router.get('/account/:accountId', async (req, res) => {
  try {
    const user = await User.findOne({ 'eWallets.accountId': req.params.accountId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: "Name is required" 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile" 
    });
  }
});

module.exports = router;
