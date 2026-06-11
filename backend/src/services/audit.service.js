const prisma = require('../config/prisma');

async function writeAuditLog(actorId, action, objectType, objectId, details = {}) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      objectType,
      objectId,
      details,
    },
  });
}

module.exports = { writeAuditLog };
