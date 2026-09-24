const { getDb, saveDb } = require('../config/db');

exports.getMyNotifications = (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const userNotifications = db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = userNotifications.filter((n) => !n.read).length;

    return res.json({
      success: true,
      unreadCount,
      notifications: userNotifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

exports.markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    if (id === 'all') {
      db.notifications.forEach((n) => {
        if (n.userId === req.user.id) n.read = true;
      });
    } else {
      const notif = db.notifications.find((n) => n.id === id && n.userId === req.user.id);
      if (notif) notif.read = true;
    }

    saveDb(db);
    return res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};
