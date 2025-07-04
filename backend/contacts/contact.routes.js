const express = require('express');
const router = express.Router();

const contactController = require('./contact.controller');
const verifyToken = require('../users/middleware/jwtMiddleware');
const allowRoles = require('../users/middleware/roleMiddleware');

// PUBLIC
router.post('/', contactController.createContact);

// ADMIN ONLY
router.get('/', verifyToken, allowRoles('admin'), contactController.getAllContacts);
router.put('/:id', verifyToken, allowRoles('admin'), contactController.updateContact);
router.delete('/:id', verifyToken, allowRoles('admin'), contactController.deleteContact);

module.exports = router;
