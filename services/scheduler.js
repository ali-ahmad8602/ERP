const Card = require('../models/Card');
const Board = require('../models/Board');
const Notification = require('../models/Notification');
const { createNotification } = require('./notification.service');

const ONE_HOUR = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;

async function checkDueDateReminders() {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + TWENTY_FOUR_HOURS);

    // Find cards due within 24h that are not archived and not done
    const boards = await Board.find({ isActive: true }).select('_id columns');

    // Collect "done" column IDs to exclude
    const doneColumnIds = [];
    for (const board of boards) {
      for (const col of board.columns) {
        if (col.name.toLowerCase() === 'done') doneColumnIds.push(col._id);
      }
    }

    const cards = await Card.find({
      isArchived: false,
      dueDate: { $gte: now, $lte: in24h },
      column: { $nin: doneColumnIds },
      'assignees.0': { $exists: true }, // has at least one assignee
    })
      .populate('assignees', '_id')
      .lean();

    for (const card of cards) {
      for (const assignee of card.assignees) {
        const recipientId = assignee._id.toString();

        // Dedupe: check if we already sent a reminder for this card+recipient in last 24h
        const existing = await Notification.findOne({
          recipient: recipientId,
          type: 'due_date_reminder',
          entityId: card._id,
          createdAt: { $gte: new Date(now.getTime() - TWENTY_FOUR_HOURS) },
        });

        if (!existing) {
          const dueDate = new Date(card.dueDate);
          const hoursLeft = Math.round((dueDate.getTime() - now.getTime()) / ONE_HOUR);

          await createNotification({
            recipient: recipientId,
            type: 'due_date_reminder',
            title: 'Due date approaching',
            message: `"${card.title}" is due in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`,
            entityType: 'card',
            entityId: card._id,
            department: card.board?.department || null,
            sender: null,
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.error('Scheduler: due date reminder error:', err.message);
  }
}

// Run every hour
const interval = setInterval(checkDueDateReminders, ONE_HOUR);

// Run once on startup (after a short delay to let DB connect)
setTimeout(checkDueDateReminders, 10000);

console.log('Scheduler: due date reminders active (every 1h)');

module.exports = { checkDueDateReminders, interval };
