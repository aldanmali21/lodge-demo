const router = require('express').Router();
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');
const { writeAuditLog } = require('../services/audit.service');

// Create a POS order; optionally route to a folio
router.post('/orders', authenticate, authorizeRoles('admin', 'frontdesk', 'pos'), async (req, res) => {
  const { items = [], folioId, currency = 'USD' } = req.body;
  if (!items.length) return res.status(400).json({ error: 'At least one item is required.' });

  const total = items.reduce((s, i) => s + (Number(i.price) * Number(i.qty || 1)), 0);

  if (folioId) {
    const folio = await prisma.folio.findUnique({ where: { id: Number(folioId) } });
    if (!folio) return res.status(404).json({ error: 'Folio not found.' });

    const description = items.map(i => `${i.qty || 1}x ${i.name}`).join(', ');
    const folioItem = await prisma.folioItem.create({
      data: { folioId: Number(folioId), description, amount: total, currency, type: 'pos' },
    });

    const allItems = await prisma.folioItem.findMany({ where: { folioId: Number(folioId) } });
    const newTotal = allItems.reduce((s, i) => s + Number(i.amount), 0);
    await prisma.folio.update({ where: { id: Number(folioId) }, data: { totalAmount: newTotal } });

    await writeAuditLog(req.user.id, 'pos_charge_to_room', 'folio_item', folioItem.id, { folioId, total, items });
    return res.status(201).json({ folioItem, message: 'Charged to room folio.' });
  }

  await writeAuditLog(req.user.id, 'pos_cash_sale', 'order', 0, { items, total, currency });
  res.status(201).json({ message: 'Cash sale recorded.', total, items });
});

// Get menu items (static seed for now - would be its own table in production)
router.get('/menu', authenticate, authorizeRoles('admin', 'frontdesk', 'pos'), async (req, res) => {
  const menu = {
    Starters: [
      { id: 1, name: 'Artisan Bread Board', price: 18.00, notes: 'Gluten-Free Option' },
      { id: 2, name: 'Gazpacho Andaluz', price: 14.00 },
      { id: 3, name: 'Truffle Arancini', price: 22.00 },
      { id: 4, name: 'Burrata & Heirloom Tomato', price: 24.00 },
      { id: 5, name: 'Charcuterie Platter', price: 38.00, notes: 'Serves 2' },
    ],
    Mains: [
      { id: 6, name: 'Wagyu Beef Burger', price: 36.00 },
      { id: 7, name: 'Grilled Nile Perch', price: 42.00 },
      { id: 8, name: 'Safari Nyama Choma', price: 45.00 },
      { id: 9, name: 'Vegetarian Tagine', price: 28.00 },
    ],
    'Grill & Fire': [
      { id: 10, name: 'T-Bone Steak 400g', price: 65.00 },
      { id: 11, name: 'Mixed Grill Platter', price: 58.00 },
      { id: 12, name: 'Lamb Chops', price: 52.00 },
    ],
    Drinks: [
      { id: 13, name: 'Rift Valley Gin & Tonic', price: 15.00 },
      { id: 14, name: 'Tusker Lager', price: 8.00 },
      { id: 15, name: 'Fresh Passion Juice', price: 6.00 },
      { id: 16, name: 'Masai Mara Sundowner', price: 18.00 },
    ],
    Desserts: [
      { id: 17, name: 'Malva Pudding', price: 12.00 },
      { id: 18, name: 'Chocolate Safari Tart', price: 14.00 },
    ],
  };
  res.json(menu);
});

module.exports = router;
