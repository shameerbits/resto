const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

router.post('/menu', menuController.createMenuItem);
router.get('/menu', menuController.listMenuItems);
router.get('/menu/:id', menuController.getMenuItemById);
router.put('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.deleteMenuItem);

module.exports = router;
