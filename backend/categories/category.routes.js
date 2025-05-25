// routes/event.routes.js
const express = require('express');
const router = express.Router();
const {
  createCategories,
  getAllCategories,
  getCategoriesById,
  updateCategories,
  deleteCategories,
} = require('./category.controller');

router.post('/', createCategories);

router.get('/', getAllCategories);

router.get('/:id', getCategoriesById);

router.put('/:id', updateCategories);

router.delete('/:id', deleteCategories);

module.exports = router;
