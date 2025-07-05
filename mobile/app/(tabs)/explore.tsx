import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, Dimensions, TextInput, Image } from 'react-native';
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

export default function ExploreScreen() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
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
        // Remove the event from search results
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
      year: 'numeric',
    });
  };

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
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
  );

  const exploreFeatures = [
    {
      icon: '🎪',
      title: 'Discover Events',
      description: 'Find amazing events happening around you',
      action: 'Browse Events',
      onPress: () => router.push('/events'),
    },
    {
      icon: '📂',
      title: 'Browse Categories',
      description: 'Explore events by category and interest',
      action: 'View Categories',
      onPress: () => router.push('/categories'),
    },
    {
      icon: '➕',
      title: 'Create Event',
      description: 'Share your event with the community',
      action: 'Start Creating',
      onPress: () => router.push('/createEvent'),
    },
    {
      icon: '💬',
      title: 'Get Support',
      description: 'Contact us for help and questions',
      action: 'Contact Us',
      onPress: () => router.push('/(tabs)/contact'),
    },
  ];

  const quickStats = [
    { label: 'Events', value: '50+', color: '#007aff' },
    { label: 'Categories', value: '10+', color: '#34c759' },
    { label: 'Users', value: '1K+', color: '#ff9500' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Discover what's happening around you</Text>
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

        {/* Explore Content (only show when not searching) */}
        {!isSearching && (
          <>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                {quickStats.map((stat, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.statCard,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        borderLeftColor: stat.color,
                      }
                    ]}
                  >
                    <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.sectionTitle}>What you can do</Text>
              {exploreFeatures.map((feature, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.featureCardTouchable}
                    onPress={feature.onPress}
                    activeOpacity={0.9}
                  >
                    <View style={styles.featureIcon}>
                      <Text style={styles.iconText}>{feature.icon}</Text>
                    </View>
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <View style={styles.featureAction}>
                      <Text style={styles.actionText}>{feature.action}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {/* About Section */}
            <View style={styles.aboutContainer}>
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.aboutCard}>
                <Text style={styles.aboutTitle}>Event Discovery Platform</Text>
                <Text style={styles.aboutDescription}>
                  Connect with amazing events happening in your area. From concerts and workshops to meetups and conferences, 
                  find events that match your interests and schedule.
                </Text>
                <View style={styles.aboutFeatures}>
                  <View style={styles.aboutFeature}>
                    <Text style={styles.aboutFeatureIcon}>✨</Text>
                    <Text style={styles.aboutFeatureText}>Curated Events</Text>
                  </View>
                  <View style={styles.aboutFeature}>
                    <Text style={styles.aboutFeatureIcon}>🔒</Text>
                    <Text style={styles.aboutFeatureText}>Secure Platform</Text>
                  </View>
                  <View style={styles.aboutFeature}>
                    <Text style={styles.aboutFeatureIcon}>📱</Text>
                    <Text style={styles.aboutFeatureText}>Mobile First</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  searchContainer: {
    marginBottom: 20,
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
    marginBottom: 20,
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
  loadingContainer: {
    marginBottom: 20,
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
  statsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureCard: {
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
  featureCardTouchable: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  featureAction: {
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  aboutContainer: {
    marginBottom: 32,
  },
  aboutCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 22,
    marginBottom: 16,
  },
  aboutFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aboutFeature: {
    alignItems: 'center',
  },
  aboutFeatureIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  aboutFeatureText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
  },
});
