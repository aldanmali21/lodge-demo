const router = require('express').Router();
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');

router.get('/summary', authenticate, authorizeRoles('admin', 'frontdesk'), async (req, res) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);

  const [arrivals, departures, allRooms, inHousePayments] = await Promise.all([
    prisma.reservation.findMany({
      where: { checkinDate: { gte: todayStart, lte: todayEnd }, status: { in: ['confirmed', 'checked_in'] } },
      include: { reservationRooms: { include: { room: true } } },
    }),
    prisma.reservation.findMany({
      where: { checkoutDate: { gte: todayStart, lte: todayEnd }, status: 'checked_in' },
      include: { reservationRooms: { include: { room: true } } },
    }),
    prisma.room.findMany(),
    prisma.payment.findMany({
      where: { timestamp: { gte: todayStart, lte: todayEnd } },
    }),
  ]);

  const occupied = allRooms.filter(r => r.status === 'occupied').length;
  const totalRooms = allRooms.length;
  const occupancyPct = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  const usdTotal = inHousePayments.filter(p => p.currency === 'USD').reduce((s, p) => s + Number(p.amount), 0);
  const ugxTotal = inHousePayments.filter(p => p.currency === 'UGX').reduce((s, p) => s + Number(p.amount), 0);

  res.json({
    date: today.toISOString(),
    arrivals: { count: arrivals.length, list: arrivals },
    departures: { count: departures.length, list: departures },
    occupancy: { percent: occupancyPct, occupied, total: totalRooms },
    collections: { usd: usdTotal, ugx: ugxTotal },
  });
});

module.exports = router;
