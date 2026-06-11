const router = require('express').Router();
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');
const { sendInviteEmail } = require('../config/mailer');
const { sendInviteSms } = require('../config/sms');
const { writeAuditLog } = require('../services/audit.service');

const VALID_ROLES = ['admin', 'frontdesk', 'pos', 'guide', 'housekeeping', 'viewer'];

// GET /api/users/me
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

// PUT /api/users/me
router.put('/me', authenticate, async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) return res.status(400).json({ error: 'Provide name or email to update.' });

  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;

  const user = await prisma.user.update({
    where: { id: Number(req.user.id) },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json(user);
});

// PUT /api/users/me/password
router.put('/me/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const user = await prisma.user.findUnique({ where: { id: Number(req.user.id) } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  res.json({ message: 'Password updated successfully.' });
});

// GET /api/users — admin only
router.get('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  const { role } = req.query;
  const where = role ? { role } : {};
  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(users);
});

// PUT /api/users/:id/role — admin only
router.put('/:id/role', authenticate, authorizeRoles('admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body;
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
  }
  if (id === req.user.id) {
    return res.status(400).json({ error: 'You cannot change your own role.' });
  }
  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  await writeAuditLog(req.user.id, 'update_user_role', 'user', id, { newRole: role });
  res.json(user);
});

// POST /api/users/invite — admin only
// channel: 'email' | 'sms' | 'both' (default 'email'). phone required when sms/both.
router.post('/invite', authenticate, authorizeRoles('admin'), async (req, res) => {
  const { email, role, channel = 'email', phone } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'email and role are required.' });
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
  }
  if ((channel === 'sms' || channel === 'both') && !phone) {
    return res.status(400).json({ error: 'phone is required for SMS invites.' });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'A user with this email already exists.' });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Upsert invite (allow re-inviting same email)
  await prisma.userInvite.upsert({
    where: { email },
    update: { role, token, expiresAt, usedAt: null, createdBy: req.user.id },
    create: { email, role, token, expiresAt, createdBy: req.user.id },
  });

  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const inviteUrl = `${appUrl}/accept-invite?token=${token}`;

  const inviter = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true } });

  // Always record that the invite was created, regardless of delivery outcome.
  await writeAuditLog(req.user.id, 'invite_user', 'user_invite', 0, { email, role, channel });

  const wantEmail = channel === 'email' || channel === 'both';
  const wantSms = channel === 'sms' || channel === 'both';
  let emailError = null;
  let smsStub = false;

  if (wantEmail) {
    try {
      await sendInviteEmail({ to: email, role, inviteUrl, inviterName: inviter.name });
    } catch (err) {
      console.error('Email send failed:', err); // full error for debugging
      emailError = err.message;
    }
  }

  if (wantSms) {
    const smsResult = await sendInviteSms({ to: phone, role, inviteUrl, inviterName: inviter.name });
    smsStub = Boolean(smsResult.stub);
  }

  // Success if the requested email channel sent OK; SMS in stub mode is informational.
  const emailOk = wantEmail && !emailError;
  let message;
  if (emailOk && !wantSms) message = `Invite sent to ${email}`;
  else if (emailOk && wantSms) message = `Invite emailed to ${email}` + (smsStub ? ' (SMS pending integration)' : ` and texted to ${phone}`);
  else if (!wantEmail && wantSms) message = smsStub ? 'Invite created (SMS pending integration — share link manually)' : `Invite texted to ${phone}`;
  else message = 'Invite created but email failed to send. Use this link manually:';

  res.status(201).json({ message, inviteUrl, emailError, smsStub });
});

// GET /api/users/audit-log — admin only
router.get('/audit-log', authenticate, authorizeRoles('admin'), async (req, res) => {
  const { actor, action, from, to, limit = 100, offset = 0 } = req.query;
  const where = {};
  if (actor) where.actorId = Number(actor);
  if (action) where.action = action;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({ logs, total, limit: Number(limit), offset: Number(offset) });
});

module.exports = router;
