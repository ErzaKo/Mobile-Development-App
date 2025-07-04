import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext'; // adjust path if needed
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';


export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, loading } = useContext(AuthContext);
  const router = useRouter();


  const handleSignup = async () => {
    try {
      await signup(username, email, password);
      router.replace('/'); 
      Alert.alert('Success', 'Account created and logged in');
      // navigate to another screen if needed
    } catch (err) {
      Alert.alert('Signup failed', err.message || 'Something went wrong');
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account 👤</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
          <TextInput
  placeholder="Username"
  placeholderTextColor="#888"
  style={styles.input}
  value={username}
  onChangeText={setUsername}
/>

<TextInput
  placeholder="Email"
  keyboardType="email-address"
  autoCapitalize="none"
  placeholderTextColor="#888"
  style={styles.input}
  value={email}
  onChangeText={setEmail}
/>

<TextInput
  placeholder="Password"
  secureTextEntry
  placeholderTextColor="#888"
  style={styles.input}
  value={password}
  onChangeText={setPassword}
/>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
  Already have an account?{' '}
  <Text style={styles.link} onPress={() => router.push('/login')}>
    Login
  </Text>
</Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 13,
  },
  link: {
    color: '#007AFF',
    fontWeight: '500',
  },
});
