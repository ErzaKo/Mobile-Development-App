import { View, Text, Image, Button, Alert } from 'react-native';

export default function NewsItem({ item, onEdit, onDelete }) {
  return (
    <View style={styles.newsItem}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text>{item.content.substring(0, 100)}...</Text>
      
      <View style={styles.actions}>
        <Button title="Edit" onPress={() => onEdit(item)} />
        <Button 
          title="Delete" 
          color="red"
          onPress={() => 
            Alert.alert(
              'Confirm',
              'Delete this news item?',
              [
                { text: 'Cancel' },
                { text: 'Delete', onPress: () => onDelete(item.id) }
              ]
            )
          }
        />
      </View>
    </View>
  );
}

const styles = {
  newsItem: { marginBottom: 20, padding: 10, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold' },
  date: { color: '#666', fontSize: 12 },
  image: { width: '100%', height: 200, marginBottom: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
};