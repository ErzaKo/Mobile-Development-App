import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Button, Alert } from 'react-native';
import NewsList from './news/NewsList';
import NewsForm from './news/NewsForm';
import newsService from './news/NewsService';

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getAll();
      setNews(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNews(); }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editing?.id) {
        await newsService.update(editing.id, formData);
        Alert.alert('Success', 'News updated successfully');
      } else {
        await newsService.create(formData);
        Alert.alert('Success', 'News created successfully');
      }
      setEditing(null);
      await loadNews();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await newsService.delete(id);
      await loadNews();
      Alert.alert('Success', 'News deleted successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        {editing ? 'Edit News' : 'News Management'}
      </Text>

      {editing ? (
        <NewsForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <Button 
            title="Add News" 
            onPress={() => setEditing({})} 
          />
          <NewsList
            news={news}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        </>
      )}
    </View>
  );
}