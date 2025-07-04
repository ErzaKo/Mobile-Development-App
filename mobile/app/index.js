import React, { useState, useEffect, useRef,useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LogoImage from '../assets/images/logo.png';
import Navbar from '../components/Navbar';  // adjust path if needed
import { AuthContext } from './context/AuthContext'; // your context path


const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
const collapseAnim = useRef(new Animated.Value(0)).current;
const dropdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showDropdown ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showDropdown]);

  const toggleCollapse = () => {
    const toValue = isCollapsed ? 1 : 0;
    Animated.timing(collapseAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false, // can't use native driver for height animation
    }).start();
    setIsCollapsed(!isCollapsed);
  };

  const collapseHeight = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], // Adjust this to fit content
  });
  
  

  const categories = [
    { name: 'Music', icon: 'musical-notes' },
    { name: 'Tech', icon: 'hardware-chip' },
    { name: 'Art', icon: 'color-palette' },
    { name: 'Sports', icon: 'football' },
    { name: 'Education', icon: 'school' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Navbar user={user} />
  
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.cardGrid}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.categoryCard}
              onPress={() => router.push('/createEvent')}
            >
              <Ionicons name={cat.icon} size={28} color="#fff" />
              <Text style={styles.cardText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
  
        <TouchableOpacity onPress={toggleCollapse} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Why Choose Us? </Text>
          <Ionicons 
            name={isCollapsed ? 'chevron-down' : 'chevron-up'} 
            size={20} 
            color="#333" 
          />
        </TouchableOpacity>
  
        <Animated.View style={{ height: collapseHeight, overflow: 'hidden' }}>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="verified" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Trusted Vendors</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="security" size={24} color="#2196F3" />
              <Text style={styles.featureText}>Secure Payments</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="event-available" size={24} color="#FFC107" />
              <Text style={styles.featureText}>Wide Event Coverage</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
  
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Events App. All rights reserved.</Text>
      </View>
    </SafeAreaView>
  );
  
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
  paddingTop: 50,
  paddingBottom: 60, // increased to give room for Get Started
  paddingHorizontal: 20,
  backgroundColor: '#1a1a2e',
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
},

navbar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 15,
  backgroundColor: '#white',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
  zIndex: 100,
},

logoImage: {
  width: 100,
  height: 60,
},
menuWrapper: {
  width: 40,
  height: 40,
  backgroundColor: '#fff',
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
},
menuText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#1a1a2e',
},

dropdownContainer: {
  position: 'relative',
},

dropdown: {
  position: 'absolute',
  top: 50,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 15,
  zIndex: 10,
  width: 150,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 10,
},

dropdownItem: {
  paddingVertical: 10,
  fontSize: 16,
  color: '#333',
  borderBottomColor: '#eee',
  borderBottomWidth: 1,
},
  heroText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryCard: {
    backgroundColor: '#6c5ce7',
    width: width / 2 - 30,
    height: 100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: '600',
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#444',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
});
