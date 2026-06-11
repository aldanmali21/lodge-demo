const router = require('express').Router();
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');
const { writeAuditLog } = require('../services/audit.service');

// Group a payment's free-text method into one of three buckets.
function bucket(method = '') {
  const m = method.toLowerCase();
  if (m.includes('cash')) return 'cash';
  if (m.includes('airtel') || m.includes('mtn') || m.includes('momo') || m.includes('mobile')) return 'mobile';
  if (m.includes('card') || m.includes('credit') || m.includes('debit') || m.includes('terminal')) return 'card';
  return 'cash'; // default unknown methods to cash bucket
}

function dayRange(dateStr) {
  const base = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(start.getTime() + 86400000 - 1);
  return { start, end };
}

function rangeFromQuery(query = {}) {
  const from = query.from ? new Date(`${query.from}T00:00:00`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = query.to ? new Date(`${query.to}T23:59:59`) : new Date();
  return { from, to };
}

async function loadFinanceJournal(from, to) {
  const [manualEntries, payments] = await Promise.all([
    prisma.financeEntry.findMany({
      where: { entryDate: { gte: from, lte: to } },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { entryDate: 'desc' },
    }),
    prisma.payment.findMany({
      where: { timestamp: { gte: from, lte: to } },
      include: {
        folio: { include: { reservation: { select: { guestName: true } } } },
        receiver: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
    }),
  ]);

  const rows = [
    ...manualEntries.map(entry => ({
      id: `fe-${entry.id}`,
      entryType: entry.entryType,
      category: entry.category,
      description: entry.description,
      amount: Number(entry.amount),
      currency: entry.currency,
      entryDate: entry.entryDate,
      source: entry.creator?.name || 'Staff',
      method: 'Manual',
      origin: 'manual',
      bucket: entry.entryType,
    })),
    ...payments.map(payment => ({
      id: `p-${payment.id}`,
      entryType: 'income',
      category: payment.method || 'Payment',
      description: payment.reference || payment.folio?.reservation?.guestName || 'Guest payment',
      amount: Number(payment.amount),
      currency: payment.currency,
      entryDate: payment.timestamp,
      source: payment.receiver?.name || 'Staff',
      method: payment.method,
      origin: 'payment',
      bucket: 'income',
    })),
  ].sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));

  return { manualEntries, payments, rows };
}

// GET /api/finance/entries?from=&to=&type=&category=
router.get('/entries', authenticate, authorizeRoles('admin', 'frontdesk', 'viewer'), async (req, res) => {
  const { from, to } = rangeFromQuery(req.query);
  const type = req.query.type || '';
  const category = req.query.category || '';

  const { rows } = await loadFinanceJournal(from, to);
  const filtered = rows.filter(row => {
    if (type && type !== 'all' && row.entryType !== type) return false;
    if (category && category !== 'all' && row.category !== category) return false;
    return true;
  });

  res.json({ rows: filtered, from: from.toISOString(), to: to.toISOString() });
});

// GET /api/finance/summary?from=&to=
router.get('/summary', authenticate, authorizeRoles('admin', 'frontdesk', 'viewer'), async (req, res) => {
  const { from, to } = rangeFromQuery(req.query);
  const { rows } = await loadFinanceJournal(from, to);

  const summary = {
    income: 0,
    expenses: 0,
    byCategory: {},
    byDay: {},
  };

  for (const row of rows) {
    const amount = Number(row.amount || 0);
    if (row.entryType === 'expense') summary.expenses += amount; else summary.income += amount;
    summary.byCategory[row.category] = (summary.byCategory[row.category] || 0) + amount;
    const day = new Date(row.entryDate).toISOString().slice(0, 10);
    if (!summary.byDay[day]) summary.byDay[day] = { income: 0, expense: 0 };
    if (row.entryType === 'expense') summary.byDay[day].expense += amount; else summary.byDay[day].income += amount;
  }

  res.json({
    range: { from: from.toISOString(), to: to.toISOString() },
    income: summary.income,
    expenses: summary.expenses,
    profit: summary.income - summary.expenses,
    byCategory: Object.entries(summary.byCategory).map(([categoryName, amount]) => ({ category: categoryName, amount })),
    byDay: Object.entries(summary.byDay).sort().map(([day, totals]) => ({ day, ...totals })),
  });
});

// POST /api/finance/entries — add income/expense journal item
router.post('/entries', authenticate, authorizeRoles('admin', 'frontdesk'), async (req, res) => {
  const { entryType, category, description, amount, currency = 'USD', entryDate } = req.body;
  if (!['income', 'expense'].includes(entryType)) {
    return res.status(400).json({ error: 'entryType must be income or expense.' });
  }
  if (!category || !description || amount == null || !entryDate) {
    return res.status(400).json({ error: 'entryType, category, description, amount, and entryDate are required.' });
  }

  const entry = await prisma.financeEntry.create({
    data: {
      entryType,
      category,
      description,
      amount: Number(amount),
      currency,
      entryDate: new Date(entryDate),
      createdBy: req.user.id,
    },
    include: { creator: { select: { id: true, name: true } } },
  });

  await writeAuditLog(req.user.id, 'create_finance_entry', 'finance_entry', entry.id, {
    entryType,
    category,
    amount,
    entryDate,
  });

  res.status(201).json(entry);
});

// GET /api/finance/reconciliation/today — the day's payments (all sources, incl. walk-ins),
// expected totals by bucket, and any saved reconciliation.
router.get('/reconciliation/today', authenticate, authorizeRoles('admin', 'frontdesk', 'viewer'), async (req, res) => {
  const { start, end } = dayRange(req.query.date);

  const payments = await prisma.payment.findMany({
    where: { timestamp: { gte: start, lte: end } },
    include: {
      folio: { include: { reservation: { select: { guestName: true } } } },
      receiver: { select: { name: true } },
    },
    orderBy: { timestamp: 'desc' },
  });

  const expected = { cash: 0, mobile: 0, card: 0 };
  for (const p of payments) expected[bucket(p.method)] += Number(p.amount);

  const list = payments.map(p => ({
    id: p.id,
    timestamp: p.timestamp,
    amount: p.amount,
    currency: p.currency,
    method: p.method,
    reference: p.reference,
    bucket: bucket(p.method),
    source: p.folio?.reservation?.guestName || (p.reference || 'Walk-in / Other'),
    staff: p.receiver?.name || 'Staff',
  }));

  const existing = await prisma.shiftReconciliation.findFirst({
    where: { date: { gte: start, lte: end } },
    orderBy: { createdAt: 'desc' },
    include: { closer: { select: { id: true, name: true } } },
  });

  res.json({
    date: start.toISOString(),
    expected,
    payments: list,
    transactionCount: payments.length,
    existing,
  });
});

// POST /api/finance/reconciliation — save a shift close with counted actuals
router.post('/reconciliation', authenticate, authorizeRoles('admin', 'frontdesk'), async (req, res) => {
  const { actualCash = 0, actualMobile = 0, actualCard = 0, currency = 'USD', notes } = req.body;
  const { start, end } = dayRange();

  const payments = await prisma.payment.findMany({ where: { timestamp: { gte: start, lte: end } } });
  const expected = { cash: 0, mobile: 0, card: 0 };
  for (const p of payments) expected[bucket(p.method)] += Number(p.amount);

  const rec = await prisma.shiftReconciliation.create({
    data: {
      closedBy: req.user.id,
      expectedCash: expected.cash, actualCash: Number(actualCash),
      expectedMobile: expected.mobile, actualMobile: Number(actualMobile),
      expectedCard: expected.card, actualCard: Number(actualCard),
      currency, notes: notes || null,
    },
    include: { closer: { select: { id: true, name: true } } },
  });

  await writeAuditLog(req.user.id, 'finalize_reconciliation', 'shift_reconciliation', rec.id, {
    expected, actual: { cash: actualCash, mobile: actualMobile, card: actualCard },
  });

  res.status(201).json(rec);
});

module.exports = router;
