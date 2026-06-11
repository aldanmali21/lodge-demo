const prisma = require('../config/prisma');

async function calculateBalance(folioId) {
  const folio = await prisma.folio.findUnique({
    where: { id: folioId },
    include: { items: true, payments: true },
  });
  if (!folio) return null;

  const charged = folio.items.reduce((sum, item) => sum + Number(item.amount), 0);
  const paid = folio.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  return { charged, paid, balance: charged - paid };
}

async function getActiveExchangeRate(from, to) {
  const rate = await prisma.exchangeRate.findFirst({
    where: { baseCurrency: from, targetCurrency: to },
    orderBy: { effectiveDate: 'desc' },
  });
  return rate ? Number(rate.rate) : null;
}

async function convertCurrency(amount, from, to) {
  if (from === to) return Number(amount);
  const rate = await getActiveExchangeRate(from, to);
  if (!rate) return null;
  return Number(amount) * rate;
}

module.exports = { calculateBalance, convertCurrency, getActiveExchangeRate };
