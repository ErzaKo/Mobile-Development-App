// app/createEvent.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CreateEvent = () => {
  const [selectedCategory, setSelectedCategory] = useState('Music');
  const categories = ['Music', 'Tech', 'Art', 'Sports', 'Education'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a New Event</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Event Name *</Text>
          <TextInput style={styles.input} placeholder="Enter event name" />

          <Text style={styles.label}>Photo URL *</Text>
          <TextInput style={styles.input} placeholder="Enter image URL" />

          <Text style={styles.label}>Date *</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" />

          <Text style={styles.label}>Location *</Text>
          <TextInput style={styles.input} placeholder="Enter location" />

          <Text style={styles.label}>Price *</Text>
          <TextInput style={styles.input} placeholder="Enter price" keyboardType="numeric" />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              {categories.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Add Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
