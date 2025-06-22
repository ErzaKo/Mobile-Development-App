import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Contact() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.text}>
        You can reach us at: support@eventsapp.com
      </Text>
      <Text style={styles.text}>
        Phone: +123 456 789
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  title: {
    fontSize: 24, marginBottom: 10,
  },
  text: {
    fontSize: 16, textAlign: 'center', marginTop: 5,
  },
});
