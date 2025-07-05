// app/admin/contacts/ContactList.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { getToken } from '../../../utils/auth';
import ContactCard from './ContactCard';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://192.168.0.38:5002/api/contacts', {
        headers: {
          Authorization: `Bearer ${getToken}`,
        },
      });
      setContacts(res.data.contacts);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <ScrollView>
      {contacts.map((contact: any) => (
        <ContactCard key={contact._id} contact={contact} onRefresh={fetchContacts} />
      ))}
    </ScrollView>
  );
}
