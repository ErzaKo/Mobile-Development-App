import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import ContactForm from '../components/ContactForm'; // kontrollo që rruga është e saktë

export default function Contact() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Na Kontaktoni</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.text}>You can reach us at: support@eventsapp.com</Text>
        <Text style={styles.text}>Phone: +123 456 789</Text>
      </View>

      <ContactForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
});