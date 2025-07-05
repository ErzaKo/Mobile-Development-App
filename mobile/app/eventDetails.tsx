import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_BASE_URL } from '../constants/api';

const { width } = Dimensions.get('window');

interface Event {
  id?: number;
  name?: string;
  date?: string;
  location?: string;
  price?: number;
  photo?: string;
  description?: string;
  categoryId?: number;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const ticketTypes: TicketType[] = [
    {
      id: 'normal',
      name: 'Normal',
      price: event?.price || 0,
      description: 'Standard entry with general seating',
      color: '#007aff',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: (event?.price || 0) * 1.5,
      description: 'Premium seating with better view',
      color: '#34c759',
    },
    {
      id: 'vip',
      name: 'VIP',
      price: (event?.price || 0) * 2.5,
      description: 'VIP experience with exclusive access',
      color: '#ff9500',
    },
  ];

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await response.json();
      setEvent(data.event || data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${API_BASE_URL.replace('/api', '')}/uploads/${photoPath}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBookTicket = () => {
    if (!selectedTicket) {
      Alert.alert('Select Ticket', 'Please select a ticket type to continue');
      return;
    }

    const ticket = ticketTypes.find(t => t.id === selectedTicket);
    Alert.alert(
      'Book Ticket',
      `Confirm booking for ${ticket?.name} ticket at $${ticket?.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            Alert.alert('Success', 'Ticket booked successfully!');
            // Here you would typically integrate with a payment system
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Event Image */}
      <View style={styles.imageContainer}>
        <Image
          source={event.photo ? { uri: getImageUrl(event.photo) } : require('../assets/images/logo.png')}
          style={styles.eventImage}
          resizeMode="cover"
        />
      </View>

      {/* Event Details */}
      <View style={styles.content}>
        <Text style={styles.eventName}>{event.name}</Text>
        
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{formatDate(event.date)}</Text>
          <Text style={styles.timeText}>{formatTime(event.date)}</Text>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>📍 Location</Text>
          <Text style={styles.locationText}>{event.location}</Text>
        </View>

        {event.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>About this event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        {/* Ticket Selection */}
        <View style={styles.ticketsContainer}>
          <Text style={styles.ticketsTitle}>Select Your Ticket</Text>
          
          {ticketTypes.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={[
                styles.ticketCard,
                selectedTicket === ticket.id && styles.selectedTicket,
                { borderColor: ticket.color }
              ]}
              onPress={() => setSelectedTicket(ticket.id)}
              activeOpacity={0.8}
            >
              <View style={styles.ticketHeader}>
                <Text style={[styles.ticketName, { color: ticket.color }]}>
                  {ticket.name}
                </Text>
                <Text style={styles.ticketPrice}>${ticket.price}</Text>
              </View>
              <Text style={styles.ticketDescription}>{ticket.description}</Text>
              {selectedTicket === ticket.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: ticket.color }]}>
                  <Text style={styles.selectedText}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[styles.bookButton, !selectedTicket && styles.bookButtonDisabled]}
          onPress={handleBookTicket}
          disabled={!selectedTicket}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>
            {selectedTicket ? 'Book Ticket Now' : 'Select a ticket to book'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  eventName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    lineHeight: 36,
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007aff',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  locationContainer: {
    marginBottom: 24,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#8e8e93',
    lineHeight: 24,
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#8e8e93',
    lineHeight: 24,
  },
  ticketsContainer: {
    marginBottom: 32,
  },
  ticketsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e5ea',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTicket: {
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketName: {
    fontSize: 18,
    fontWeight: '700',
  },
  ticketPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookButton: {
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
  bookButtonDisabled: {
    backgroundColor: '#e5e5ea',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
}); 