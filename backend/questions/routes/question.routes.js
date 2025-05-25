const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} = require('../controllers/question.controller');
const verifyToken = require('../../users/middleware/jwtMiddleware');
const allowRoles = require('../../users/middleware/roleMiddleware');

// @route   POST /api/questions
router.post('/', verifyToken, createQuestion);

// @route   GET /api/questions
router.get('/', verifyToken, allowRoles('admin'), getAllQuestions);

// @route   GET /api/questions/:id
router.get('/:id', verifyToken, getQuestionById);

// @route   PUT /api/questions/:id
router.put('/:id', verifyToken, allowRoles('admin'), updateQuestion);

// @route   DELETE /api/questions/:id
router.delete('/:id', verifyToken, allowRoles('admin'), deleteQuestion);

module.exports = router;
