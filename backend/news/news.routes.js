const express = require('express');
const router = express.Router();
const controller = require('./news.controller');

// CRUD routes
router.get('/', controller.getAllNews);
router.get('/:id', controller.getNewsById);
router.post('/', controller.createNews);
router.put('/:id', controller.updateNews);
router.delete('/:id', controller.deleteNews);

module.exports = router;
