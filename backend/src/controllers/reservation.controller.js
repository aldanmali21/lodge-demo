const prisma = require('../config/prisma');
const { setReservationRoomsStatus } = require('../services/room.service');
const { writeAuditLog } = require('../services/audit.service');

async function listReservations(req, res) {
  const { from, to, status } = req.query;
  const where = {};

  if (status) where.status = status;
  if (from || to) {
    const rangeFrom = from ? new Date(`${from}T00:00:00`) : new Date('1970-01-01T00:00:00');
    const rangeTo = to ? new Date(`${to}T23:59:59`) : new Date('2999-12-31T23:59:59');
    where.checkinDate = { lte: rangeTo };
    where.checkoutDate = { gte: rangeFrom };
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      reservationRooms: { include: { room: true } },
      folio: true,
    },
    orderBy: { checkinDate: 'asc' },
  });
  res.json(reservations);
}

async function getReservation(req, res) {
  const id = Number(req.params.id);
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      reservationRooms: { include: { room: true } },
      folio: {
        include: { items: true, payments: true },
      },
      activityBookings: { include: { schedule: { include: { activity: true } } } },
      creator: { select: { id: true, name: true } },
    },
  });
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
  res.json(reservation);
}

async function createReservation(req, res) {
  const { guestName, guestContact, checkinDate, checkoutDate, roomIds = [], currency = 'USD' } = req.body;
  if (!guestName || !checkinDate || !checkoutDate) {
    return res.status(400).json({ error: 'guestName, checkinDate, and checkoutDate are required.' });
  }

  const checkin = new Date(checkinDate);
  const checkout = new Date(checkoutDate);
  const nights = Math.max(1, Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)));

  const result = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.create({
      data: {
        guestName,
        guestContact: guestContact || '',
        status: 'confirmed',
        checkinDate: checkin,
        checkoutDate: checkout,
        createdBy: req.user.id,
        reservationRooms: roomIds.length
          ? { create: roomIds.map(rid => ({ roomId: Number(rid) })) }
          : undefined,
      },
      include: { reservationRooms: { include: { room: true } } },
    });

    // Calculate room charge total
    let totalAmount = 0;
    const folioItems = [];
    for (const rr of reservation.reservationRooms) {
      const nightly = Number(rr.room.defaultRate);
      const lineTotal = nightly * nights;
      totalAmount += lineTotal;
      folioItems.push({
        description: `${rr.room.type} - Room ${rr.room.number} (${nights} night${nights !== 1 ? 's' : ''})`,
        amount: lineTotal,
        currency,
        type: 'room',
      });
    }

    const folio = await tx.folio.create({
      data: {
        reservationId: reservation.id,
        totalAmount,
        currency,
        status: 'open',
        items: { create: folioItems },
      },
      include: { items: true },
    });

    return { reservation, folio };
  });

  await writeAuditLog(req.user.id, 'create_reservation', 'reservation', result.reservation.id, {
    guestName,
    checkinDate,
    checkoutDate,
    rooms: roomIds,
  });

  res.status(201).json(result);
}

async function checkInReservation(req, res) {
  const id = Number(req.params.id);
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { reservationRooms: true },
  });
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
  if (reservation.status !== 'confirmed') {
    return res.status(400).json({ error: `Cannot check in a reservation with status '${reservation.status}'.` });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'checked_in' },
    include: { reservationRooms: { include: { room: true } }, folio: true },
  });

  // Check-in only affects availability; cleanliness is left as-is.
  await setReservationRoomsStatus(id, { status: 'occupied' });
  await writeAuditLog(req.user.id, 'check_in', 'reservation', id, { guestName: reservation.guestName });

  res.json(updated);
}

async function checkOutReservation(req, res) {
  const id = Number(req.params.id);
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      reservationRooms: true,
      folio: { include: { items: true, payments: true } },
    },
  });
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
  if (reservation.status !== 'checked_in') {
    return res.status(400).json({ error: `Cannot check out a reservation with status '${reservation.status}'.` });
  }

  // On checkout the room becomes free again (available) but needs cleaning (dirty).
  const roomIds = await setReservationRoomsStatus(id, { status: 'available', housekeepingStatus: 'dirty' });

  // Create housekeeping tasks for dirtied rooms
  await prisma.housekeepingTask.createMany({
    data: roomIds.map(roomId => ({ roomId, status: 'dirty', notes: 'Post-checkout cleaning required.' })),
  });

  // Calculate balance to determine folio closure
  let folioStatus = 'open';
  if (reservation.folio) {
    const charged = reservation.folio.items.reduce((s, i) => s + Number(i.amount), 0);
    const paid = reservation.folio.payments.reduce((s, p) => s + Number(p.amount), 0);
    if (paid >= charged) folioStatus = 'paid';
    await prisma.folio.update({ where: { id: reservation.folio.id }, data: { status: folioStatus } });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'checked_out' },
    include: { reservationRooms: { include: { room: true } }, folio: true },
  });

  await writeAuditLog(req.user.id, 'check_out', 'reservation', id, {
    guestName: reservation.guestName,
    folioStatus,
  });

  res.json(updated);
}

module.exports = { listReservations, getReservation, createReservation, checkInReservation, checkOutReservation };
