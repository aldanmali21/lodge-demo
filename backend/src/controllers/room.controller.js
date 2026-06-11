const prisma = require('../config/prisma');
const { writeAuditLog } = require('../services/audit.service');

async function listRooms(req, res) {
  const { status } = req.query;
  const where = status ? { status } : {};
  const rooms = await prisma.room.findMany({
    where,
    orderBy: { number: 'asc' },
    include: {
      reservationRooms: {
        include: {
          reservation: {
            select: {
              id: true,
              guestName: true,
              status: true,
              checkinDate: true,
              checkoutDate: true,
            },
          },
        },
      },
    },
  });
  res.json(rooms);
}

async function getRoomById(req, res) {
  const id = Number(req.params.id);
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      reservationRooms: {
        include: {
          reservation: {
            select: {
              id: true,
              guestName: true,
              status: true,
              checkinDate: true,
              checkoutDate: true,
            },
          },
        },
      },
    },
  });
  if (!room) return res.status(404).json({ error: 'Room not found.' });
  res.json(room);
}

async function updateRoom(req, res) {
  const id = Number(req.params.id);
  const current = await prisma.room.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ error: 'Room not found.' });

  const { number, type, capacity, defaultRate, status, housekeepingStatus } = req.body;
  const data = {};
  if (number != null) data.number = number;
  if (type != null) data.type = type;
  if (capacity != null && capacity !== '') data.capacity = Number(capacity);
  if (defaultRate != null && defaultRate !== '') data.defaultRate = Number(defaultRate);
  if (status != null) data.status = status;
  if (housekeepingStatus != null) data.housekeepingStatus = housekeepingStatus;

  const room = await prisma.room.update({ where: { id }, data });

  if (housekeepingStatus && housekeepingStatus !== current.housekeepingStatus) {
    await prisma.housekeepingTask.create({
      data: {
        roomId: id,
        status: housekeepingStatus,
        notes: 'Room status updated from Rooms page.',
      },
    });
  }

  await writeAuditLog(req.user.id, 'update_room', 'room', id, data);
  res.json(room);
}

async function deleteRoom(req, res) {
  const id = Number(req.params.id);
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  await prisma.room.delete({ where: { id } });
  await writeAuditLog(req.user.id, 'delete_room', 'room', id, { number: room.number });
  res.status(204).send();
}

async function createRoom(req, res) {
  const { number, type, capacity, defaultRate, status = 'available' } = req.body;
  if (!number || !type || !capacity || defaultRate == null) {
    return res.status(400).json({ error: 'number, type, capacity, and defaultRate are required.' });
  }
  const room = await prisma.room.create({
    data: { number, type, capacity: Number(capacity), defaultRate: Number(defaultRate), status },
  });
  await writeAuditLog(req.user.id, 'create_room', 'room', room.id, { number, type });
  res.status(201).json(room);
}

async function updateRoomStatus(req, res) {
  const id = Number(req.params.id);
  const { status, housekeepingStatus } = req.body;
  const current = await prisma.room.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ error: 'Room not found.' });

  // Two independent dimensions; update whichever is provided.
  const AVAILABILITY = ['available', 'occupied'];
  const CLEANLINESS = ['dirty', 'cleaning', 'clean'];

  const data = {};
  if (status !== undefined) {
    if (!AVAILABILITY.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${AVAILABILITY.join(', ')}` });
    }
    data.status = status;
  }
  if (housekeepingStatus !== undefined) {
    if (!CLEANLINESS.includes(housekeepingStatus)) {
      return res.status(400).json({ error: `housekeepingStatus must be one of: ${CLEANLINESS.join(', ')}` });
    }
    data.housekeepingStatus = housekeepingStatus;
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Provide status and/or housekeepingStatus.' });
  }

  const room = await prisma.room.update({ where: { id }, data });

  if (housekeepingStatus && housekeepingStatus !== current.housekeepingStatus) {
    await prisma.housekeepingTask.create({
      data: {
        roomId: id,
        status: housekeepingStatus,
        notes: 'Housekeeping status updated from Rooms page.',
      },
    });
  }

  await writeAuditLog(req.user.id, 'update_room_status', 'room', id, data);
  res.json(room);
}

// GET /api/rooms/available?from=&to= — rooms with no overlapping active reservation.
// Used by the New Booking modal so already-booked rooms (pending/confirmed/checked_in)
// don't appear for the requested date range, preventing double-booking.
async function getAvailableRooms(req, res) {
  const { from, to } = req.query;

  // Date-range overlap rule: an existing stay conflicts when checkinDate < requestedTo
  // AND checkoutDate > requestedFrom. Without dates, treat "today" as the window.
  const rangeFrom = from ? new Date(from) : new Date();
  const rangeTo = to ? new Date(to) : new Date(rangeFrom.getTime() + 24 * 60 * 60 * 1000);

  const ACTIVE = ['pending', 'confirmed', 'checked_in'];

  const conflicting = await prisma.reservationRoom.findMany({
    where: {
      reservation: {
        status: { in: ACTIVE },
        checkinDate: { lt: rangeTo },
        checkoutDate: { gt: rangeFrom },
      },
    },
    select: { roomId: true },
  });

  const bookedRoomIds = [...new Set(conflicting.map((c) => c.roomId))];

  const rooms = await prisma.room.findMany({
    where: { id: { notIn: bookedRoomIds.length ? bookedRoomIds : [0] } },
    orderBy: { number: 'asc' },
  });

  res.json(rooms);
}

module.exports = { listRooms, getRoomById, createRoom, updateRoom, deleteRoom, updateRoomStatus, getAvailableRooms };
