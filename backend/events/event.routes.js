const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');  

const {
  createEvent,
  getAllEvents,
  searchEvents,
  getEventsByCategory,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('./event.controller'); 

router.post('/', upload.single('photo'), createEvent);
router.get('/search', searchEvents);
router.get('/category/:categoryId', getEventsByCategory);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.put('/:id', upload.single('photo'), updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;