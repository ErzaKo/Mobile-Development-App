const Contact = require('./contact.model');
const sendEmail = require('./sendEmail');

exports.createContact = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    const contact = new Contact({ fullName, email, subject, message });
    await contact.save();

    await sendEmail({
      to: email,
      subject: 'Thank you for contacting us',
      text: `Dear ${fullName},\n\nThank you for reaching out. We received your message and will get back to you soon.`,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission',
      text: `New contact form received from ${fullName} (${email}).\nSubject: ${subject}\nMessage: ${message}`,
    });

    res.status(201).json({ message: 'Contact created successfully', contact });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ contacts });
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contact = await Contact.findByIdAndUpdate(id, updates, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    res.status(200).json({ message: 'Contact updated', contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
