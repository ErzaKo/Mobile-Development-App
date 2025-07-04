// mobile/components/EventCard.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const EventCard = ({ event }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: event.photo }} style={styles.image} />
      <Text style={styles.name}>{event.name}</Text>
      <Text>Date: {new Date(event.date).toLocaleDateString()}</Text>
      <Text>Location: {event.location}</Text>
      <Text>Price: ${event.price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 3, // shadow for android
    shadowColor: '#000', // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
});

export default EventCard;
