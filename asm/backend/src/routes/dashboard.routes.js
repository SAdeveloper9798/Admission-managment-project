const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboard.controller');

router.get('/stats', authenticate, getDashboardStats);

module.exports = router;
