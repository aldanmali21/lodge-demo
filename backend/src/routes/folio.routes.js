const router = require('express').Router();
const { getFolio, listFolios, addFolioItem, recordPayment, updateFolioStatus } = require('../controllers/folio.controller');
const authenticate = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/rbac.middleware');

router.get('/', authenticate, authorizeRoles('admin', 'frontdesk', 'viewer'), listFolios);
router.get('/:id', authenticate, authorizeRoles('admin', 'frontdesk', 'viewer'), getFolio);
router.post('/:id/items', authenticate, authorizeRoles('admin', 'frontdesk', 'pos'), addFolioItem);
router.post('/:id/payments', authenticate, authorizeRoles('admin', 'frontdesk'), recordPayment);
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'frontdesk'), updateFolioStatus);

module.exports = router;
