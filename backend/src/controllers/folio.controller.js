const prisma = require('../config/prisma');
const { calculateBalance, convertCurrency, getActiveExchangeRate } = require('../services/folio.service');
const { writeAuditLog } = require('../services/audit.service');

const TAX_TOURISM = 0.05;
const TAX_VAT = 0.18;

async function getFolio(req, res) {
  const id = Number(req.params.id);
  const folio = await prisma.folio.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: 'asc' } },
      payments: { include: { receiver: { select: { id: true, name: true } } }, orderBy: { timestamp: 'asc' } },
      reservation: { include: { reservationRooms: { include: { room: true } } } },
    },
  });
  if (!folio) return res.status(404).json({ error: 'Folio not found.' });

  const subtotal = folio.items.reduce((s, i) => s + Number(i.amount), 0);
  const tourismTax = subtotal * TAX_TOURISM;
  const vat = subtotal * TAX_VAT;
  const grandTotal = subtotal + tourismTax + vat;
  const totalPaid = folio.payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = grandTotal - totalPaid;

  // UGX conversion for display
  const ugxRate = await getActiveExchangeRate(folio.currency, 'UGX');

  res.json({
    ...folio,
    subtotal,
    tourismTax,
    vat,
    grandTotal,
    totalPaid,
    balance,
    ugxEquivalent: ugxRate ? grandTotal * ugxRate : null,
    ugxRate,
  });
}

async function listFolios(req, res) {
  const { status, date } = req.query;
  const where = {};
  if (status) where.status = status;
  if (date) {
    where.reservation = {
      checkinDate: {
        lte: new Date(date + 'T23:59:59'),
      },
      checkoutDate: {
        gte: new Date(date + 'T00:00:00'),
      },
    };
  }

  const folios = await prisma.folio.findMany({
    where,
    include: {
      reservation: { include: { reservationRooms: { include: { room: true } } } },
      payments: { orderBy: { timestamp: 'desc' } },
      items: true,
    },
    orderBy: { id: 'desc' },
  });
  res.json(folios);
}

async function addFolioItem(req, res) {
  const folioId = Number(req.params.id);
  const { description, amount, currency, type = 'other' } = req.body;

  if (!description || amount == null) {
    return res.status(400).json({ error: 'description and amount are required.' });
  }

  const folio = await prisma.folio.findUnique({ where: { id: folioId } });
  if (!folio) return res.status(404).json({ error: 'Folio not found.' });
  if (folio.status === 'closed') {
    return res.status(400).json({ error: 'Cannot add items to a closed folio.' });
  }

  const item = await prisma.folioItem.create({
    data: {
      folioId,
      description,
      amount: Number(amount),
      currency: currency || folio.currency,
      type,
    },
  });

  // Update folio total
  const allItems = await prisma.folioItem.findMany({ where: { folioId } });
  const newTotal = allItems.reduce((s, i) => s + Number(i.amount), 0);
  await prisma.folio.update({ where: { id: folioId }, data: { totalAmount: newTotal } });

  await writeAuditLog(req.user.id, 'add_folio_item', 'folio_item', item.id, {
    folioId,
    description,
    amount,
    type,
  });

  res.status(201).json(item);
}

async function recordPayment(req, res) {
  const folioId = Number(req.params.id);
  const { amount, currency, method, reference } = req.body;

  if (!amount || !method) {
    return res.status(400).json({ error: 'amount and method are required.' });
  }

  const folio = await prisma.folio.findUnique({
    where: { id: folioId },
    include: { items: true, payments: true },
  });
  if (!folio) return res.status(404).json({ error: 'Folio not found.' });

  const payment = await prisma.payment.create({
    data: {
      folioId,
      amount: Number(amount),
      currency: currency || folio.currency,
      method,
      reference: reference || null,
      receivedBy: req.user.id,
    },
  });

  // Recalculate and update folio status
  const subtotal = folio.items.reduce((s, i) => s + Number(i.amount), 0);
  const grandTotal = subtotal * (1 + TAX_TOURISM + TAX_VAT);
  const newPaid = folio.payments.reduce((s, p) => s + Number(p.amount), 0) + Number(amount);
  const newStatus = newPaid >= grandTotal ? 'paid' : folio.status;
  await prisma.folio.update({ where: { id: folioId }, data: { status: newStatus } });

  await writeAuditLog(req.user.id, 'record_payment', 'payment', payment.id, {
    folioId,
    amount,
    currency: currency || folio.currency,
    method,
  });

  res.status(201).json({ payment, folioStatus: newStatus });
}

// PATCH /api/folios/:id/status — manually set a folio's status (e.g. mark paid/closed).
async function updateFolioStatus(req, res) {
  const folioId = Number(req.params.id);
  const { status } = req.body;
  const allowed = ['open', 'paid', 'closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  const folio = await prisma.folio.findUnique({ where: { id: folioId } });
  if (!folio) return res.status(404).json({ error: 'Folio not found.' });

  const updated = await prisma.folio.update({
    where: { id: folioId },
    data: { status },
  });

  await writeAuditLog(req.user.id, 'update_folio_status', 'folio', folioId, {
    from: folio.status,
    to: status,
  });

  res.json(updated);
}

module.exports = { getFolio, listFolios, addFolioItem, recordPayment, updateFolioStatus };
