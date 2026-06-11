const router = require('express').Router();
const {
  listReservations,
  getReservation,
  createReservation,
  checkInReservation,
  checkOutReservation,
} = require('../controllers/reservation.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');

router.get('/', authenticate, authorizeRoles('admin', 'frontdesk'), listReservations);
router.get('/:id', authenticate, authorizeRoles('admin', 'frontdesk'), getReservation);
router.post('/', authenticate, authorizeRoles('admin', 'frontdesk'), createReservation);
router.post('/:id/checkin', authenticate, authorizeRoles('admin', 'frontdesk'), checkInReservation);
router.post('/:id/checkout', authenticate, authorizeRoles('admin', 'frontdesk'), checkOutReservation);

module.exports = router;
