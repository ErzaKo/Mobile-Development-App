import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

export default function NewsForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel 
}) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    imageUrl: initialData.imageUrl || '',
    date: initialData.date || new Date().toISOString().split('T')[0]
  });

  return (
    <View style={styles.form}>
      <TextInput
        placeholder="Title"
        value={form.title}
        onChangeText={text => setForm({...form, title: text})}
        style={styles.input}
      />
      <TextInput
        placeholder="Content"
        multiline
        value={form.content}
        onChangeText={text => setForm({...form, content: text})}
        style={[styles.input, { height: 100 }]}
      />
      <TextInput
        placeholder="Image URL"
        value={form.imageUrl}
        onChangeText={text => setForm({...form, imageUrl: text})}
        style={styles.input}
      />
      <View style={styles.buttons}>
        <Button 
          title={initialData.id ? "Update" : "Create"} 
          onPress={() => onSubmit(form)} 
        />
        {initialData.id && <Button title="Cancel" onPress={onCancel} />}
      </View>
    </View>
  );
}

const styles = {
  form: { padding: 15, backgroundColor: '#f9f9f9' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' }
};