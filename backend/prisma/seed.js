const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Admin account — only user seeded so the app starts fresh.
  // All other staff must be invited through the Users page.
  await prisma.user.upsert({
    where: { email: 'admin@twinlakes.local' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@twinlakes.local',
      passwordHash: '$2b$10$uDIxP063Oj3Sz0qpomgWJ.lnN1kaVViRLHD1lLsGquv/S2o3CM/nm',
      role: 'admin',
    },
  });

  // Lodge rooms — master data required for the app to function.
  const rooms = [
    { number: 'R101', type: 'Standard Double',   capacity: 2, defaultRate: 120, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R102', type: 'Standard Double',   capacity: 2, defaultRate: 120, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R103', type: 'Standard Twin',     capacity: 2, defaultRate: 140, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R104', type: 'Deluxe Double',     capacity: 2, defaultRate: 180, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R105', type: 'Deluxe Twin',       capacity: 2, defaultRate: 180, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R201', type: 'Family Room',       capacity: 4, defaultRate: 240, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R202', type: 'Family Room',       capacity: 4, defaultRate: 240, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R203', type: 'Executive Suite',   capacity: 2, defaultRate: 320, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R204', type: 'Executive Suite',   capacity: 2, defaultRate: 320, status: 'available', housekeepingStatus: 'clean' },
    { number: 'R205', type: 'Honeymoon Suite',   capacity: 2, defaultRate: 380, status: 'available', housekeepingStatus: 'clean' },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { number: room.number },
      update: {},
      create: room,
    });
  }

  // Core activity types — master data for the lodge's safari offerings.
  const activities = [
    { name: 'Kazinga Boat Cruise', description: 'Scheduled lake cruise for lodge guests.',                      maxCapacity: 10, price: 85  },
    { name: 'Game Drive',          description: 'Guided safari drive through the park and surrounding reserve.', maxCapacity: 6,  price: 120 },
    { name: 'Nature Walk',         description: 'Short guided walking experience around the lodge grounds.',     maxCapacity: 8,  price: 40  },
    { name: 'Bird Watching',       description: 'Early morning birding session with a guide.',                   maxCapacity: 8,  price: 35  },
    { name: 'Cultural Visit',      description: 'Local community and cultural experience.',                      maxCapacity: 12, price: 30  },
  ];

  for (const activity of activities) {
    const existing = await prisma.activity.findFirst({ where: { name: activity.name } });
    if (!existing) {
      await prisma.activity.create({ data: activity });
    }
  }

  console.log('Database seeded: admin user, 10 rooms, 5 activity types.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
