// Correct usage of the Event model
const Event = require('./event.model'); // Ensure the path is correct

async function addEvent() {
  try {
    // Use Event.create() instead of createEvent()
    const newEvent = await Event.create({
      name: 'Music Concert',
      photo: 'https://example.com/photo.jpg',
      date: new Date('2025-05-15T19:00:00'), // Ensure the date format is correct
      location: 'City Hall, Downtown',
      price: 50.00,
    });

    console.log('New event added:', newEvent);
  } catch (error) {
    console.error('Error adding event:', error);
  }
}

addEvent();
