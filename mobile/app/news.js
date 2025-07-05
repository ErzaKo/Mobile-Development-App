import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Alert, StyleSheet, Button, TextInput, TouchableOpacity, Text, Image } from 'react-native';

const API_URL = 'http://192.168.0.38:5002/api/news'; // Verify this URL

const NewsScreen = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      // First check if response is OK
      if (!response.ok) {
        const errorData = await response.text(); // Get response as text first
        throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
      }

      // Then try to parse as JSON
      const data = await response.json();
      setNewsList(data);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to load news. Please check your API URL and connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
      }

      await fetchNews();
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
      setError(null);
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Error', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
      }

      await fetchNews();
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading news...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>News Management</Text>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
        />
        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="Content"
          multiline
          value={formData.content}
          onChangeText={(text) => setFormData({...formData, content: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={formData.imageUrl}
          onChangeText={(text) => setFormData({...formData, imageUrl: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={formData.date}
          onChangeText={(text) => setFormData({...formData, date: text})}
        />

        <View style={styles.formButtons}>
          <Button
            title={editingId ? "Update News" : "Create News"}
            onPress={handleSubmit}
          />
          {editingId && (
            <Button
              title="Cancel"
              onPress={() => {
                setEditingId(null);
                setFormData({
                  title: '',
                  content: '',
                  imageUrl: '',
                  date: new Date().toISOString().split('T')[0]
                });
              }}
            />
          )}
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* News List */}
      <Text style={styles.sectionTitle}>News List</Text>
      <FlatList
        data={newsList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.newsItem}>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.newsImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            <Text style={styles.newsContent}>
              {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
            </Text>
            <View style={styles.newsActions}>
              <Button
                title="Edit"
                onPress={() => {
                  setEditingId(item.id);
                  setFormData({
                    title: item.title,
                    content: item.content,
                    imageUrl: item.imageUrl || '',
                    date: item.date.split('T')[0]
                  });
                }}
              />
              <Button
                title="Delete"
                color="red"
                onPress={() => {
                  Alert.alert(
                    'Delete News',
                    'Are you sure you want to delete this news item?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', onPress: () => handleDelete(item.id) }
                    ]
                  );
                }}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  contentInput: {
    height: 100,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  newsItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 10,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  newsContent: {
    fontSize: 14,
    marginBottom: 15,
  },
  newsActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default NewsScreen;