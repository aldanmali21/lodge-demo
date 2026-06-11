const prisma = require('../config/prisma');

// Rooms have two independent dimensions:
//   status            — availability: 'available' | 'occupied'
//   housekeepingStatus — cleanliness: 'dirty' | 'cleaning' | 'clean'
// Pass an object with either/both fields to update them.
async function setRoomStatus(roomId, data) {
  // Back-compat: a bare string is treated as an availability status.
  const patch = typeof data === 'string' ? { status: data } : data;
  return prisma.room.update({ where: { id: roomId }, data: patch });
}

async function setReservationRoomsStatus(reservationId, data) {
  const links = await prisma.reservationRoom.findMany({ where: { reservationId } });
  await Promise.all(links.map(l => setRoomStatus(l.roomId, data)));
  return links.map(l => l.roomId);
}

module.exports = { setRoomStatus, setReservationRoomsStatus };
