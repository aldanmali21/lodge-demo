const prisma = require('../config/prisma');
const { writeAuditLog } = require('../services/audit.service');

async function listActivities(req, res) {
  const { date } = req.query;
  const activities = await prisma.activity.findMany({
    include: {
      schedules: {
        where: date
          ? {
              scheduledAt: {
                gte: new Date(date + 'T00:00:00'),
                lte: new Date(date + 'T23:59:59'),
              },
            }
          : undefined,
        include: {
          bookings: true,
        },
        orderBy: { scheduledAt: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  const result = activities.map(a => ({
    ...a,
    schedules: a.schedules.map(s => ({
      ...s,
      bookedPax: s.bookings.reduce((sum, b) => sum + b.paxCount, 0),
      bookingCount: s.bookings.length,
      isFull: s.bookings.reduce((sum, b) => sum + b.paxCount, 0) >= a.maxCapacity,
    })),
  }));

  res.json(result);
}

async function listSchedules(req, res) {
  const { date, from, to, status } = req.query;
  const where = {};
  if (date) {
    where.scheduledAt = { gte: new Date(date + 'T00:00:00'), lte: new Date(date + 'T23:59:59') };
  } else if (from || to) {
    where.scheduledAt = {};
    if (from) where.scheduledAt.gte = new Date(from + 'T00:00:00');
    if (to) where.scheduledAt.lte = new Date(to + 'T23:59:59');
  }
  if (status) where.status = status;

  const schedules = await prisma.activitySchedule.findMany({
    where,
    include: {
      activity: true,
      bookings: {
        include: {
          reservation: { select: { id: true, guestName: true } },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  const result = schedules.map(s => {
    const cap = s.capacity ?? s.activity.maxCapacity; // per-slot override falls back to activity max
    const bookedPax = s.bookings.reduce((sum, b) => sum + b.paxCount, 0);
    return {
      ...s,
      effectiveCapacity: cap,
      price: s.activity.price,
      bookings: s.bookings.map(b => ({
        ...b,
        guestLabel: b.reservation?.guestName || `Booking #${b.id}`,
      })),
      bookedPax,
      isFull: bookedPax >= cap,
    };
  });

  res.json(result);
}

// PATCH /api/activities/schedules/:id/status — not_started | in_progress | completed
async function updateScheduleStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;
  const valid = ['not_started', 'in_progress', 'completed'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
  }
  const schedule = await prisma.activitySchedule.update({ where: { id }, data: { status } });
  await writeAuditLog(req.user.id, 'update_schedule_status', 'activity_schedule', id, { status });
  res.json(schedule);
}

async function createActivity(req, res) {
  const { name, description, maxCapacity, scheduledAt, location } = req.body;
  if (!name || !maxCapacity) {
    return res.status(400).json({ error: 'name and maxCapacity are required.' });
  }

  const activity = await prisma.activity.create({
    data: {
      name,
      description: description || '',
      maxCapacity: Number(maxCapacity),
      schedules: scheduledAt
        ? { create: [{ scheduledAt: new Date(scheduledAt), location: location || '' }] }
        : undefined,
    },
    include: { schedules: true },
  });

  await writeAuditLog(req.user.id, 'create_activity', 'activity', activity.id, { name });
  res.status(201).json(activity);
}

async function createSchedule(req, res) {
  const { activityId, scheduledAt, endAt, capacity, location } = req.body;
  if (!activityId || !scheduledAt) {
    return res.status(400).json({ error: 'activityId and scheduledAt are required.' });
  }
  const activity = await prisma.activity.findUnique({ where: { id: Number(activityId) } });
  if (!activity) return res.status(404).json({ error: 'Activity not found.' });

  const schedule = await prisma.activitySchedule.create({
    data: {
      activityId: Number(activityId),
      scheduledAt: new Date(scheduledAt),
      endAt: endAt ? new Date(endAt) : null,
      capacity: capacity != null && capacity !== '' ? Number(capacity) : null,
      status: 'not_started',
      location: location || '',
    },
    include: { activity: true },
  });

  await writeAuditLog(req.user.id, 'create_schedule', 'activity_schedule', schedule.id, {
    activityId, scheduledAt, endAt, capacity, location,
  });
  res.status(201).json(schedule);
}

async function updateSchedule(req, res) {
  const id = Number(req.params.id);
  const { activityId, scheduledAt, endAt, capacity, location, status } = req.body;
  const schedule = await prisma.activitySchedule.findUnique({ where: { id } });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

  const data = {};
  if (activityId != null) data.activityId = Number(activityId);
  if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
  if (endAt !== undefined) data.endAt = endAt ? new Date(endAt) : null;
  if (capacity !== undefined) data.capacity = capacity === '' || capacity == null ? null : Number(capacity);
  if (location != null) data.location = location;
  if (status) data.status = status;

  const updated = await prisma.activitySchedule.update({ where: { id }, data, include: { activity: true } });
  await writeAuditLog(req.user.id, 'update_schedule', 'activity_schedule', id, data);
  res.json(updated);
}

async function updateActivity(req, res) {
  const id = Number(req.params.id);
  const { name, description, maxCapacity, price } = req.body;
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) return res.status(404).json({ error: 'Activity not found.' });

  const data = {};
  if (name != null) data.name = name;
  if (description != null) data.description = description;
  if (maxCapacity != null && maxCapacity !== '') data.maxCapacity = Number(maxCapacity);
  if (price != null && price !== '') data.price = Number(price);

  const updated = await prisma.activity.update({ where: { id }, data });
  await writeAuditLog(req.user.id, 'update_activity', 'activity', id, data);
  res.json(updated);
}

async function bookActivity(req, res) {
  const scheduleId = Number(req.params.id);
  const { reservationId, paxCount = 1 } = req.body;
  if (!reservationId) {
    return res.status(400).json({ error: 'reservationId is required.' });
  }

  const schedule = await prisma.activitySchedule.findUnique({
    where: { id: scheduleId },
    include: { activity: true, bookings: true },
  });
  if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

  const cap = schedule.capacity ?? schedule.activity.maxCapacity;
  const currentPax = schedule.bookings.reduce((sum, b) => sum + b.paxCount, 0);
  const pax = Number(paxCount);
  if (currentPax + pax > cap) {
    return res.status(409).json({ error: 'Activity is fully booked (overbooking prevented).' });
  }

  const unitPrice = Number(schedule.activity.price || 0);
  const charge = unitPrice * pax;

  const booking = await prisma.activityBooking.create({
    data: {
      scheduleId,
      reservationId: Number(reservationId),
      paxCount: pax,
    },
    include: { schedule: { include: { activity: true } } },
  });

  let billing = { charge, mode: null };

  if (charge > 0) {
    // In-house guest → charge the activity to their room folio.
    const folio = await prisma.folio.findUnique({ where: { reservationId: Number(reservationId) } });
    if (folio) {
      await prisma.folioItem.create({
        data: {
          folioId: folio.id,
          description: `Activity: ${schedule.activity.name} ×${pax}`,
          amount: charge,
          currency: folio.currency,
          type: 'activity',
        },
      });
      const allItems = await prisma.folioItem.findMany({ where: { folioId: folio.id } });
      const newTotal = allItems.reduce((s, i) => s + Number(i.amount), 0);
      await prisma.folio.update({ where: { id: folio.id }, data: { totalAmount: newTotal } });
      billing.mode = 'folio';
      billing.folioId = folio.id;
    }
  }

  await writeAuditLog(req.user.id, 'book_activity', 'activity_booking', booking.id, {
    scheduleId,
    reservationId: Number(reservationId),
    paxCount: pax,
    charge,
    billing: billing.mode,
  });

  res.status(201).json({ booking, billing });
}

module.exports = { listActivities, listSchedules, createActivity, createSchedule, updateSchedule, updateActivity, bookActivity, updateScheduleStatus };
