const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    console.log("Fetching notifications for user:", req.user.id);

    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (!notifications.length) {
      console.log("No notifications found for user:", req.user.id);
    }

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) return res.status(404).json({ error: "Notification not found" });

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
