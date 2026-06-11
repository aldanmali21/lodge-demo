const router = require('express').Router();
const bcrypt = require('bcrypt');
const { login, refresh } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const prisma = require('../config/prisma');

router.post('/login', login);
router.post('/refresh', authenticate, refresh);

// GET /api/auth/verify-invite?token= — public
router.get('/verify-invite', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required.' });

  const invite = await prisma.userInvite.findUnique({ where: { token } });
  if (!invite) return res.status(404).json({ error: 'Invalid or expired invite link.' });
  if (invite.usedAt) return res.status(410).json({ error: 'This invite has already been used.' });
  if (new Date() > invite.expiresAt) return res.status(410).json({ error: 'This invite has expired.' });

  res.json({ email: invite.email, role: invite.role });
});

// POST /api/auth/accept-invite — public
router.post('/accept-invite', async (req, res) => {
  const { token, firstName, lastName, password } = req.body;
  if (!token || !firstName || !lastName || !password) {
    return res.status(400).json({ error: 'token, firstName, lastName, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const invite = await prisma.userInvite.findUnique({ where: { token } });
  if (!invite) return res.status(404).json({ error: 'Invalid invite token.' });
  if (invite.usedAt) return res.status(410).json({ error: 'This invite has already been used.' });
  if (new Date() > invite.expiresAt) return res.status(410).json({ error: 'This invite has expired.' });

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const name = `${firstName} ${lastName}`.trim();

  const user = await prisma.user.create({
    data: { name, email: invite.email, passwordHash, role: invite.role },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.userInvite.update({ where: { token }, data: { usedAt: new Date() } });

  // Auto-login: return a token
  const jwt = require('jsonwebtoken');
  const jwtToken = jwt.sign(
    { sub: String(user.id), id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.status(201).json({ token: jwtToken, user });
});

module.exports = router;
