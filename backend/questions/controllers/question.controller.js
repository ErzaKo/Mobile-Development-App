const Question = require('../../questions/models/questions.model');  // Adjust the path to your model
const User = require('../../users/user.model'); // Adjust if needed

// Create a new question
const createQuestion = async (req, res) => {
  try {
    const { user_id, question, is_answered } = req.body;

    // Check if user exists before creating a question
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newQuestion = await Question.create({
      user_id,
      question,
      is_answered: is_answered || false, // Default to false if not provided
    });

    res.status(201).json({ message: 'Question created successfully', question: newQuestion });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
      ],
    });

    res.status(200).json({ results: questions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a specific question by ID
const getQuestionById = async (req, res) => {
  try {
    const questionId = req.params.id;

    const question = await Question.findByPk(questionId, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    });

    if (!question) return res.status(404).json({ message: 'Question not found' });

    res.status(200).json({ result: question });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a question
const updateQuestion = async (req, res) => {
  try {
    const { question, is_answered } = req.body;
    const questionId = req.params.id;

    const existingQuestion = await Question.findByPk(questionId);
    if (!existingQuestion) return res.status(404).json({ message: 'Question not found' });

    // Update fields
    if (question) existingQuestion.question = question;
    if (is_answered !== undefined) existingQuestion.is_answered = is_answered;

    await existingQuestion.save();

    res.status(200).json({ message: 'Question updated successfully', question: existingQuestion });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    const question = await Question.findByPk(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await question.destroy();

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
