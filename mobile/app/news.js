import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function News() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Latest News</Text>
      <Text style={styles.text}>🎉 Our app now supports real-time events!</Text>
      <Text style={styles.text}>📅 Check back often for new updates and features.</Text>
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
