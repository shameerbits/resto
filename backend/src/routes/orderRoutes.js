const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/orders', orderController.createOrder);
router.get('/orders/:id', orderController.getOrderById);

module.exports = router;
