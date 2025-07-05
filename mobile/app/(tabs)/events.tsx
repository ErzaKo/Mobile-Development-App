import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../constants/api';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface Event {
  id?: number;
  name?: string;
  date?: string;
  location?: string;
  price?: number;
  photo?: string;
  categoryId?: number;
}

interface Category {
  id?: number;
  name?: string;
}

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    date: '',
    location: '',
    price: '',
    categoryId: 1,
    photo: '',
    description: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchCategories();
    fetchEvents();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(data.categories || data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (categoryId?: number) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/events`;
      if (categoryId) {
        url = `${API_BASE_URL}/events/category/${categoryId}`;
      }
      
      console.log('Fetching events from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Events data:', data);
      setEvents(data.events || data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    fetchEvents(categoryId === selectedCategory ? undefined : categoryId);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditForm({
      name: event.name || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      location: event.location || '',
      price: event.price?.toString() || '',
      categoryId: event.categoryId || 1,
      photo: event.photo || '',
      description: event.description || ''
    });
    setSelectedImage(null);
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'Event deleted successfully');
                fetchEvents(selectedCategory || undefined);
              } else {
                Alert.alert('Error', 'Failed to delete event');
              }
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent?.id) return;

    if (!editForm.name.trim() || !editForm.date || !editForm.location.trim() || !editForm.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setEditLoading(true);
      
      let photoPath = editForm.photo;
      if (selectedImage) {
        // Upload new image
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

      const response = await fetch(`${API_BASE_URL}/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          date: editForm.date,
          location: editForm.location,
          price: parseFloat(editForm.price),
          categoryId: editForm.categoryId,
          photo: photoPath,
          description: editForm.description
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Event updated successfully');
        setShowEditModal(false);
        setEditingEvent(null);
        setSelectedImage(null);
        fetchEvents(selectedCategory || undefined);
      } else {
        Alert.alert('Error', 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update event');
    } finally {
      setEditLoading(false);
    }
  };

  const toggleDropdown = (eventId: number) => {
    setDropdownVisible(dropdownVisible === eventId ? null : eventId);
  };

  const closeDropdown = () => {
    setDropdownVisible(null);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${API_BASE_URL.replace('/api', '')}/uploads/${photoPath}`;
  };

  const getCategoryIcon = (categoryName?: string) => {
    const icons: { [key: string]: string } = {
      'Music': '🎵',
      'Tech': '💻',
      'Art': '🎨',
      'Sports': '⚽',
      'Movies': '🎬',
      'Business': '💼',
      'Games': '🎮',
    };
    return icons[categoryName || ''] || '🎪';
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSkeleton}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubtitle} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (error && events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchEvents()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>
            {selectedCategory 
              ? `${events.length} events in ${categories.find(c => c.id === selectedCategory)?.name}`
              : `${events.length} events available`
            }
          </Text>
        </View>

        {/* Category Filters */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedCategory && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryPress(0)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryButtonText,
                !selectedCategory && styles.categoryButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => handleCategoryPress(category.id!)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{getCategoryIcon(category.name)}</Text>
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {selectedCategory ? 'No events in this category' : 'No events yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory ? 'Try another category or check back later' : 'Check back later for new events'}
              </Text>
            </View>
          ) : (
            events.map((event: Event, index: number) => (
              <Animated.View
                key={index}
                style={[
                  styles.eventCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.eventCardTouchable}
                  onPress={() => router.push(`/eventDetails?eventId=${event.id}`)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={event.photo ? { uri: getImageUrl(event.photo) } : null}
                    style={styles.eventImage}
                    resizeMode="cover"
                    defaultSource={require('../../assets/images/logo.png')}
                  />
                  <View style={styles.eventInfo}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventName} numberOfLines={2}>
                        {event.name || 'Untitled Event'}
                      </Text>
                      <View style={styles.menuContainer}>
                        <TouchableOpacity
                          style={styles.menuButton}
                          onPress={() => toggleDropdown(event.id!)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.menuButtonText}>⋯</Text>
                        </TouchableOpacity>
                        
                        {/* Dropdown Menu */}
                        {dropdownVisible === event.id && (
                          <View style={styles.dropdownMenu}>
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => {
                                closeDropdown();
                                handleEditEvent(event);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.dropdownItemText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => {
                                closeDropdown();
                                handleDeleteEvent(event.id!);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.dropdownItemText, styles.deleteText]}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.eventMeta}>
                      <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        {event.location || 'No location'}
                      </Text>
                    </View>
                    <View style={styles.eventPrice}>
                      <Text style={styles.priceText}>${event.price || 'Free'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Event Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Event</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Event Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter event name"
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
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
                  ) : editForm.photo ? (
                    <Image source={{ uri: getImageUrl(editForm.photo) }} style={styles.selectedImage} />
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
                  value={editForm.date}
                  onChangeText={(text) => setEditForm({...editForm, date: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter location"
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  keyboardType="numeric"
                  value={editForm.price}
                  onChangeText={(text) => setEditForm({...editForm, price: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Category *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={editForm.categoryId}
                    onValueChange={(itemValue) => setEditForm({...editForm, categoryId: itemValue})}
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
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({...editForm, description: text})}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                style={[styles.updateButton, editLoading && styles.updateButtonDisabled]} 
                onPress={handleUpdateEvent}
                disabled={editLoading}
                activeOpacity={0.9}
              >
                <Text style={styles.updateButtonText}>
                  {editLoading ? 'Updating...' : 'Update Event'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#007aff',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e93',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingSkeleton: {
    backgroundColor: '#f2f2f7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skeletonImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e5ea',
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#e5e5ea',
    borderRadius: 4,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 16,
    backgroundColor: '#e5e5ea',
    borderRadius: 4,
    width: '50%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventCardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f2f2f7',
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventMeta: {
    marginBottom: 12,
  },
  eventDate: {
    fontSize: 14,
    color: '#007aff',
    fontWeight: '500',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#8e8e93',
  },
  eventPrice: {
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34c759',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 4,
    position: 'relative',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 25,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    minWidth: 70,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 8,
  },
  dropdownItemText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  deleteText: {
    color: '#ff3b30',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#8e8e93',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
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
    backgroundColor: '#f9f9f9',
    color: '#000000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
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
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  updateButton: {
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
  updateButtonDisabled: {
    backgroundColor: '#8e8e93',
    shadowOpacity: 0,
    elevation: 0,
  },
  updateButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
}); 