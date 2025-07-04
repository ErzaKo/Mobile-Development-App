import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LogoImage from '../assets/images/logo.png';
import { AuthContext } from '../app/context/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);

  const dropdownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showDropdown ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showDropdown]);

  return (
    <View style={styles.navbar}>
      <Image source={LogoImage} style={styles.logoImage} resizeMode="contain" />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
            <View style={styles.menuWrapper}>
              <Ionicons name="menu" size={24} color="#1a1a2e" />
            </View>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.dropdown,
              {
                opacity: dropdownAnim,
                transform: [
                  {
                    translateY: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
                pointerEvents: showDropdown ? 'auto' : 'none',
              },
            ]}
          >
            <TouchableOpacity onPress={() => { setShowDropdown(false); router.push('/contact'); }}>
              <Text style={styles.dropdownItem}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowDropdown(false); router.push('/news'); }}>
              <Text style={styles.dropdownItem}>News</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowDropdown(false); router.push('/login'); }}>
              <Text style={styles.dropdownItem}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowDropdown(false); router.push('/signup'); }}>
              <Text style={styles.dropdownItem}>Signup</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ✅ Only one profile icon block */}
        {user && (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={() => setShowProfileInfo(!showProfileInfo)}
              style={styles.profileIcon}
            >
              <Ionicons name="person-circle-outline" size={28} color="#1a1a2e" />
            </TouchableOpacity>

            {showProfileInfo && (
              <View style={styles.profileInfoBox}>
                <Text style={styles.profileText}>Username: {user.name}</Text>
                <Text style={styles.profileText}>Email: {user.email}</Text>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={() => {
                    setShowProfileInfo(false);
                    logout();
                    router.replace('/login');
                  }}
                >
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
    overflow: 'visible',
  },
  menuWrapper: {
    padding: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 5,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 150,
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  profileIcon: {
    marginLeft: 12,
  },
  profileInfoBox: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 15,
    minWidth: 200,
    maxWidth: 250,
    flexDirection: 'column',
  },
  profileText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Navbar;
