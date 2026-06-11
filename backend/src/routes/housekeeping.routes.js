const router = require('express').Router();
const { listTasks, completeTask, createTask, updateTaskStatus } = require('../controllers/housekeeping.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');

router.get('/tasks', authenticate, authorizeRoles('admin', 'frontdesk', 'housekeeping', 'viewer'), listTasks);
router.post('/tasks', authenticate, authorizeRoles('admin', 'frontdesk', 'housekeeping'), createTask);
router.patch('/tasks/:id', authenticate, authorizeRoles('admin', 'frontdesk', 'housekeeping'), updateTaskStatus);
router.post('/tasks/:id/complete', authenticate, authorizeRoles('admin', 'frontdesk', 'housekeeping'), completeTask);

module.exports = router;
