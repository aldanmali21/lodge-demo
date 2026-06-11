const { Prisma } = require('@prisma/client');

function errorMiddleware(err, req, res, next) {
  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A record with that value already exists.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Related record not found.' });
    }
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { errorMiddleware };
