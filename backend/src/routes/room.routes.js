const router = require('express').Router();
const { listRooms, getRoomById, createRoom, updateRoom, deleteRoom, updateRoomStatus, getAvailableRooms } = require('../controllers/room.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');

router.get('/', authenticate, authorizeRoles('admin', 'frontdesk', 'housekeeping', 'viewer'), listRooms);
// '/available' must be declared before '/:id' so it isn't captured as an id param.
router.get('/available', authenticate, authorizeRoles('admin', 'frontdesk'), getAvailableRooms);
router.get('/:id', authenticate, authorizeRoles('admin', 'frontdesk', 'housekeeping', 'viewer'), getRoomById);
router.post('/', authenticate, authorizeRoles('admin'), createRoom);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateRoom);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteRoom);
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'frontdesk', 'housekeeping'), updateRoomStatus);

module.exports = router;
