import { FlatList } from 'react-native';
import NewsItem from './NewsItem';

export default function NewsList({ news, onEdit, onDelete }) {
  return (
    <FlatList
      data={news}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <NewsItem 
          item={item} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      )}
    />
  );
}