const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

function buildTokenPayload(user) {
  return {
    sub: String(user.id),
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function signToken(user) {
  return jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
}

function isDatabaseConnectionError(error) {
  return Boolean(
    error &&
      (
        error.code === 'P1001' ||
        error.code === 'P1017' ||
        error.code === 'P1000' ||
        /authentication failed|can't reach database server|database server at .* are not valid/i.test(error.message || '')
      )
  );
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  let user;

  try {
    user = await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({
        message: 'Database connection is not available. Check that DATABASE_URL is set correctly.',
      });
    }

    throw error;
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

async function refresh(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let user;

  try {
    user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return res.status(503).json({
        message: 'Database connection is not available. Check that DATABASE_URL is set correctly.',
      });
    }

    throw error;
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid token subject' });
  }

  return res.json({
    token: signToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

module.exports = {
  login,
  refresh,
};
