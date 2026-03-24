const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Card = require('../models/Card');
const Board = require('../models/Board');
const upload = require('../config/upload');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/cards/:cardId/attachments — upload file
router.post('/:cardId/attachments', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: err.message });
    }

    try {
      if (!req.file) return res.status(400).json({ message: 'No file provided' });

      const card = await Card.findById(req.params.cardId);
      if (!card || card.isArchived) return res.status(404).json({ message: 'Card not found' });

      // Board access check — at least editor
      const board = await Board.findById(card.board);
      if (!board || !board.isActive) return res.status(404).json({ message: 'Board not found' });
      if (board.settings.isLocked) return res.status(403).json({ message: 'Board is locked' });

      const { orgRole, departments, boardPermissions } = req.user;
      if (orgRole !== 'super_admin') {
        if (board.isCompanyBoard && !['top_management', 'org_admin'].includes(orgRole)) {
          return res.status(403).json({ message: 'Access denied' });
        }
        if (board.department && orgRole !== 'top_management' && orgRole !== 'org_admin') {
          const deptMembership = departments.find(d => d.department.toString() === board.department.toString());
          if (!deptMembership) return res.status(403).json({ message: 'Access denied' });
        }
        const boardPerm = boardPermissions.find(b => b.board.toString() === card.board.toString());
        const role = boardPerm?.role || 'editor';
        const hierarchy = { board_owner: 4, editor: 3, commenter: 2, viewer: 1 };
        if ((hierarchy[role] || 0) < hierarchy['editor']) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      card.attachments.push({
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        uploadedBy: req.user._id,
      });

      card.auditLog.push({
        user: req.user._id,
        action: 'attachment_added',
        detail: req.file.originalname,
      });

      await card.save();
      await card.populate('attachments.uploadedBy', 'name avatar');
      res.status(201).json({ card });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// DELETE /api/cards/:cardId/attachments/:attachmentId — remove attachment
router.delete('/:cardId/attachments/:attachmentId', async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card || card.isArchived) return res.status(404).json({ message: 'Card not found' });

    const attachment = card.attachments.id(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    // Try to delete file from disk
    const filePath = path.join(__dirname, '..', attachment.url);
    try { fs.unlinkSync(filePath); } catch { /* file may not exist */ }

    card.auditLog.push({
      user: req.user._id,
      action: 'attachment_removed',
      detail: attachment.name,
    });

    attachment.deleteOne();
    await card.save();
    res.json({ card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
