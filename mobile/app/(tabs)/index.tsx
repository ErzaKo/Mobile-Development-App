import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Animated, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

interface Event {
  id?: number;
  name?: string;
  date?: string;
  location?: string;
  price?: number;
  photo?: string;
  description?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchLatestEvents();
    startAnimations();
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

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

  const fetchLatestEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();
      const events = data.events || data || [];
      const latest = events.slice(0, 3);
      setLatestEvents(latest);
    } catch (error) {
      console.error('Error fetching latest events:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      setIsSearching(true);
      
      const searchUrl = `${API_BASE_URL}/events/search?query=${encodeURIComponent(searchQuery.trim())}`;
      console.log('Searching URL:', searchUrl);
      
      const response = await fetch(searchUrl);
      console.log('Search response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search response data:', data);
      
      setSearchResults(data.events || data || []);
    } catch (error) {
      console.error('Error searching events:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const toggleDropdown = (eventId: number) => {
    setDropdownVisible(dropdownVisible === eventId ? null : eventId);
  };

  const closeDropdown = () => {
    setDropdownVisible(null);
  };

  const handleEditEvent = (event: Event) => {
    // Navigate to events page for editing
    router.push('/events');
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the event from both latest events and search results
        setLatestEvents(prev => prev.filter(event => event.id !== eventId));
        setSearchResults(prev => prev.filter(event => event.id !== eventId));
        closeDropdown();
      } else {
        console.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    // Construct URL for photos stored in uploads folder
    return `${API_BASE_URL.replace('/api', '')}/uploads/${photoPath}`;
  };

  const renderEventCard = (event: Event, index: number) => (
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
        onPress={() => router.push('/events')}
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
            <Text style={styles.eventName} numberOfLines={1}>
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
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Discover events</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {isSearching && (
        <View style={styles.searchResultsContainer}>
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsTitle}>
              {searchLoading ? 'Searching...' : `Found ${searchResults.length} results`}
            </Text>
            {searchResults.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Text style={styles.clearAllText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {searchLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSkeleton}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonSubtitle} />
                </View>
              </View>
            </View>
          ) : searchResults.length > 0 ? (
            searchResults.map((event, index) => renderEventCard(event, index))
          ) : searchQuery.trim() && !searchLoading ? (
            <View style={styles.emptySearchState}>
              <Text style={styles.emptySearchEmoji}>🔍</Text>
              <Text style={styles.emptySearchTitle}>No events found</Text>
              <Text style={styles.emptySearchSubtitle}>Try different keywords or browse all events</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Latest Events (only show when not searching) */}
      {!isSearching && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity onPress={() => router.push('/events')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSkeleton}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonSubtitle} />
                </View>
              </View>
            </View>
          ) : latestEvents.length > 0 ? (
            latestEvents.map((event, index) => renderEventCard(event, index))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎪</Text>
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptySubtitle}>Check back later for new events</Text>
            </View>
          )}
        </View>
      )}

      {/* Quick Actions (only show when not searching) */}
      {!isSearching && (
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/events')}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🌐</Text>
              </View>
              <Text style={styles.actionText}>Browse</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/categories')}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📂</Text>
              </View>
              <Text style={styles.actionText}>Categories</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/createEvent')}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>➕</Text>
              </View>
              <Text style={styles.actionText}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/contact')}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>💬</Text>
              </View>
              <Text style={styles.actionText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stats (only show when not searching) */}
      {!isSearching && (
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{latestEvents.length}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Secure</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#8e8e93',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '600',
  },
  searchResultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  clearAllText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },
  emptySearchState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptySearchTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySearchSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
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
    marginBottom: 8,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
  quickActions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 60) / 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e5ea',
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 4,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    padding: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  deleteText: {
    color: '#ff3b30',
  },
});
