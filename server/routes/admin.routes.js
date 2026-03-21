const express = require('express');
const router = express.Router();
const { protect, allow } = require('../middleware/auth.middleware');
const { getStats, getUsers } = require('../controllers/admin.controller');

router.get('/stats', protect, allow('admin'), getStats);
router.get('/users', protect, allow('admin'), getUsers);

module.exports = router;
