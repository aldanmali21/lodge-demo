const router = require('express').Router();
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth.middleware');

const ACTION_LABELS = {
  create_reservation: 'created a reservation',
  check_in: 'checked in a guest',
  check_out: 'checked out a guest',
  record_payment: 'recorded a payment',
  add_folio_item: 'added a folio charge',
  complete_task: 'completed a housekeeping task',
  book_activity: 'booked an activity',
  create_activity: 'created an activity',
  create_room: 'added a room',
  update_room_status: 'updated room status',
  pos_charge_to_room: 'added a POS charge to room',
  pos_cash_sale: 'processed a cash sale',
};

router.get('/', authenticate, async (req, res) => {
  const { all, limit = 20, actor, action, from, to, offset = 0 } = req.query;

  const where = {};
  if (actor) where.actorId = Number(actor);
  if (action) where.action = action;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: { actor: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: Number(offset),
  });

  const formatted = logs.map(l => ({
    ...l,
    actionLabel: ACTION_LABELS[l.action] || l.action,
  }));

  res.json(formatted);
});

// Per-user unread count: events since this user last opened the drawer.
// Falls back to the last 24h if they've never viewed notifications.
router.get('/count', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
    select: { notificationsSeenAt: true },
  });
  const since = user?.notificationsSeenAt || new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.auditLog.count({ where: { createdAt: { gt: since } } });
  res.json({ count });
});

// Mark notifications as seen for the current user (called when the drawer opens).
router.post('/seen', authenticate, async (req, res) => {
  await prisma.user.update({
    where: { id: Number(req.user.id) },
    data: { notificationsSeenAt: new Date() },
  });
  res.json({ ok: true });
});

module.exports = router;
