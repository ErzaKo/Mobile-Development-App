import React from 'react';   
import { View, Text, StyleSheet, Modal, Button } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const EditContactModal: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Edit Contact</Text>

          {/* Këtu mund të vendosësh formën për editim */}

          <Button title="Mbyll" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default EditContactModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
  },
});
