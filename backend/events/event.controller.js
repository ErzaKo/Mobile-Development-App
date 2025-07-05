const Event = require('./event.model');
const { Op } = require('sequelize');

// Create Event
const createEvent = async (req, res) => {
  try {
    const { name, date, location, price, categoryId } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !date || !location || !price || !categoryId || !photo) {
      return res.status(400).json({ message: 'All fields including photo are required.' });
    }

    const newEvent = await Event.create({
      name,
      photo,
      date,
      location,
      price,
      categoryId,
    });

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Search Events
const searchEvents = async (req, res) => {
  try {
    const { query } = req.query;
    
    console.log('Search query received:', query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = query.trim();
    console.log('Searching for:', searchQuery);

    const events = await Event.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchQuery}%` } },
          { location: { [Op.iLike]: `%${searchQuery}%` } }
        ]
      }
    });

    console.log('Search results found:', events.length);
    res.status(200).json({ events });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching events', error: error.message });
  }
};

// Get Events by Category
const getEventsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const events = await Event.findAll({
      where: { categoryId: categoryId }
    });
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events by category', error: error.message });
  }
};

// Get Event by ID (include categoryId)
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// Update Event (including categoryId)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, photo, date, location, price, categoryId } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.name = name || event.name;
    event.photo = photo || event.photo;
    event.date = date || event.date;
    event.location = location || event.location;
    event.price = price || event.price;
    event.categoryId = categoryId || event.categoryId;

    await event.save();

    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.destroy();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  searchEvents,
  getEventsByCategory,
  getEventById,
  updateEvent,
  deleteEvent,
};