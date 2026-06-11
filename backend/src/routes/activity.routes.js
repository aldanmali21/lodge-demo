const router = require('express').Router();
const { listActivities, listSchedules, createActivity, createSchedule, updateSchedule, updateActivity, bookActivity, updateScheduleStatus } = require('../controllers/activity.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');

router.get('/', authenticate, authorizeRoles('admin', 'frontdesk', 'guide', 'viewer'), listActivities);
router.get('/schedules', authenticate, authorizeRoles('admin', 'frontdesk', 'guide', 'viewer'), listSchedules);
router.post('/', authenticate, authorizeRoles('admin', 'frontdesk'), createActivity);
router.patch('/:id', authenticate, authorizeRoles('admin', 'frontdesk'), updateActivity);
router.post('/schedules', authenticate, authorizeRoles('admin', 'frontdesk'), createSchedule);
router.patch('/schedules/:id', authenticate, authorizeRoles('admin', 'frontdesk'), updateSchedule);
// guides can advance a slot's status (not_started → in_progress → completed)
router.patch('/schedules/:id/status', authenticate, authorizeRoles('admin', 'frontdesk', 'guide'), updateScheduleStatus);
router.post('/:id/book', authenticate, authorizeRoles('admin', 'frontdesk'), bookActivity);

module.exports = router;
