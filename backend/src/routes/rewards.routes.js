const express = require('express');
const router = express.Router();
const { getAllRewards } = require('../controllers/rewards.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.use(isAuthenticated);

router.get('/', getAllRewards);

module.exports = router;
