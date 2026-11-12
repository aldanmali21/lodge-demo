// In-browser mock of the lodge REST API.
// Replaces the Express + Prisma backend so the app runs as a pure static site.
// State lives in memory and is mirrored to sessionStorage (resets in a new tab).
import { buildSeed, POS_MENU, DEMO_USER_ID } from './seed'

const STORAGE_KEY = 'tl_demo_db_v1'
const TAX_TOURISM = 0.05
const TAX_VAT = 0.18

let db = load()

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return buildSeed()
}
function save() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db)) } catch { /* ignore */ }
}
export function resetDemo() {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  db = buildSeed()
}

// ---- helpers ---------------------------------------------------------------
class HttpError extends Error {
  constructor(status, error) { super(error); this.status = status; this.payload = { error } }
}
const bad = (m) => new HttpError(400, m)
const notFound = (m) => new HttpError(404, m)
const nextId = (k) => ++db.seq[k]
const num = Number
const iso = () => new Date().toISOString()
const clone = (x) => JSON.parse(JSON.stringify(x))
const byId = (arr, id) => arr.find(x => x.id === num(id))
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0)
const dayStart = (s) => new Date(`${s}T00:00:00`)
const dayEnd = (s) => new Date(`${s}T23:59:59`)
const dayKey = (d) => new Date(d).toISOString().slice(0, 10)
const me = () => byId(db.users, DEMO_USER_ID)
const brief = (u) => u && { id: u.id, name: u.name }

function audit(action, objectType, objectId, details = {}, actorId = DEMO_USER_ID) {
  db.auditLogs.push({ id: nextId('log'), actorId, action, objectType, objectId, details, createdAt: iso() })
}

// Convert any payment/entry amount to USD for cross-currency totals.
function usd(x) {
  if (x.currency === 'UGX') return x.amount / (db.exchangeRates[0]?.rate || 3700)
  return x.amount
}

function bucket(method = '') {
  const m = method.toLowerCase()
  if (m.includes('cash')) return 'cash'
  if (m.includes('airtel') || m.includes('mtn') || m.includes('momo') || m.includes('mobile')) return 'mobile'
  if (m.includes('card') || m.includes('credit') || m.includes('debit') || m.includes('terminal')) return 'card'
  return 'cash'
}

function roomOf(id) { return byId(db.rooms, id) }
function resRoomsOf(resId) {
  return db.reservationRooms.filter(rr => rr.reservationId === resId)
    .map(rr => ({ ...rr, room: roomOf(rr.roomId) }))
}
function folioOfRes(resId) { return db.folios.find(f => f.reservationId === resId) || null }
function itemsOf(folioId) { return db.folioItems.filter(i => i.folioId === folioId) }
function paymentsOf(folioId) { return db.payments.filter(p => p.folioId === folioId) }
function recalcFolio(folioId) {
  const f = byId(db.folios, folioId)
  if (f) f.totalAmount = sum(itemsOf(folioId), i => i.amount)
}
function guestOfPayment(p) {
  const folio = p.folioId ? byId(db.folios, p.folioId) : null
  const res = folio ? byId(db.reservations, folio.reservationId) : null
  return res ? res.guestName : null
}
function sortBy(arr, key, dir = 1) {
  return [...arr].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir)
}

function reservationFull(r, { withFolioDetail = false } = {}) {
  const folio = folioOfRes(r.id)
  return {
    ...r,
    reservationRooms: resRoomsOf(r.id),
    folio: folio && (withFolioDetail ? { ...folio, items: itemsOf(folio.id), payments: paymentsOf(folio.id) } : folio),
  }
}

function setReservationRooms(resId, patch) {
  const ids = db.reservationRooms.filter(rr => rr.reservationId === resId).map(rr => rr.roomId)
  ids.forEach(id => Object.assign(roomOf(id), patch))
  return ids
}

function scheduleFull(s) {
  const activity = byId(db.activities, s.activityId)
  const bookings = db.activityBookings.filter(b => b.scheduleId === s.id)
  const cap = s.capacity ?? activity.maxCapacity
  const bookedPax = sum(bookings, b => b.paxCount)
  return {
    ...s, activity, effectiveCapacity: cap, price: activity.price,
    bookings: bookings.map(b => {
      const r = b.reservationId ? byId(db.reservations, b.reservationId) : null
      return { ...b, reservation: r ? { id: r.id, guestName: r.guestName } : null, guestLabel: r?.guestName || b.guestName || `Booking #${b.id}` }
    }),
    bookedPax, isFull: bookedPax >= cap,
  }
}

function hkTaskFull(t) {
  const a = t.assignedTo ? byId(db.users, t.assignedTo) : null
  return { ...t, room: roomOf(t.roomId), assignee: a ? brief(a) : null }
}

function range(q, defFrom, defTo) {
  return {
    from: q.from ? dayStart(q.from) : defFrom,
    to: q.to ? dayEnd(q.to) : defTo,
  }
}

function financeRows(from, to) {
  const rows = [
    ...db.financeEntries.filter(e => new Date(e.entryDate) >= from && new Date(e.entryDate) <= to).map(e => ({
      id: `fe-${e.id}`, entryType: e.entryType, category: e.category, description: e.description,
      amount: e.amount, currency: e.currency, entryDate: e.entryDate,
      source: byId(db.users, e.createdBy)?.name || 'Staff', method: 'Manual', origin: 'manual', bucket: e.entryType,
    })),
    ...db.payments.filter(p => new Date(p.timestamp) >= from && new Date(p.timestamp) <= to).map(p => ({
      id: `p-${p.id}`, entryType: 'income', category: p.method || 'Payment',
      description: p.reference || guestOfPayment(p) || 'Guest payment',
      amount: p.amount, currency: p.currency, entryDate: p.timestamp,
      source: p.receivedBy == null ? 'Website (online)' : (byId(db.users, p.receivedBy)?.name || 'Staff'), method: p.method, origin: 'payment', bucket: 'income',
    })),
  ]
  return rows.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
}

const ACTION_LABELS = {
  create_reservation: 'created a reservation', check_in: 'checked in a guest', check_out: 'checked out a guest',
  record_payment: 'recorded a payment', add_folio_item: 'added a folio charge', complete_task: 'completed a housekeeping task',
  book_activity: 'booked an activity', create_activity: 'created an activity', create_room: 'added a room',
  update_room_status: 'updated room status', pos_charge_to_room: 'added a POS charge to room', pos_cash_sale: 'processed a cash sale', online_booking: 'made an online booking',
}

function filteredLogs(q) {
  let logs = [...db.auditLogs]
  if (q.actor) logs = logs.filter(l => l.actorId === num(q.actor))
  if (q.action) logs = logs.filter(l => l.action === q.action)
  if (q.from) logs = logs.filter(l => new Date(l.createdAt) >= new Date(q.from))
  if (q.to) logs = logs.filter(l => new Date(l.createdAt) <= dayEnd(q.to))
  logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return logs
}
const withActor = (l) => {
  if (l.actorId == null) return { ...l, actor: { id: 0, name: l.details?.guestName ? `${l.details.guestName} (website)` : 'Website guest', role: 'guest' } }
  const a = byId(db.users, l.actorId)
  return { ...l, actor: a && { id: a.id, name: a.name, role: a.role } }
}

// ---- route table -----------------------------------------------------------
// Each handler: ({ params, query, body }) => data | { status, data }
const routes = []
const route = (method, pattern, handler) => {
  const keys = []
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)' }) + '/?$')
  routes.push({ method, re, keys, handler })
}

// Health / auth (no login in the demo, but keep endpoints harmless)
route('GET', '/health', () => ({ ok: true, demo: true }))
route('POST', '/auth/login', () => ({ token: 'demo', user: me() }))
route('POST', '/auth/refresh', () => ({ token: 'demo' }))

// Users
route('GET', '/users/me', () => me())
route('PUT', '/users/me', ({ body }) => {
  if (!body.name && !body.email) throw bad('Provide name or email to update.')
  Object.assign(me(), body.name ? { name: body.name } : {}, body.email ? { email: body.email } : {})
  return me()
})
route('PUT', '/users/me/password', ({ body }) => {
  if (!body.currentPassword || !body.newPassword) throw bad('currentPassword and newPassword are required.')
  if (body.newPassword.length < 8) throw bad('New password must be at least 8 characters.')
  return { message: 'Password updated successfully (demo mode — nothing is stored).' }
})
route('GET', '/users/audit-log', ({ query }) => {
  const logs = filteredLogs(query)
  const limit = num(query.limit ?? 100); const offset = num(query.offset ?? 0)
  return { logs: logs.slice(offset, offset + limit).map(withActor), total: logs.length, limit, offset }
})
route('GET', '/users', ({ query }) => sortBy(db.users.filter(u => !query.role || u.role === query.role), 'createdAt'))
route('PUT', '/users/:id/role', ({ params, body }) => {
  const valid = ['admin', 'frontdesk', 'pos', 'guide', 'housekeeping', 'viewer']
  if (!valid.includes(body.role)) throw bad(`Role must be one of: ${valid.join(', ')}`)
  if (num(params.id) === DEMO_USER_ID) throw bad('You cannot change your own role.')
  const u = byId(db.users, params.id); if (!u) throw notFound('User not found.')
  u.role = body.role
  audit('update_user_role', 'user', u.id, { newRole: body.role })
  return u
})
route('POST', '/users/invite', ({ body }) => {
  if (!body.email || !body.role) throw bad('email and role are required.')
  if (db.users.some(u => u.email === body.email)) throw new HttpError(409, 'A user with this email already exists.')
  audit('invite_user', 'user_invite', 0, { email: body.email, role: body.role, channel: body.channel })
  return { status: 201, data: { message: `Invite recorded for ${body.email} (demo mode — no email is sent)`, inviteUrl: null, emailError: null, smsStub: false } }
})

// Notifications
route('GET', '/notifications/count', () => {
  const since = db.notificationsSeenAt ? new Date(db.notificationsSeenAt) : new Date(Date.now() - 86400000)
  return { count: db.auditLogs.filter(l => new Date(l.createdAt) > since).length }
})
route('POST', '/notifications/seen', () => { db.notificationsSeenAt = iso(); return { ok: true } })
route('GET', '/notifications', ({ query }) => {
  const limit = num(query.limit ?? 20); const offset = num(query.offset ?? 0)
  return filteredLogs(query).slice(offset, offset + limit).map(l => ({ ...withActor(l), actionLabel: ACTION_LABELS[l.action] || l.action }))
})

// Rooms
const roomWithRes = (r) => ({
  ...r,
  reservationRooms: db.reservationRooms.filter(rr => rr.roomId === r.id).map(rr => {
    const x = byId(db.reservations, rr.reservationId)
    return { ...rr, reservation: { id: x.id, guestName: x.guestName, status: x.status, checkinDate: x.checkinDate, checkoutDate: x.checkoutDate } }
  }),
})
route('GET', '/rooms/available', ({ query }) => {
  const from = query.from ? new Date(query.from) : new Date()
  const to = query.to ? new Date(query.to) : new Date(from.getTime() + 86400000)
  const booked = new Set()
  db.reservationRooms.forEach(rr => {
    const r = byId(db.reservations, rr.reservationId)
    if (['pending', 'confirmed', 'checked_in'].includes(r.status) && new Date(r.checkinDate) < to && new Date(r.checkoutDate) > from) booked.add(rr.roomId)
  })
  return sortBy(db.rooms.filter(r => !booked.has(r.id)), 'number')
})
route('GET', '/rooms', ({ query }) => sortBy(db.rooms.filter(r => !query.status || r.status === query.status), 'number').map(roomWithRes))
route('GET', '/rooms/:id', ({ params }) => { const r = roomOf(params.id); if (!r) throw notFound('Room not found.'); return roomWithRes(r) })
route('POST', '/rooms', ({ body }) => {
  const { number, type, capacity, defaultRate, status = 'available' } = body
  if (!number || !type || !capacity || defaultRate == null) throw bad('number, type, capacity, and defaultRate are required.')
  if (db.rooms.some(r => r.number === number)) throw new HttpError(409, 'A room with that number already exists.')
  const room = { id: nextId('room'), number, type, capacity: num(capacity), defaultRate: num(defaultRate), status, housekeepingStatus: 'clean' }
  db.rooms.push(room)
  audit('create_room', 'room', room.id, { number, type })
  return { status: 201, data: room }
})
function logHk(roomId, status, notes) {
  db.housekeepingTasks.push({ id: nextId('task'), roomId, status, assignedTo: null, notes, timestamp: iso() })
}
route('PATCH', '/rooms/:id/status', ({ params, body }) => {
  const room = roomOf(params.id); if (!room) throw notFound('Room not found.')
  const { status, housekeepingStatus } = body
  const patch = {}
  if (status !== undefined) {
    if (!['available', 'occupied'].includes(status)) throw bad('status must be one of: available, occupied')
    patch.status = status
  }
  if (housekeepingStatus !== undefined) {
    if (!['dirty', 'cleaning', 'clean'].includes(housekeepingStatus)) throw bad('housekeepingStatus must be one of: dirty, cleaning, clean')
    patch.housekeepingStatus = housekeepingStatus
  }
  if (!Object.keys(patch).length) throw bad('Provide status and/or housekeepingStatus.')
  if (housekeepingStatus && housekeepingStatus !== room.housekeepingStatus) logHk(room.id, housekeepingStatus, 'Housekeeping status updated from Rooms page.')
  Object.assign(room, patch)
  audit('update_room_status', 'room', room.id, patch)
  return room
})
route('PATCH', '/rooms/:id', ({ params, body }) => {
  const room = roomOf(params.id); if (!room) throw notFound('Room not found.')
  const patch = {}
  if (body.number != null) patch.number = body.number
  if (body.type != null) patch.type = body.type
  if (body.capacity != null && body.capacity !== '') patch.capacity = num(body.capacity)
  if (body.defaultRate != null && body.defaultRate !== '') patch.defaultRate = num(body.defaultRate)
  if (body.status != null) patch.status = body.status
  if (body.housekeepingStatus != null) patch.housekeepingStatus = body.housekeepingStatus
  if (patch.housekeepingStatus && patch.housekeepingStatus !== room.housekeepingStatus) logHk(room.id, patch.housekeepingStatus, 'Room status updated from Rooms page.')
  Object.assign(room, patch)
  audit('update_room', 'room', room.id, patch)
  return room
})
route('DELETE', '/rooms/:id', ({ params }) => {
  const room = roomOf(params.id); if (!room) throw notFound('Room not found.')
  if (db.reservationRooms.some(rr => rr.roomId === room.id)) throw bad('Cannot delete a room that has reservations.')
  db.rooms = db.rooms.filter(r => r.id !== room.id)
  audit('delete_room', 'room', room.id, { number: room.number })
  return { status: 204, data: null }
})

// Public guest website (the /site pages) — online booking with payment up front.
route('POST', '/public/bookings', ({ body }) => {
  const { guestName, guestEmail = '', guestPhone = '', checkinDate, checkoutDate, roomType, guests = 1, paymentMethod = 'MTN Mobile Money', currency = 'USD' } = body
  if (!guestName || !checkinDate || !checkoutDate || !roomType) throw bad('guestName, roomType, checkinDate and checkoutDate are required.')
  const checkin = new Date(checkinDate); const checkout = new Date(checkoutDate)
  if (!(checkout > checkin)) throw bad('Check-out must be after check-in.')
  const booked = new Set()
  db.reservationRooms.forEach(rr => {
    const r = byId(db.reservations, rr.reservationId)
    if (['pending', 'confirmed', 'checked_in'].includes(r.status) && new Date(r.checkinDate) < checkout && new Date(r.checkoutDate) > checkin) booked.add(rr.roomId)
  })
  const room = sortBy(db.rooms.filter(r => r.type === roomType && !booked.has(r.id)), 'number')[0]
  if (!room) throw new HttpError(409, 'Sorry, that room type was just booked for those dates.')
  const nights = Math.max(1, Math.ceil((checkout - checkin) / 86400000))
  const reservation = {
    id: nextId('reservation'), guestName, guestContact: [guestPhone, guestEmail].filter(Boolean).join(' · '), status: 'confirmed', source: 'website',
    guests: num(guests), checkinDate: checkin.toISOString(), checkoutDate: checkout.toISOString(), createdBy: null, createdAt: iso(),
  }
  db.reservations.push(reservation)
  const folio = { id: reservation.id, reservationId: reservation.id, totalAmount: 0, currency: 'USD', status: 'open' }
  db.folios.push(folio)
  db.reservationRooms.push({ id: db.reservationRooms.length + 1000 + reservation.id, reservationId: reservation.id, roomId: room.id })
  db.folioItems.push({ id: nextId('item'), folioId: folio.id, amount: room.defaultRate * nights, currency: 'USD', type: 'room', createdAt: iso(),
    description: `${room.type} - Room ${room.number} (${nights} night${nights !== 1 ? 's' : ''})` })
  recalcFolio(folio.id)
  const subtotal = folio.totalAmount
  const grand = Math.round(subtotal * (1 + TAX_TOURISM + TAX_VAT) * 100) / 100
  const reference = `WEB-${String(reservation.id).padStart(5, '0')}`
  db.payments.push({ id: nextId('payment'), folioId: folio.id, amount: grand, currency: 'USD', method: paymentMethod, reference: `Website booking ${reference}`, receivedBy: null, timestamp: iso() })
  folio.status = 'paid'
  audit('online_booking', 'reservation', reservation.id, { guestName, room: room.number, nights, paid: grand, method: paymentMethod }, null)
  return { status: 201, data: { reference, reservationId: reservation.id, room: { number: room.number, type: room.type }, nights, subtotal, taxes: grand - subtotal, total: grand, paymentMethod } }
})

// Reservations
route('GET', '/reservations', ({ query }) => {
  let list = db.reservations
  if (query.status) list = list.filter(r => r.status === query.status)
  if (query.from || query.to) {
    const from = query.from ? dayStart(query.from) : new Date('1970-01-01')
    const to = query.to ? dayEnd(query.to) : new Date('2999-12-31')
    list = list.filter(r => new Date(r.checkinDate) <= to && new Date(r.checkoutDate) >= from)
  }
  return sortBy(list, 'checkinDate').map(r => reservationFull(r))
})
route('GET', '/reservations/:id', ({ params }) => {
  const r = byId(db.reservations, params.id); if (!r) throw notFound('Reservation not found.')
  return {
    ...reservationFull(r, { withFolioDetail: true }),
    activityBookings: db.activityBookings.filter(b => b.reservationId === r.id).map(b => {
      const s = byId(db.activitySchedules, b.scheduleId)
      return { ...b, schedule: { ...s, activity: byId(db.activities, s.activityId) } }
    }),
    creator: brief(byId(db.users, r.createdBy)),
  }
})
route('POST', '/reservations', ({ body }) => {
  const { guestName, guestContact, checkinDate, checkoutDate, roomIds = [], currency = 'USD' } = body
  if (!guestName || !checkinDate || !checkoutDate) throw bad('guestName, checkinDate, and checkoutDate are required.')
  const checkin = new Date(checkinDate); const checkout = new Date(checkoutDate)
  const nights = Math.max(1, Math.ceil((checkout - checkin) / 86400000))
  const reservation = {
    id: nextId('reservation'), guestName, guestContact: guestContact || '', status: 'confirmed',
    checkinDate: checkin.toISOString(), checkoutDate: checkout.toISOString(), createdBy: DEMO_USER_ID, createdAt: iso(),
  }
  db.reservations.push(reservation)
  const folio = { id: reservation.id, reservationId: reservation.id, totalAmount: 0, currency, status: 'open' }
  db.folios.push(folio)
  roomIds.forEach(rid => {
    const room = roomOf(rid); if (!room) return
    db.reservationRooms.push({ id: db.reservationRooms.length + 1000 + reservation.id, reservationId: reservation.id, roomId: room.id })
    db.folioItems.push({
      id: nextId('item'), folioId: folio.id, amount: room.defaultRate * nights, currency, type: 'room', createdAt: iso(),
      description: `${room.type} - Room ${room.number} (${nights} night${nights !== 1 ? 's' : ''})`,
    })
  })
  recalcFolio(folio.id)
  audit('create_reservation', 'reservation', reservation.id, { guestName, checkinDate, checkoutDate, rooms: roomIds })
  return { status: 201, data: { reservation: { ...reservation, reservationRooms: resRoomsOf(reservation.id) }, folio: { ...folio, items: itemsOf(folio.id) } } }
})
route('POST', '/reservations/:id/checkin', ({ params }) => {
  const r = byId(db.reservations, params.id); if (!r) throw notFound('Reservation not found.')
  if (r.status !== 'confirmed') throw bad(`Cannot check in a reservation with status '${r.status}'.`)
  r.status = 'checked_in'
  setReservationRooms(r.id, { status: 'occupied' })
  audit('check_in', 'reservation', r.id, { guestName: r.guestName })
  return reservationFull(r)
})
route('POST', '/reservations/:id/checkout', ({ params }) => {
  const r = byId(db.reservations, params.id); if (!r) throw notFound('Reservation not found.')
  if (r.status !== 'checked_in') throw bad(`Cannot check out a reservation with status '${r.status}'.`)
  const roomIds = setReservationRooms(r.id, { status: 'available', housekeepingStatus: 'dirty' })
  roomIds.forEach(id => logHk(id, 'dirty', 'Post-checkout cleaning required.'))
  let folioStatus = 'open'
  const folio = folioOfRes(r.id)
  if (folio) {
    const charged = sum(itemsOf(folio.id), i => i.amount)
    const paid = sum(paymentsOf(folio.id), p => p.amount)
    if (paid >= charged) folioStatus = 'paid'
    folio.status = folioStatus
  }
  r.status = 'checked_out'
  audit('check_out', 'reservation', r.id, { guestName: r.guestName, folioStatus })
  return reservationFull(r)
})

// Folios
function folioFull(f) {
  const res = byId(db.reservations, f.reservationId)
  return {
    ...f, reservation: { ...res, reservationRooms: resRoomsOf(res.id) },
    items: sortBy(itemsOf(f.id), 'createdAt'), payments: paymentsOf(f.id),
  }
}
route('GET', '/folios', ({ query }) => {
  let list = db.folios
  if (query.status) list = list.filter(f => f.status === query.status)
  if (query.date) {
    list = list.filter(f => {
      const r = byId(db.reservations, f.reservationId)
      return new Date(r.checkinDate) <= dayEnd(query.date) && new Date(r.checkoutDate) >= dayStart(query.date)
    })
  }
  return sortBy(list, 'id', -1).map(f => {
    const full = folioFull(f)
    return { ...full, payments: sortBy(full.payments, 'timestamp', -1) }
  })
})
route('GET', '/folios/:id', ({ params }) => {
  const f = byId(db.folios, params.id); if (!f) throw notFound('Folio not found.')
  const full = folioFull(f)
  full.payments = sortBy(full.payments, 'timestamp').map(p => ({ ...p, receiver: brief(byId(db.users, p.receivedBy)) || (p.receivedBy == null ? { id: 0, name: 'Website (online)' } : undefined) }))
  const subtotal = sum(full.items, i => i.amount)
  const tourismTax = subtotal * TAX_TOURISM
  const vat = subtotal * TAX_VAT
  const grandTotal = subtotal + tourismTax + vat
  const totalPaid = sum(full.payments, p => p.amount)
  const rate = db.exchangeRates.find(r => r.base === f.currency && r.target === 'UGX')?.rate ?? null
  return { ...full, subtotal, tourismTax, vat, grandTotal, totalPaid, balance: grandTotal - totalPaid, ugxEquivalent: rate ? grandTotal * rate : null, ugxRate: rate }
})
route('POST', '/folios/:id/items', ({ params, body }) => {
  const f = byId(db.folios, params.id); if (!f) throw notFound('Folio not found.')
  if (!body.description || body.amount == null) throw bad('description and amount are required.')
  if (f.status === 'closed') throw bad('Cannot add items to a closed folio.')
  const item = { id: nextId('item'), folioId: f.id, description: body.description, amount: num(body.amount), currency: body.currency || f.currency, type: body.type || 'other', createdAt: iso() }
  db.folioItems.push(item); recalcFolio(f.id)
  audit('add_folio_item', 'folio_item', item.id, { folioId: f.id, description: item.description, amount: item.amount, type: item.type })
  return { status: 201, data: item }
})
route('POST', '/folios/:id/payments', ({ params, body }) => {
  const f = byId(db.folios, params.id); if (!f) throw notFound('Folio not found.')
  if (!body.amount || !body.method) throw bad('amount and method are required.')
  const payment = { id: nextId('payment'), folioId: f.id, amount: num(body.amount), currency: body.currency || f.currency, method: body.method, reference: body.reference || null, receivedBy: DEMO_USER_ID, timestamp: iso() }
  db.payments.push(payment)
  const grand = sum(itemsOf(f.id), i => i.amount) * (1 + TAX_TOURISM + TAX_VAT)
  if (sum(paymentsOf(f.id), p => p.amount) >= grand) f.status = 'paid'
  audit('record_payment', 'payment', payment.id, { folioId: f.id, amount: payment.amount, currency: payment.currency, method: payment.method })
  return { status: 201, data: { payment, folioStatus: f.status } }
})
route('PATCH', '/folios/:id/status', ({ params, body }) => {
  const f = byId(db.folios, params.id); if (!f) throw notFound('Folio not found.')
  if (!['open', 'paid', 'closed'].includes(body.status)) throw bad('status must be one of: open, paid, closed')
  const from = f.status; f.status = body.status
  audit('update_folio_status', 'folio', f.id, { from, to: body.status })
  return f
})

// Housekeeping
route('GET', '/housekeeping/tasks', ({ query }) => {
  let list = db.housekeepingTasks
  if (query.status) list = list.filter(t => t.status === query.status)
  if (query.from) list = list.filter(t => new Date(t.timestamp) >= dayStart(query.from))
  if (query.to) list = list.filter(t => new Date(t.timestamp) <= dayEnd(query.to))
  if (query.roomStatus) list = list.filter(t => t.status === query.roomStatus)
  if (query.availability) list = list.filter(t => roomOf(t.roomId)?.status === query.availability)
  return sortBy(list, 'timestamp', -1).map(hkTaskFull)
})
function setTaskStatus(t, status) {
  if (!['dirty', 'cleaning', 'clean'].includes(status)) throw bad('status must be one of: dirty, cleaning, clean')
  const from = t.status; t.status = status
  const room = roomOf(t.roomId); if (room) room.housekeepingStatus = status
  audit('update_housekeeping_task', 'housekeeping_task', t.id, { from, to: status, roomId: t.roomId })
  return hkTaskFull(t)
}
route('PATCH', '/housekeeping/tasks/:id', ({ params, body }) => {
  const t = byId(db.housekeepingTasks, params.id); if (!t) throw notFound('Task not found.')
  return setTaskStatus(t, body.status)
})
route('POST', '/housekeeping/tasks/:id/complete', ({ params }) => {
  const t = byId(db.housekeepingTasks, params.id); if (!t) throw notFound('Task not found.')
  const next = { dirty: 'cleaning', cleaning: 'clean' }[t.status]
  if (!next) throw bad(`Cannot advance task in status '${t.status}'.`)
  return setTaskStatus(t, next)
})
route('POST', '/housekeeping/tasks', ({ body }) => {
  const ids = Array.isArray(body.roomIds) && body.roomIds.length ? body.roomIds : (body.roomId ? [body.roomId] : [])
  if (!ids.length) throw bad('roomIds is required.')
  const status = body.status || 'dirty'
  if (!['dirty', 'cleaning', 'clean'].includes(status)) throw bad('status must be one of: dirty, cleaning, clean')
  const created = ids.map(rid => {
    const room = roomOf(rid); if (!room) throw notFound('One or more rooms were not found.')
    room.housekeepingStatus = status
    const t = { id: nextId('task'), roomId: room.id, status, assignedTo: body.assignedTo ? num(body.assignedTo) : null, notes: body.notes || null, timestamp: body.date ? new Date(`${body.date}T12:00:00`).toISOString() : iso() }
    db.housekeepingTasks.push(t); return hkTaskFull(t)
  })
  audit('create_task', 'housekeeping_task', 0, { roomIds: ids, status })
  return { status: 201, data: created }
})

// Activities
route('GET', '/activities/schedules', ({ query }) => {
  let list = db.activitySchedules
  if (query.date) list = list.filter(s => new Date(s.scheduledAt) >= dayStart(query.date) && new Date(s.scheduledAt) <= dayEnd(query.date))
  else {
    if (query.from) list = list.filter(s => new Date(s.scheduledAt) >= dayStart(query.from))
    if (query.to) list = list.filter(s => new Date(s.scheduledAt) <= dayEnd(query.to))
  }
  if (query.status) list = list.filter(s => s.status === query.status)
  return sortBy(list, 'scheduledAt').map(scheduleFull)
})
route('POST', '/activities/schedules', ({ body }) => {
  if (!body.activityId || !body.scheduledAt) throw bad('activityId and scheduledAt are required.')
  const activity = byId(db.activities, body.activityId); if (!activity) throw notFound('Activity not found.')
  const s = {
    id: nextId('schedule'), activityId: activity.id, scheduledAt: new Date(body.scheduledAt).toISOString(),
    endAt: body.endAt ? new Date(body.endAt).toISOString() : null,
    capacity: body.capacity != null && body.capacity !== '' ? num(body.capacity) : null,
    status: 'not_started', location: body.location || '',
  }
  db.activitySchedules.push(s)
  audit('create_schedule', 'activity_schedule', s.id, body)
  return { status: 201, data: { ...s, activity } }
})
route('PATCH', '/activities/schedules/:id/status', ({ params, body }) => {
  if (!['not_started', 'in_progress', 'completed'].includes(body.status)) throw bad('status must be one of: not_started, in_progress, completed')
  const s = byId(db.activitySchedules, params.id); if (!s) throw notFound('Schedule not found.')
  s.status = body.status
  audit('update_schedule_status', 'activity_schedule', s.id, { status: body.status })
  return s
})
route('PATCH', '/activities/schedules/:id', ({ params, body }) => {
  const s = byId(db.activitySchedules, params.id); if (!s) throw notFound('Schedule not found.')
  if (body.activityId != null) s.activityId = num(body.activityId)
  if (body.scheduledAt) s.scheduledAt = new Date(body.scheduledAt).toISOString()
  if (body.endAt !== undefined) s.endAt = body.endAt ? new Date(body.endAt).toISOString() : null
  if (body.capacity !== undefined) s.capacity = body.capacity === '' || body.capacity == null ? null : num(body.capacity)
  if (body.location != null) s.location = body.location
  if (body.status) s.status = body.status
  audit('update_schedule', 'activity_schedule', s.id, body)
  return { ...s, activity: byId(db.activities, s.activityId) }
})
route('GET', '/activities', ({ query }) => sortBy(db.activities, 'name').map(a => ({
  ...a,
  schedules: sortBy(db.activitySchedules.filter(s => s.activityId === a.id && (!query.date || (new Date(s.scheduledAt) >= dayStart(query.date) && new Date(s.scheduledAt) <= dayEnd(query.date)))), 'scheduledAt').map(s => {
    const bookings = db.activityBookings.filter(b => b.scheduleId === s.id)
    const bookedPax = sum(bookings, b => b.paxCount)
    return { ...s, bookings, bookedPax, bookingCount: bookings.length, isFull: bookedPax >= a.maxCapacity }
  }),
})))
route('POST', '/activities', ({ body }) => {
  if (!body.name || !body.maxCapacity) throw bad('name and maxCapacity are required.')
  const a = { id: nextId('activity'), name: body.name, description: body.description || '', maxCapacity: num(body.maxCapacity), price: num(body.price || 0) }
  db.activities.push(a)
  audit('create_activity', 'activity', a.id, { name: a.name })
  return { status: 201, data: { ...a, schedules: [] } }
})
route('PATCH', '/activities/:id', ({ params, body }) => {
  const a = byId(db.activities, params.id); if (!a) throw notFound('Activity not found.')
  if (body.name != null) a.name = body.name
  if (body.description != null) a.description = body.description
  if (body.maxCapacity != null && body.maxCapacity !== '') a.maxCapacity = num(body.maxCapacity)
  if (body.price != null && body.price !== '') a.price = num(body.price)
  return a
})
route('POST', '/activities/:id/book', ({ params, body }) => {
  const s = byId(db.activitySchedules, params.id); if (!s) throw notFound('Schedule not found.')
  const activity = byId(db.activities, s.activityId)
  const pax = num(body.paxCount ?? 1)
  const walkIn = !body.reservationId
  if (walkIn && !body.guestName) throw bad('reservationId or guestName is required.')
  const cap = s.capacity ?? activity.maxCapacity
  if (sum(db.activityBookings.filter(b => b.scheduleId === s.id), b => b.paxCount) + pax > cap) throw new HttpError(409, 'Activity is fully booked (overbooking prevented).')
  const charge = num(activity.price || 0) * pax
  const booking = { id: nextId('booking'), scheduleId: s.id, reservationId: walkIn ? null : num(body.reservationId), guestName: walkIn ? body.guestName : null, paxCount: pax }
  db.activityBookings.push(booking)
  const billing = { charge, mode: null }
  if (charge > 0 && walkIn) {
    const p = body.payment || {}
    db.payments.push({ id: nextId('payment'), folioId: null, amount: charge, currency: p.currency || 'USD', method: p.method || 'Cash', reference: `Walk-in: ${activity.name} — ${body.guestName}`, receivedBy: DEMO_USER_ID, timestamp: iso() })
    billing.mode = 'payment'
  } else if (charge > 0) {
    const folio = folioOfRes(booking.reservationId)
    if (folio) {
      db.folioItems.push({ id: nextId('item'), folioId: folio.id, description: `Activity: ${activity.name} ×${pax}`, amount: charge, currency: folio.currency, type: 'activity', createdAt: iso() })
      recalcFolio(folio.id); billing.mode = 'folio'; billing.folioId = folio.id
    }
  }
  audit('book_activity', 'activity_booking', booking.id, { scheduleId: s.id, paxCount: pax, charge, billing: billing.mode })
  return { status: 201, data: { booking: { ...booking, schedule: { ...s, activity } }, billing } }
})

// Dashboard
route('GET', '/dashboard/summary', () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 86400000 - 1)
  const inDay = (d) => new Date(d) >= start && new Date(d) <= end
  const arrivals = db.reservations.filter(r => inDay(r.checkinDate) && ['confirmed', 'checked_in'].includes(r.status)).map(r => reservationFull(r))
  const departures = db.reservations.filter(r => inDay(r.checkoutDate) && r.status === 'checked_in').map(r => reservationFull(r))
  const occupied = db.rooms.filter(r => r.status === 'occupied').length
  const todays = db.payments.filter(p => inDay(p.timestamp))
  return {
    date: now.toISOString(),
    arrivals: { count: arrivals.length, list: arrivals },
    departures: { count: departures.length, list: departures },
    occupancy: { percent: db.rooms.length ? Math.round((occupied / db.rooms.length) * 100) : 0, occupied, total: db.rooms.length },
    collections: { usd: sum(todays.filter(p => p.currency === 'USD'), p => p.amount), ugx: sum(todays.filter(p => p.currency === 'UGX'), p => p.amount) },
  }
})

// POS
route('GET', '/pos/menu', () => POS_MENU)
route('POST', '/pos/orders', ({ body }) => {
  const { items = [], folioId, currency = 'USD' } = body
  if (!items.length) throw bad('At least one item is required.')
  const total = sum(items, i => num(i.price) * num(i.qty || 1))
  if (folioId) {
    const f = byId(db.folios, folioId); if (!f) throw notFound('Folio not found.')
    const item = { id: nextId('item'), folioId: f.id, description: items.map(i => `${i.qty || 1}x ${i.name}`).join(', '), amount: total, currency, type: 'pos', createdAt: iso() }
    db.folioItems.push(item); recalcFolio(f.id)
    audit('pos_charge_to_room', 'folio_item', item.id, { folioId: f.id, total, items })
    return { status: 201, data: { folioItem: item, message: 'Charged to room folio.' } }
  }
  db.payments.push({ id: nextId('payment'), folioId: null, amount: total, currency, method: 'Cash', reference: `Restaurant: ${items.map(i => `${i.qty || 1}x ${i.name}`).join(', ')}`, receivedBy: DEMO_USER_ID, timestamp: iso() })
  audit('pos_cash_sale', 'order', 0, { items, total, currency })
  return { status: 201, data: { message: 'Cash sale recorded.', total, items } }
})

// Finance
route('GET', '/finance/entries', ({ query }) => {
  const now = new Date()
  const { from, to } = range(query, new Date(now.getFullYear(), now.getMonth(), 1), now)
  const rows = financeRows(from, to).filter(r =>
    (!query.type || query.type === 'all' || r.entryType === query.type) &&
    (!query.category || query.category === 'all' || r.category === query.category))
  return { rows, from: from.toISOString(), to: to.toISOString() }
})
route('GET', '/finance/summary', ({ query }) => {
  const now = new Date()
  const { from, to } = range(query, new Date(now.getFullYear(), now.getMonth(), 1), now)
  const rows = financeRows(from, to)
  let income = 0; let expenses = 0
  const byCategory = {}; const byDay = {}
  rows.forEach(r => {
    const a = usd(r)
    if (r.entryType === 'expense') expenses += a; else income += a
    byCategory[r.category] = (byCategory[r.category] || 0) + a
    const d = dayKey(r.entryDate); byDay[d] ||= { income: 0, expense: 0 }
    if (r.entryType === 'expense') byDay[d].expense += a; else byDay[d].income += a
  })
  return {
    range: { from: from.toISOString(), to: to.toISOString() }, income, expenses, profit: income - expenses,
    byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
    byDay: Object.entries(byDay).sort().map(([day, t]) => ({ day, ...t })),
  }
})
route('POST', '/finance/entries', ({ body }) => {
  if (!['income', 'expense'].includes(body.entryType)) throw bad('entryType must be income or expense.')
  if (!body.category || !body.description || body.amount == null || !body.entryDate) throw bad('entryType, category, description, amount, and entryDate are required.')
  const e = { id: nextId('entry'), entryType: body.entryType, category: body.category, description: body.description, amount: num(body.amount), currency: body.currency || 'USD', entryDate: new Date(body.entryDate).toISOString(), createdBy: DEMO_USER_ID, createdAt: iso() }
  db.financeEntries.push(e)
  audit('create_finance_entry', 'finance_entry', e.id, { entryType: e.entryType, category: e.category, amount: e.amount })
  return { status: 201, data: { ...e, creator: brief(me()) } }
})
function todaysPayments(date) {
  const base = date ? new Date(date) : new Date()
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  const end = new Date(start.getTime() + 86400000 - 1)
  return { start, end, list: db.payments.filter(p => new Date(p.timestamp) >= start && new Date(p.timestamp) <= end).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) }
}
route('GET', '/finance/reconciliation/today', ({ query }) => {
  const { start, end, list } = todaysPayments(query.date)
  const expected = { cash: 0, mobile: 0, card: 0 }
  list.forEach(p => { expected[bucket(p.method)] += p.amount })
  const existing = db.reconciliations.filter(r => new Date(r.date) >= start && new Date(r.date) <= end).pop()
  return {
    date: start.toISOString(), expected,
    payments: list.map(p => ({ id: p.id, timestamp: p.timestamp, amount: p.amount, currency: p.currency, method: p.method, reference: p.reference, bucket: bucket(p.method), source: guestOfPayment(p) || p.reference || 'Walk-in / Other', staff: p.receivedBy == null ? 'Website (online)' : (byId(db.users, p.receivedBy)?.name || 'Staff') })),
    transactionCount: list.length,
    existing: existing ? { ...existing, closer: brief(byId(db.users, existing.closedBy)) } : null,
  }
})
route('POST', '/finance/reconciliation', ({ body }) => {
  const { list } = todaysPayments()
  const expected = { cash: 0, mobile: 0, card: 0 }
  list.forEach(p => { expected[bucket(p.method)] += p.amount })
  const rec = {
    id: nextId('rec'), date: iso(), closedBy: DEMO_USER_ID,
    expectedCash: expected.cash, actualCash: num(body.actualCash || 0),
    expectedMobile: expected.mobile, actualMobile: num(body.actualMobile || 0),
    expectedCard: expected.card, actualCard: num(body.actualCard || 0),
    currency: body.currency || 'USD', notes: body.notes || null, createdAt: iso(),
  }
  db.reconciliations.push(rec)
  audit('finalize_reconciliation', 'shift_reconciliation', rec.id, { expected })
  return { status: 201, data: { ...rec, closer: brief(me()) } }
})

// Reports
route('GET', '/reports/summary', ({ query }) => {
  const to = query.to ? dayEnd(query.to) : new Date()
  const from = query.from ? dayStart(query.from) : new Date(Date.now() - 30 * 86400000)
  const inRange = (d) => new Date(d) >= from && new Date(d) <= to
  const payments = db.payments.filter(p => inRange(p.timestamp))
  const byMethod = { cash: 0, mobile: 0, card: 0 }; const byCurrency = { USD: 0, UGX: 0 }; const byDay = {}
  let totalRevenue = 0
  payments.forEach(p => {
    totalRevenue += usd(p); byMethod[bucket(p.method)] += usd(p)
    byCurrency[p.currency] = (byCurrency[p.currency] || 0) + p.amount
    const d = dayKey(p.timestamp); byDay[d] = (byDay[d] || 0) + usd(p)
  })
  const totalRooms = db.rooms.length
  const rangeDays = Math.max(1, Math.round((to - from) / 86400000))
  const reservations = db.reservations.filter(r => new Date(r.checkinDate) <= to && new Date(r.checkoutDate) >= from)
  let roomNightsSold = 0; let roomRevenue = 0; const nightsByType = {}
  reservations.forEach(r => {
    const n = Math.max(1, Math.round((new Date(r.checkoutDate) - new Date(r.checkinDate)) / 86400000))
    resRoomsOf(r.id).forEach(rr => {
      roomNightsSold += n; roomRevenue += (rr.room?.defaultRate || 0) * n
      const t = rr.room?.type || 'Unknown'; nightsByType[t] = (nightsByType[t] || 0) + n
    })
  })
  const available = totalRooms * rangeDays
  const actStats = {}
  db.activitySchedules.filter(s => inRange(s.scheduledAt)).forEach(s => {
    const a = byId(db.activities, s.activityId)
    actStats[a.name] ||= { name: a.name, bookings: 0, pax: 0, revenue: 0 }
    db.activityBookings.filter(b => b.scheduleId === s.id).forEach(b => {
      actStats[a.name].bookings += 1; actStats[a.name].pax += b.paxCount; actStats[a.name].revenue += a.price * b.paxCount
    })
  })
  const guestStatus = { pending: 0, confirmed: 0, checked_in: 0, checked_out: 0 }
  reservations.forEach(r => { if (guestStatus[r.status] != null) guestStatus[r.status] += 1 })
  const tasks = db.housekeepingTasks.filter(t => inRange(t.timestamp))
  const hkCounts = { dirty: 0, cleaning: 0, clean: 0 }; const hkByDay = {}
  tasks.forEach(t => {
    if (hkCounts[t.status] != null) hkCounts[t.status] += 1
    const d = dayKey(t.timestamp); hkByDay[d] ||= { dirty: 0, cleaning: 0, clean: 0 }
    if (hkByDay[d][t.status] != null) hkByDay[d][t.status] += 1
  })
  const roomAvailability = { available: 0, occupied: 0 }; const roomCleanliness = { dirty: 0, cleaning: 0, clean: 0 }
  db.rooms.forEach(r => { roomAvailability[r.status] != null && roomAvailability[r.status]++; roomCleanliness[r.housekeepingStatus] != null && roomCleanliness[r.housekeepingStatus]++ })
  const outstanding = db.folios.filter(f => f.status === 'open').map(f => {
    const grand = sum(itemsOf(f.id), i => i.amount) * (1 + TAX_TOURISM + TAX_VAT)
    const paid = sum(paymentsOf(f.id), p => p.amount)
    return { id: f.id, guestName: byId(db.reservations, f.reservationId)?.guestName || `Folio #${f.id}`, currency: f.currency, grandTotal: grand, paid, balance: grand - paid }
  }).filter(f => f.balance > 0.01)
  const activitiesPer = Object.values(actStats)
  return {
    range: { from: from.toISOString(), to: to.toISOString(), days: rangeDays },
    revenue: { total: totalRevenue, byMethod, byCurrency, byDay: Object.entries(byDay).sort().map(([day, amount]) => ({ day, amount })), transactions: payments.length },
    occupancy: { percent: available ? Math.round((roomNightsSold / available) * 100) : 0, roomNightsSold, availableRoomNights: available, adr: roomNightsSold ? roomRevenue / roomNightsSold : 0, revpar: totalRooms ? roomRevenue / available : 0, roomRevenue, nightsByType: Object.entries(nightsByType).map(([type, nights]) => ({ type, nights })) },
    activities: { perActivity: activitiesPer, totalRevenue: sum(activitiesPer, a => a.revenue) },
    guests: { byStatus: Object.entries(guestStatus).map(([status, count]) => ({ status, count })) },
    housekeeping: { byStatus: Object.entries(hkCounts).map(([status, count]) => ({ status, count })), byDay: Object.entries(hkByDay).sort().map(([day, c]) => ({ day, ...c })), roomAvailability, roomCleanliness },
    outstanding,
    reconciliations: db.reconciliations.filter(r => inRange(r.date)).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30).map(r => ({ ...r, closer: { name: byId(db.users, r.closedBy)?.name } })),
  }
})

// ---- axios adapter ---------------------------------------------------------
export function mockAdapter(config) {
  return new Promise((resolve, reject) => {
    const method = (config.method || 'get').toUpperCase()
    const url = new URL(config.url, 'http://demo.local')
    const query = Object.fromEntries(url.searchParams)
    if (config.params) Object.assign(query, config.params)
    const path = url.pathname.replace(/^\/api/, '')
    let body = config.data
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    body = body || {}

    const respond = (status, data) => {
      const response = { data: data === undefined ? null : clone(data), status, statusText: String(status), headers: {}, config, request: {} }
      if (status >= 200 && status < 300) resolve(response)
      else reject(Object.assign(new Error(`Request failed with status code ${status}`), { response, config, isAxiosError: true }))
    }

    // Small artificial latency so loading states feel real.
    setTimeout(() => {
      for (const r of routes) {
        if (r.method !== method) continue
        const m = path.match(r.re)
        if (!m) continue
        const params = {}
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]) })
        try {
          const out = r.handler({ params, query, body })
          if (out && typeof out === 'object' && 'status' in out && 'data' in out && Object.keys(out).length === 2) respond(out.status, out.data)
          else respond(200, out)
          save()
        } catch (e) {
          if (e instanceof HttpError) respond(e.status, e.payload)
          else { console.error(e); respond(500, { error: 'Demo server error' }) }
        }
        return
      }
      respond(404, { error: 'Route not found' })
    }, 60)
  })
}
