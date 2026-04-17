const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

router.get('/inventory/dashboard', inventoryController.getInventoryDashboard);
router.get('/inventory/alerts/low-stock', inventoryController.getLowStockAlerts);

module.exports = router;
