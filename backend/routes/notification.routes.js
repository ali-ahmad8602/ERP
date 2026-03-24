const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/notifications — list notifications for current user
router.get('/', async (req, res) => {
  try {
    const { unreadOnly, limit = 50, before } = req.query;

    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;
    if (before) query.createdAt = { $lt: new Date(before) };

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort('-createdAt')
        .limit(parseInt(limit))
        .populate('sender', 'name avatar')
        .populate('department', 'name slug icon color')
        .lean(),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark single as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
