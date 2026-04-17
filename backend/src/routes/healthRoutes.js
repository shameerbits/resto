const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

router.get('/health', healthController.apiHealth);
router.get('/health/db', healthController.dbHealth);

module.exports = router;
