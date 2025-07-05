import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

// Replace with your real backend API base URL
const API_BASE_URL = 'http://YOUR_IP_OR_DOMAIN:5002/api';

const CreateEvent = () => {
  const router = useRouter();

  // State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [eventName, setEventName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();

        // Adjust according to your API response shape
        const fetchedCategories = data.categories || data;

        setCategories(fetchedCategories);

        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0].id.toString()); // store id as string for Picker value
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to load categories.');
        console.error('Fetch categories error:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Start animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle event creation
  const handleCreateEvent = async () => {
    if (
      !eventName ||
      !photoUrl ||
      !date ||
      !location ||
      !price ||
      !selectedCategory
    ) {
      Alert.alert('Validation', 'Please fill all the fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventName,
          photo: photoUrl,
          date,
          location,
          price: parseFloat(price),
          categoryId: parseInt(selectedCategory, 10), // use the category id from backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      Alert.alert('Success', 'Event created successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>➕</Text>
            <Text style={styles.title}>Create Event</Text>
            <Text style={styles.subtitle}>Share your event with the community</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Event Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter event name"
                value={eventName}
                onChangeText={setEventName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Photo URL *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter image URL"
                value={photoUrl}
                onChangeText={setPhotoUrl}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter location"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.pickerWrapper}>
                {loadingCategories ? (
                  <Text style={{ padding: 12, color: '#666' }}>Loading categories...</Text>
                ) : (
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    style={styles.picker}
                  >
                    {categories.map((cat) => (
                      <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
                    ))}
                  </Picker>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleCreateEvent}
              activeOpacity={0.9}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Event'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#007aff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
