import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import axios from 'axios';
import { getToken } from '../../../utils/auth';

const ContactCard = ({ contact, onRefresh }: any) => {
  const handleUpdate = async () => {
    try {
      const token = await getToken();
      await axios.put(
        `http://192.168.0.38:5002/api/contacts/${contact._id}`,
        { status: 'read' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Failed to update contact.');
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      await axios.delete(
        `http://192.168.0.38:5002/api/contacts/${contact._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Error', 'Failed to delete contact.');
    }
  };

  return (
    <View style={{ padding: 12, margin: 10, borderWidth: 1, borderRadius: 8 }}>
      <Text>📧 {contact.email}</Text>
      <Text>📝 {contact.subject}</Text>
      <Text>📨 {contact.message}</Text>
      <Text>Status: {contact.status}</Text>

      <Button title="Mark as Read" onPress={handleUpdate} />
      <Button title="Delete" color="red" onPress={handleDelete} />
    </View>
  );
};

export default ContactCard;
