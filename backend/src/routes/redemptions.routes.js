const express = require('express');
const router = express.Router();
const { redeemReward, getHistory, getActive } = require('../controllers/redemptions.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.use(isAuthenticated);

router.post('/', redeemReward);
router.get('/', getHistory);
router.get('/active', getActive);

module.exports = router;
