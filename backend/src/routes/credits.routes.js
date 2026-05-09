const express = require('express');
const router = express.Router();
const { getBalance, getTransactions } = require('../controllers/credits.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.use(isAuthenticated);

router.get('/balance', getBalance);
router.get('/transactions', getTransactions);

module.exports = router;
