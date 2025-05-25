const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');

// Merr të gjitha njoftimet për userId
router.get('/:userId', notificationController.getNotifications);

// Krijo njoftim të ri
router.post('/', notificationController.createNotification);

// Përditëso statusin e leximit (mark as read)
router.put('/read/:id', notificationController.markAsRead);

// Fshi njoftimin
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
