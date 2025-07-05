import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from './context/AuthContext';
import { useRouter } from 'expo-router';

export default function UsersPage() {
  const { token, user } = useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/'); // not authorized
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch('http://192.168.1.150:5002/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log('Fetched users:', data); // 👈 Add this
        setUsers(data.results); // Adjust based on your API response shape
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, user]);

  const handleDeleteUser = async (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`http://192.168.1.150:5002/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (res.ok) {
                setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
              } else {
                console.error('Failed to delete user');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registered Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userText}>Name: {item.name}</Text>
            <Text style={styles.userText}>Email: {item.email}</Text>
            <Text style={styles.userText}>Role: {item.role}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  userText: {
    fontSize: 14,
    color: '#444',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff3b30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
