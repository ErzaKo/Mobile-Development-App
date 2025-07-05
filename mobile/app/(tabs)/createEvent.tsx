import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Animated, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../constants/api';
import * as ImagePicker from 'expo-image-picker';

const CreateEvent = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [eventName, setEventName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    startAnimations();
    fetchCategories();
  }, []);

  const startAnimations = () => {
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
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(data.categories || data || []);
      if (data.categories && data.categories.length > 0) {
        setSelectedCategory(data.categories[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventName.trim() || !date || !location.trim() || !price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      let photoPath = '';
      if (selectedImage) {
        // Upload image first
        const formData = new FormData();
        formData.append('photo', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'event-photo.jpg',
        });

        const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoPath = uploadData.filename;
        }
      }

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventName,
          date: date,
          location: location,
          price: parseFloat(price),
          categoryId: selectedCategory,
          photo: photoPath,
          description: description
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Event created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setEventName('');
              setSelectedImage(null);
              setDate('');
              setLocation('');
              setPrice('');
              setDescription('');
              if (categories.length > 0) {
                setSelectedCategory(categories[0].id);
              }
              // Navigate to events tab
              router.push('/(tabs)/events');
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
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
              transform: [{ translateY: slideAnim }]
            }
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
              <Text style={styles.inputLabel}>Event Photo</Text>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {selectedImage ? (
                  <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>📷</Text>
                    <Text style={styles.imagePlaceholderLabel}>Tap to select photo</Text>
                  </View>
                )}
              </TouchableOpacity>
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
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                  style={styles.picker}
                >
                  {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Enter event description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCreateEvent}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating...' : 'Create Event'}
              </Text>
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
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  imagePlaceholderLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  selectedImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
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
    alignItems: 'center',
    shadowColor: '#007aff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#8e8e93',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
}); 