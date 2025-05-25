const Notification = require('./notification.model.js');
console.log('Notification model:', Notification);


// Marr të gjitha njoftimet për një user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Gabim gjatë marrjes së njoftimeve', error });
  }
};

// Krijo njoftim të ri
exports.createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const newNotification = new Notification({ userId, message });
    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ message: 'Gabim gjatë krijimit të njoftimit', error });
  }
};

// Përditëso statusin e leximit të njoftimit
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const updatedNotification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    if (!updatedNotification) return res.status(404).json({ message: 'Njoftimi nuk u gjet' });
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: 'Gabim gjatë përditësimit të njoftimit', error });
  }
};

// Fshi një njoftim
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);
    if (!deletedNotification) return res.status(404).json({ message: 'Njoftimi nuk u gjet për fshirje' });
    res.status(200).json({ message: 'Njoftimi u fshi me sukses' });
  } catch (error) {
    res.status(500).json({ message: 'Gabim gjatë fshirjes së njoftimit', error });
  }
};
