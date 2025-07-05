// mobile/components/ContactForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const ContactForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      await axios.post('http://192.168.0.38:5002/api/contacts', {
        fullName,
        email,
        subject,
        message,
      });

      Alert.alert('Sukses!', 'Mesazhi u dërgua me sukses');
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Gabim', 'Nuk u dërgua mesazhi. Provo përsëri.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Emri i Plotë</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Emri" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />

      <Text style={styles.label}>Subjekti</Text>
      <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Subjekti" />

      <Text style={styles.label}>Mesazhi</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={message}
        onChangeText={setMessage}
        placeholder="Shkruaj mesazhin..."
        multiline
      />

      <Button title="Dërgo" onPress={handleSubmit} />
    </View>
  );
};

export default ContactForm;

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
