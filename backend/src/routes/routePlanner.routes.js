// Performance: Route planner endpoints - ORS calls proxied through backend to protect API key
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const controller = require('../controllers/routePlanner.controller');

// All routes require authentication
router.use(isAuthenticated);

// POST /api/routes/plan - Plan routes for all 6 modes
router.post('/plan', controller.plan);

// GET /api/routes/autocomplete?q= - Address autocomplete (debounce 400ms client-side)
router.get('/autocomplete', controller.autocomplete);

// GET /api/routes/saved - Get user's saved routes
router.get('/saved', controller.getSaved);

// POST /api/routes/saved - Save a route (max 5)
router.post('/saved', controller.saveRoute);

// DELETE /api/routes/saved/:id - Delete a saved route
router.delete('/saved/:id', controller.deleteRoute);

module.exports = router;
