import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Contact = {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
};

const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await axios.get('http://192.168.0.38:5002/api/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data.contacts);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
        console.error('Failed to fetch contacts:', err.response?.data || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
        console.error('Unexpected error fetching contacts:', err.message);
      } else {
        setError('An unknown error occurred');
        console.error('Unknown error:', err);
      }
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await axios.delete(`http://192.168.0.38:5002/api/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Deleted', 'Contact has been deleted');
      fetchContacts();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        Alert.alert('Error', err.response?.data?.message || err.message);
        console.error('Delete error:', err.response?.data || err.message);
      } else if (err instanceof Error) {
        Alert.alert('Error', err.message);
        console.error('Unexpected delete error:', err.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
        console.error('Unknown delete error:', err);
      }
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.fullName}</Text>
      <Text>{item.email}</Text>
      <Text>{item.subject}</Text>
      <Text>{item.message}</Text>
      <TouchableOpacity onPress={() => deleteContact(item._id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Contact Panel</Text>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No contacts found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  errorText: { color: 'red', marginBottom: 10 },
  card: { backgroundColor: '#f2f2f2', padding: 15, marginBottom: 10, borderRadius: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
  deleteBtn: { marginTop: 10, backgroundColor: '#e74c3c', padding: 8, borderRadius: 5 },
  deleteText: { color: '#fff', textAlign: 'center' },
});

export default AdminContacts;
