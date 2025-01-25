const express = require("express");
const { verifyToken } = require("../utils/jwtUtils");
const router = express.Router();
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const cron = require("node-cron");
const Notification = require("../models/Notification");
const Cooperative = require("../models/Cooperative");

cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];
  console.log(`Cron Job Running for Date: ${today}`);

  try {
    const cooperatives = await Cooperative.find({ "loans.dueDate": today });

    if (!cooperatives.length) {
      console.log("No loans due today.");
      return;
    }

    for (const cooperative of cooperatives) {
      for (const loan of cooperative.loans) {
        if (loan.dueDate === today) {
          console.log(`Creating notification for user: ${loan.userId}`);
          await Notification.create({
            user: loan.userId,
            message: `Your loan payment of Rp ${formatRupiah(loan.amount)} for ${cooperative.name} is due today.`,
          });
        }
      }
    }

    console.log("Cron job executed successfully.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

router.get("/", verifyToken, getNotifications);
router.patch("/:id/read", verifyToken, markAsRead);

module.exports = router;
