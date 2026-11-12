// Static demo data for Lodge Demo.
// All dates are generated relative to "today" so the demo always looks current.


export function dayAt(offset, hour = 12, minute = 0) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  d.setDate(d.getDate() + offset)
  return d.toISOString()
}

export const DEMO_USER_ID = 1

export function buildSeed() {
  const users = [
    { id: 1, name: 'Aldan Mali', email: 'admin@lodgedemo.example', role: 'admin', createdAt: dayAt(-120) },
    { id: 2, name: 'Rebecca Atuhaire', email: 'frontdesk@lodgedemo.example', role: 'frontdesk', createdAt: dayAt(-100) },
    { id: 3, name: 'Moses Kiiza', email: 'pos@lodgedemo.example', role: 'pos', createdAt: dayAt(-90) },
    { id: 4, name: 'Joel Tumusiime', email: 'guide@lodgedemo.example', role: 'guide', createdAt: dayAt(-90) },
    { id: 5, name: 'Sarah Nabirye', email: 'housekeeping@lodgedemo.example', role: 'housekeeping', createdAt: dayAt(-80) },
    { id: 6, name: 'Demo Viewer', email: 'viewer@lodgedemo.example', role: 'viewer', createdAt: dayAt(-30) },
  ]

  const room = (id, number, type, capacity, defaultRate, status, housekeepingStatus) =>
    ({ id, number, type, capacity, defaultRate, status, housekeepingStatus })
  const rooms = [
    room(1, 'R101', 'Standard Double', 2, 120, 'available', 'cleaning'),
    room(2, 'R102', 'Standard Double', 2, 120, 'available', 'clean'),
    room(3, 'R103', 'Standard Twin', 2, 140, 'available', 'clean'),
    room(4, 'R104', 'Deluxe Double', 2, 180, 'available', 'clean'),
    room(5, 'R105', 'Deluxe Twin', 2, 180, 'occupied', 'clean'),
    room(6, 'R201', 'Family Room', 4, 240, 'available', 'clean'),
    room(7, 'R202', 'Family Room', 4, 240, 'available', 'clean'),
    room(8, 'R203', 'Executive Suite', 2, 320, 'occupied', 'clean'),
    room(9, 'R204', 'Executive Suite', 2, 320, 'available', 'dirty'),
    room(10, 'R205', 'Honeymoon Suite', 2, 380, 'occupied', 'clean'),
  ]

  // [id, guest, contact, status, checkinOffset, checkoutOffset, roomIds]
  const resDefs = [
    [1, 'Eleanor Vance', '+256 700 000001', 'checked_in', -1, 2, [8]],
    [2, 'James Ochieng', '+256 700 000002', 'confirmed', 0, 2, [4]],
    [3, 'Amina & Daniel Kato', '+256 772 123456', 'checked_in', -2, 1, [10]],
    [4, 'The Hartley Family', '+44 7700 900123', 'confirmed', 1, 4, [6, 7]],
    [5, 'Sofia Marchetti', '+39 331 555 0102', 'checked_out', -6, -3, [1]],
    [6, 'Kenji Watanabe', '+81 90 5555 0177', 'checked_in', -1, 0, [5]],
    [7, 'Grace Namukasa', '+256 701 998877', 'pending', 5, 7, [2]],
    [8, 'Peter Mwesigwa', '+256 782 445566', 'confirmed', 3, 5, [3]],
    [9, 'Olivia Brandt', '+49 151 5555 0188', 'checked_out', -10, -7, [9]],
    [10, 'Michael & Priya Shah', '+1 415 555 0134', 'checked_out', -14, -11, [8]],
  ]
  const reservations = resDefs.map(([id, guestName, guestContact, status, ci, co, roomIds]) => ({
    id, guestName, guestContact, status,
    checkinDate: dayAt(ci, 14), checkoutDate: dayAt(co, 10),
    createdBy: 2, createdAt: dayAt(ci - 10),
  }))
  const reservationRooms = []
  resDefs.forEach(([id, , , , , , roomIds]) =>
    roomIds.forEach(roomId => reservationRooms.push({ id: reservationRooms.length + 1, reservationId: id, roomId })))

  // Folios (1:1 with reservations, same id)
  const folios = []
  const folioItems = []
  const payments = []
  let itemId = 1
  let payId = 1
  const addItem = (folioId, description, amount, type, createdAtOffset) =>
    folioItems.push({ id: itemId++, folioId, description, amount, currency: 'USD', type, createdAt: dayAt(createdAtOffset, 18) })
  const addPay = (folioId, amount, method, reference, offset, hour = 11, receivedBy = 2, currency = 'USD') =>
    payments.push({ id: payId++, folioId, amount, currency, method, reference, receivedBy, timestamp: dayAt(offset, hour) })

  resDefs.forEach(([id, , , status, ci, co, roomIds]) => {
    const nights = Math.max(1, co - ci)
    let folioStatus = status === 'checked_out' ? 'paid' : 'open'
    folios.push({ id, reservationId: id, totalAmount: 0, currency: 'USD', status: folioStatus })
    roomIds.forEach(rid => {
      const r = rooms.find(x => x.id === rid)
      addItem(id, `${r.type} - Room ${r.number} (${nights} night${nights !== 1 ? 's' : ''})`, r.defaultRate * nights, 'room', ci)
    })
  })

  // Extra charges
  addItem(1, 'Restaurant: Dinner (Wine, Steaks)', 125.5, 'pos', 0)
  addItem(1, 'Activity: Kazinga Boat Cruise ×2', 170, 'activity', 0)
  addItem(3, 'Restaurant: Honeymoon candlelit dinner', 210, 'pos', -1)
  addItem(3, 'Activity: Game Drive ×2', 240, 'activity', -1)
  addItem(6, 'Restaurant: Lunch & drinks', 64, 'pos', 0)
  addItem(5, 'Activity: Nature Walk ×2', 80, 'activity', -4)
  addItem(9, 'Restaurant: Dinner', 96, 'pos', -9)
  addItem(10, 'Activity: Game Drive ×2', 240, 'activity', -13)
  addItem(10, 'Restaurant: Dinner & drinks', 148, 'pos', -12)

  // Payments (deposits on open folios, full settlement on departed guests)
  const settle = (folioId, offset, method, receivedBy = 2) => {
    const sub = folioItems.filter(i => i.folioId === folioId).reduce((s, i) => s + i.amount, 0)
    addPay(folioId, Math.round(sub * 1.23 * 100) / 100, method, null, offset, 10, receivedBy)
  }
  addPay(1, 400, 'Card', 'Deposit', -1, 15)
  addPay(3, 500, 'Cash', 'Deposit', -2, 15)
  addPay(6, 200, 'MTN MoMo', 'Deposit', -1, 16)
  addPay(2, 150, 'Airtel Money', 'Deposit', 0, 9)
  settle(5, -3, 'Card')
  settle(9, -7, 'Cash')
  settle(10, -11, 'Card')
  // Walk-in / restaurant / activity income (no folio) so finance & reports look alive
  addPay(null, 85, 'Cash', 'Walk-in: Kazinga Boat Cruise — Davies party', 0, 8)
  addPay(null, 120, 'MTN MoMo', 'Walk-in: Game Drive — Okello', 0, 9)
  addPay(null, 54, 'Card', 'Restaurant: table 4', 0, 13, 3)
  addPay(null, 33, 'Cash', 'Restaurant: bar tab', -1, 20, 3)
  addPay(null, 70, 'Airtel Money', 'Walk-in: Nature Walk — school group', -2, 10)
  addPay(null, 245, 'Card', 'Restaurant: group lunch', -4, 14, 3)
  addPay(null, 160, 'Cash', 'Walk-in: Bird Watching — tour group', -5, 7)
  addPay(null, 410, 'Card', 'Day-visitor package', -8, 12)
  addPay(null, 185000, 'Cash', 'Restaurant: lunch (UGX)', 0, 12, 3, 'UGX')

  folios.forEach(f => {
    f.totalAmount = folioItems.filter(i => i.folioId === f.id).reduce((s, i) => s + i.amount, 0)
  })

  const activities = [
    { id: 1, name: 'Kazinga Boat Cruise', description: 'Scheduled lake cruise for lodge guests.', maxCapacity: 10, price: 85 },
    { id: 2, name: 'Game Drive', description: 'Guided safari drive through the park and surrounding reserve.', maxCapacity: 6, price: 120 },
    { id: 3, name: 'Nature Walk', description: 'Short guided walking experience around the lodge grounds.', maxCapacity: 8, price: 40 },
    { id: 4, name: 'Bird Watching', description: 'Early morning birding session with a guide.', maxCapacity: 8, price: 35 },
    { id: 5, name: 'Cultural Visit', description: 'Local community and cultural experience.', maxCapacity: 12, price: 30 },
  ]

  const sch = (id, activityId, offset, h, durH, status, location, capacity = null) => ({
    id, activityId, scheduledAt: dayAt(offset, h), endAt: dayAt(offset, h + durH),
    capacity, status, location,
  })
  const activitySchedules = [
    sch(1, 4, 0, 6, 2, 'completed', 'Lodge Gardens'),
    sch(2, 2, 0, 9, 3, 'in_progress', 'Main Gate — Kasenyi Sector'),
    sch(3, 1, 0, 15, 2, 'not_started', 'Mweya Pier'),
    sch(4, 3, 0, 16, 1, 'not_started', 'Lodge Grounds'),
    sch(5, 2, 1, 6, 3, 'not_started', 'Main Gate — Kasenyi Sector'),
    sch(6, 5, 1, 14, 3, 'not_started', 'Katwe Community Centre'),
    sch(7, 1, 1, 15, 2, 'not_started', 'Mweya Pier'),
    sch(8, 1, -1, 15, 2, 'completed', 'Mweya Pier'),
    sch(9, 2, -2, 6, 3, 'completed', 'Main Gate — Kasenyi Sector'),
    sch(10, 4, 2, 6, 2, 'not_started', 'Lodge Gardens'),
  ]
  const activityBookings = [
    { id: 1, scheduleId: 1, reservationId: 3, guestName: null, paxCount: 2 },
    { id: 2, scheduleId: 2, reservationId: 1, guestName: null, paxCount: 2 },
    { id: 3, scheduleId: 2, reservationId: null, guestName: 'Okello', paxCount: 1 },
    { id: 4, scheduleId: 3, reservationId: 1, guestName: null, paxCount: 2 },
    { id: 5, scheduleId: 3, reservationId: 6, guestName: null, paxCount: 1 },
    { id: 6, scheduleId: 5, reservationId: 4, guestName: null, paxCount: 4 },
    { id: 7, scheduleId: 8, reservationId: 3, guestName: null, paxCount: 2 },
    { id: 8, scheduleId: 9, reservationId: 3, guestName: null, paxCount: 2 },
  ]

  const housekeepingTasks = [
    { id: 1, roomId: 9, status: 'dirty', assignedTo: 5, notes: 'Post-checkout cleaning required.', timestamp: dayAt(0, 8) },
    { id: 2, roomId: 1, status: 'cleaning', assignedTo: 5, notes: 'Deep clean after long stay.', timestamp: dayAt(0, 9) },
    { id: 3, roomId: 8, status: 'clean', assignedTo: 5, notes: 'Turn-down service.', timestamp: dayAt(-1, 17) },
    { id: 4, roomId: 10, status: 'clean', assignedTo: 5, notes: 'Honeymoon set-up.', timestamp: dayAt(-2, 13) },
    { id: 5, roomId: 5, status: 'clean', assignedTo: 5, notes: 'Pre-arrival prep.', timestamp: dayAt(-1, 11) },
    { id: 6, roomId: 4, status: 'clean', assignedTo: 5, notes: 'Pre-arrival prep.', timestamp: dayAt(-3, 11) },
    { id: 7, roomId: 1, status: 'dirty', assignedTo: 5, notes: 'Post-checkout cleaning required.', timestamp: dayAt(-3, 10) },
    { id: 8, roomId: 9, status: 'clean', assignedTo: 5, notes: 'Post-checkout cleaning completed.', timestamp: dayAt(-6, 15) },
  ]

  const auditLogs = []
  const log = (actorId, action, objectType, objectId, details, offset, h) =>
    auditLogs.push({ id: auditLogs.length + 1, actorId, action, objectType, objectId, details, createdAt: new Date(Math.min(new Date(dayAt(offset, h)).getTime(), Date.now() - (24 - h) * 60000)).toISOString() })
  log(2, 'create_reservation', 'reservation', 4, { guestName: 'The Hartley Family' }, -3, 10)
  log(2, 'check_in', 'reservation', 3, { guestName: 'Amina & Daniel Kato' }, -2, 14)
  log(2, 'check_in', 'reservation', 1, { guestName: 'Eleanor Vance' }, -1, 14)
  log(2, 'check_in', 'reservation', 6, { guestName: 'Kenji Watanabe' }, -1, 15)
  log(3, 'pos_charge_to_room', 'folio_item', 5, { folioId: 1, total: 125.5 }, 0, 7)
  log(2, 'book_activity', 'activity_booking', 4, { scheduleId: 3, paxCount: 2 }, 0, 8)
  log(2, 'record_payment', 'payment', 4, { folioId: 2, amount: 150, method: 'Airtel Money' }, 0, 9)
  log(5, 'update_room_status', 'room', 1, { housekeepingStatus: 'cleaning' }, 0, 9)
  log(2, 'create_reservation', 'reservation', 2, { guestName: 'James Ochieng' }, 0, 8)

  const financeEntries = [
    { id: 1, entryType: 'expense', category: 'Supplies', description: 'Linen & toiletries restock', amount: 320, currency: 'USD', entryDate: dayAt(-2, 10), createdBy: 2, createdAt: dayAt(-2, 10) },
    { id: 2, entryType: 'expense', category: 'Fuel', description: 'Safari vehicle diesel', amount: 180, currency: 'USD', entryDate: dayAt(-1, 8), createdBy: 2, createdAt: dayAt(-1, 8) },
    { id: 3, entryType: 'expense', category: 'Utilities', description: 'Generator maintenance', amount: 95, currency: 'USD', entryDate: dayAt(-4, 11), createdBy: 1, createdAt: dayAt(-4, 11) },
    { id: 4, entryType: 'income', category: 'Other', description: 'Conference room hire', amount: 250, currency: 'USD', entryDate: dayAt(-3, 12), createdBy: 1, createdAt: dayAt(-3, 12) },
    { id: 5, entryType: 'expense', category: 'Payroll', description: 'Casual staff wages', amount: 540, currency: 'USD', entryDate: dayAt(-5, 16), createdBy: 1, createdAt: dayAt(-5, 16) },
  ]

  const reconciliations = [
    { id: 1, date: dayAt(-1, 21), closedBy: 2, expectedCash: 33, actualCash: 33, expectedMobile: 0, actualMobile: 0, expectedCard: 400, actualCard: 400, currency: 'USD', notes: 'Balanced.', createdAt: dayAt(-1, 21) },
    { id: 2, date: dayAt(-2, 21), closedBy: 2, expectedCash: 500, actualCash: 495, expectedMobile: 70, actualMobile: 70, expectedCard: 0, actualCard: 0, currency: 'USD', notes: 'Short $5 cash — noted.', createdAt: dayAt(-2, 21) },
  ]

  return {
    users, rooms, reservations, reservationRooms, folios, folioItems, payments,
    activities, activitySchedules, activityBookings, housekeepingTasks, auditLogs,
    financeEntries, reconciliations,
    exchangeRates: [{ base: 'USD', target: 'UGX', rate: 3700 }],
    notificationsSeenAt: null,
    seq: { room: 100, reservation: 100, item: 1000, payment: 1000, activity: 100, schedule: 100, booking: 100, task: 100, log: 1000, entry: 100, rec: 100, user: 100 },
  }
}

export const POS_MENU = {
  Starters: [
    { id: 1, name: 'Artisan Bread Board', price: 18.0, notes: 'Gluten-Free Option' },
    { id: 2, name: 'Gazpacho Andaluz', price: 14.0 },
    { id: 3, name: 'Truffle Arancini', price: 22.0 },
    { id: 4, name: 'Burrata & Heirloom Tomato', price: 24.0 },
    { id: 5, name: 'Charcuterie Platter', price: 38.0, notes: 'Serves 2' },
  ],
  Mains: [
    { id: 6, name: 'Wagyu Beef Burger', price: 36.0 },
    { id: 7, name: 'Grilled Nile Perch', price: 42.0 },
    { id: 8, name: 'Safari Nyama Choma', price: 45.0 },
    { id: 9, name: 'Vegetarian Tagine', price: 28.0 },
  ],
  'Grill & Fire': [
    { id: 10, name: 'T-Bone Steak 400g', price: 65.0 },
    { id: 11, name: 'Mixed Grill Platter', price: 58.0 },
    { id: 12, name: 'Lamb Chops', price: 52.0 },
  ],
  Drinks: [
    { id: 13, name: 'Rift Valley Gin & Tonic', price: 15.0 },
    { id: 14, name: 'Tusker Lager', price: 8.0 },
    { id: 15, name: 'Fresh Passion Juice', price: 6.0 },
    { id: 16, name: 'Masai Mara Sundowner', price: 18.0 },
  ],
  Desserts: [
    { id: 17, name: 'Malva Pudding', price: 12.0 },
    { id: 18, name: 'Chocolate Safari Tart', price: 14.0 },
  ],
}
