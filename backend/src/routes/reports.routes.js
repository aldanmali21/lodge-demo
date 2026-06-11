const router = require('express').Router();
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');

const TAX_TOURISM = 0.05;
const TAX_VAT = 0.18;

function methodBucket(method = '') {
  const m = method.toLowerCase();
  if (m.includes('cash')) return 'cash';
  if (m.includes('airtel') || m.includes('mtn') || m.includes('momo') || m.includes('mobile')) return 'mobile';
  if (m.includes('card') || m.includes('credit') || m.includes('debit') || m.includes('terminal')) return 'card';
  return 'cash';
}

function nights(checkin, checkout) {
  const ms = new Date(checkout) - new Date(checkin);
  return Math.max(1, Math.round(ms / 86400000));
}

// GET /api/reports/summary?from=&to=  — one aggregated payload for all report sections
router.get('/summary', authenticate, authorizeRoles('admin', 'frontdesk', 'viewer'), async (req, res) => {
  const to = req.query.to ? new Date(req.query.to + 'T23:59:59') : new Date();
  const from = req.query.from ? new Date(req.query.from + 'T00:00:00') : new Date(Date.now() - 30 * 86400000);

  const [payments, rooms, reservations, schedules, housekeepingTasks] = await Promise.all([
    prisma.payment.findMany({
      where: { timestamp: { gte: from, lte: to } },
      include: { folio: { include: { reservation: { select: { guestName: true } } } } },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.room.findMany(),
    prisma.reservation.findMany({
      where: { checkinDate: { lte: to }, checkoutDate: { gte: from } },
      include: { reservationRooms: { include: { room: true } } },
    }),
    prisma.activitySchedule.findMany({
      where: { scheduledAt: { gte: from, lte: to } },
      include: { activity: true, bookings: true },
    }),
    prisma.housekeepingTask.findMany({
      where: { timestamp: { gte: from, lte: to } },
      include: { room: true },
      orderBy: { timestamp: 'asc' },
    }),
  ]);

  // --- Revenue & Payments ---
  const byMethod = { cash: 0, mobile: 0, card: 0 };
  const byCurrency = { USD: 0, UGX: 0 };
  const byDay = {};
  let totalRevenue = 0;
  for (const p of payments) {
    const amt = Number(p.amount);
    totalRevenue += amt;
    byMethod[methodBucket(p.method)] += amt;
    byCurrency[p.currency] = (byCurrency[p.currency] || 0) + amt;
    const day = new Date(p.timestamp).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + amt;
  }

  // --- Occupancy & Rooms ---
  const totalRooms = rooms.length;
  const rangeDays = Math.max(1, Math.round((to - from) / 86400000));
  const availableRoomNights = totalRooms * rangeDays;
  let roomNightsSold = 0;
  let roomRevenue = 0;
  const nightsByType = {};
  for (const r of reservations) {
    const n = nights(r.checkinDate, r.checkoutDate);
    for (const rr of r.reservationRooms) {
      roomNightsSold += n;
      const rate = Number(rr.room?.defaultRate || 0);
      roomRevenue += rate * n;
      const t = rr.room?.type || 'Unknown';
      nightsByType[t] = (nightsByType[t] || 0) + n;
    }
  }
  const occupancyPct = availableRoomNights ? Math.round((roomNightsSold / availableRoomNights) * 100) : 0;
  const adr = roomNightsSold ? roomRevenue / roomNightsSold : 0;
  const revpar = totalRooms ? roomRevenue / (totalRooms * rangeDays) : 0;

  // --- Activities ---
  const activityStats = {};
  for (const s of schedules) {
    const key = s.activity.name;
    if (!activityStats[key]) activityStats[key] = { name: key, bookings: 0, pax: 0, revenue: 0 };
    for (const b of s.bookings) {
      activityStats[key].bookings += 1;
      activityStats[key].pax += b.paxCount;
      activityStats[key].revenue += Number(s.activity.price || 0) * b.paxCount;
    }
  }

  const guestStatusCounts = { pending: 0, confirmed: 0, checked_in: 0, checked_out: 0 };
  for (const reservation of reservations) {
    if (guestStatusCounts[reservation.status] != null) guestStatusCounts[reservation.status] += 1;
  }

  const housekeepingCounts = { dirty: 0, cleaning: 0, clean: 0 };
  for (const task of housekeepingTasks) {
    if (housekeepingCounts[task.status] != null) housekeepingCounts[task.status] += 1;
  }

  const roomAvailability = { available: 0, occupied: 0 };
  const roomCleanliness = { dirty: 0, cleaning: 0, clean: 0 };
  for (const room of rooms) {
    if (roomAvailability[room.status] != null) roomAvailability[room.status] += 1;
    if (roomCleanliness[room.housekeepingStatus] != null) roomCleanliness[room.housekeepingStatus] += 1;
  }

  const housekeepingByDay = {};
  for (const task of housekeepingTasks) {
    const day = new Date(task.timestamp).toISOString().slice(0, 10);
    if (!housekeepingByDay[day]) housekeepingByDay[day] = { dirty: 0, cleaning: 0, clean: 0 };
    if (housekeepingByDay[day][task.status] != null) housekeepingByDay[day][task.status] += 1;
  }

  // --- Outstanding folios ---
  const openFolios = await prisma.folio.findMany({
    where: { status: { in: ['open'] } },
    include: { items: true, payments: true, reservation: { select: { guestName: true } } },
  });
  const outstanding = openFolios.map(f => {
    const subtotal = f.items.reduce((s, i) => s + Number(i.amount), 0);
    const grand = subtotal * (1 + TAX_TOURISM + TAX_VAT);
    const paid = f.payments.reduce((s, p) => s + Number(p.amount), 0);
    return { id: f.id, guestName: f.reservation?.guestName || `Folio #${f.id}`, currency: f.currency, grandTotal: grand, paid, balance: grand - paid };
  }).filter(f => f.balance > 0.01);

  const reconciliations = await prisma.shiftReconciliation.findMany({
    where: { date: { gte: from, lte: to } },
    orderBy: { date: 'desc' },
    include: { closer: { select: { name: true } } },
    take: 30,
  });

  res.json({
    range: { from: from.toISOString(), to: to.toISOString(), days: rangeDays },
    revenue: {
      total: totalRevenue,
      byMethod,
      byCurrency,
      byDay: Object.entries(byDay).sort().map(([day, amount]) => ({ day, amount })),
      transactions: payments.length,
    },
    occupancy: {
      percent: occupancyPct, roomNightsSold, availableRoomNights,
      adr, revpar, roomRevenue,
      nightsByType: Object.entries(nightsByType).map(([type, nights]) => ({ type, nights })),
    },
    activities: {
      perActivity: Object.values(activityStats),
      totalRevenue: Object.values(activityStats).reduce((s, a) => s + a.revenue, 0),
    },
    guests: {
      byStatus: Object.entries(guestStatusCounts).map(([status, count]) => ({ status, count })),
    },
    housekeeping: {
      byStatus: Object.entries(housekeepingCounts).map(([status, count]) => ({ status, count })),
      byDay: Object.entries(housekeepingByDay).sort().map(([day, counts]) => ({ day, ...counts })),
      roomAvailability,
      roomCleanliness,
    },
    outstanding,
    reconciliations,
  });
});

module.exports = router;
