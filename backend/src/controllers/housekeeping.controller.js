const prisma = require('../config/prisma');
const { setRoomStatus } = require('../services/room.service');
const { writeAuditLog } = require('../services/audit.service');

async function listTasks(req, res) {
  const { status, roomStatus, availability, from, to } = req.query;
  const where = {};
  if (status) where.status = status;
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(`${from}T00:00:00`);
    if (to) where.timestamp.lte = new Date(`${to}T23:59:59`);
  }
  const tasks = await prisma.housekeepingTask.findMany({
    where,
    include: {
      room: true,
      assignee: { select: { id: true, name: true } },
    },
    orderBy: [{ timestamp: 'desc' }, { room: { number: 'asc' } }],
  });

  const filtered = tasks.filter(task => {
    if (roomStatus && task.status !== roomStatus) return false;
    if (availability && task.room?.status !== availability) return false;
    return true;
  });

  res.json(filtered);
}

async function updateTaskStatus(req, res) {
  const id = Number(req.params.id);
  const task = await prisma.housekeepingTask.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  const { status } = req.body;
  const allowed = ['dirty', 'cleaning', 'clean'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  const updated = await prisma.housekeepingTask.update({
    where: { id },
    data: { status },
    include: { room: true },
  });

  await setRoomStatus(task.roomId, { housekeepingStatus: status });
  await writeAuditLog(req.user.id, 'update_housekeeping_task', 'housekeeping_task', id, {
    from: task.status,
    to: status,
    roomId: task.roomId,
  });

  res.json(updated);
}

async function completeTask(req, res) {
  const id = Number(req.params.id);
  const task = await prisma.housekeepingTask.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  const nextStatus = { dirty: 'cleaning', cleaning: 'clean' }[task.status];
  if (!nextStatus) {
    return res.status(400).json({ error: `Cannot advance task in status '${task.status}'.` });
  }

  req.body = { status: nextStatus };
  return updateTaskStatus(req, res);
}

async function createTask(req, res) {
  const { roomIds = [], roomId, notes, assignedTo, status = 'dirty', date } = req.body;
  const selectedRoomIds = Array.isArray(roomIds) && roomIds.length ? roomIds : (roomId ? [roomId] : []);
  if (!selectedRoomIds.length) return res.status(400).json({ error: 'roomIds is required.' });
  const allowed = ['dirty', 'cleaning', 'clean'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  const rooms = await prisma.room.findMany({ where: { id: { in: selectedRoomIds.map(Number) } } });
  if (rooms.length !== selectedRoomIds.length) {
    return res.status(404).json({ error: 'One or more rooms were not found.' });
  }

  const timestamp = date ? new Date(`${date}T12:00:00`) : new Date();
  await prisma.$transaction(async (tx) => {
    await tx.housekeepingTask.createMany({
      data: selectedRoomIds.map((rid) => ({
        roomId: Number(rid),
        status,
        notes: notes || null,
        assignedTo: assignedTo ? Number(assignedTo) : null,
        timestamp,
      })),
    });

    await Promise.all(selectedRoomIds.map((rid) => setRoomStatus(Number(rid), { housekeepingStatus: status })));
    return created;
  });

  await writeAuditLog(req.user.id, 'create_task', 'housekeeping_task', 0, { roomIds: selectedRoomIds, notes, status, date: timestamp.toISOString() });
  const createdTasks = await prisma.housekeepingTask.findMany({
    where: {
      roomId: { in: selectedRoomIds.map(Number) },
      status,
      timestamp: {
        gte: new Date(`${date || timestamp.toISOString().slice(0, 10)}T00:00:00`),
        lte: new Date(`${date || timestamp.toISOString().slice(0, 10)}T23:59:59`),
      },
    },
    include: { room: true, assignee: { select: { id: true, name: true } } },
  });
  res.status(201).json(createdTasks);
}

module.exports = { listTasks, createTask, completeTask, updateTaskStatus };
