import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CreateCharacterScreen({ onNextPress, onSelectAvatar, characterName, onNameChange }) {
  const [selectedId, setSelectedId] = useState(null);
  const [extraAvatars, setExtraAvatars] = useState([]);

  const defaultAvatars = [
    { id: 'default_1', source: require('./avatar.jpg') },
  ];

  const allAvatars = [...defaultAvatars, ...extraAvatars];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ขออนุญาต', 'เราต้องการสิทธิ์เข้าถึงรูปภาพเพื่อเปลี่ยนรูปตัวละครของคุณ');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3, // ✅ ลดจาก 0.8 → 0.3 ให้ไฟล์เล็กพอสำหรับ Firestore (จำกัด 1MB)
    });

    if (!result.canceled) {
      const selectedSource = { uri: result.assets[0].uri };
      const newId = Date.now().toString();
      const newAvatar = { id: newId, source: selectedSource };

      setExtraAvatars([...extraAvatars, newAvatar]);
      setSelectedId(newId);
      onSelectAvatar(selectedSource);
    }
  };

  const handleAvatarSelect = (item) => {
    setSelectedId(item.id);
    onSelectAvatar(item.source);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>CREATE CHARACTER</Text>
        <View style={styles.gridContainer}>
          {allAvatars.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.avatarWrapper, selectedId === item.id && styles.selectedWrapper]}
              onPress={() => handleAvatarSelect(item)}
            >
              <Image source={item.source} style={styles.avatarImage} />
              {selectedId === item.id && (
                <View style={styles.checkBadge}>
                  <FontAwesome name="check-circle" size={20} color="#f1c40f" />
                </View>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.avatarWrapper, styles.addButton]} onPress={pickImage}>
            <FontAwesome name="plus-circle" size={30} color="#7f8c8d" />
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.nameLabel}>NAME</Text>
        <TextInput
          style={styles.nameInput}
          value={characterName}
          onChangeText={onNameChange}
          placeholder="ENTER CHARACTER NAME..."
          placeholderTextColor="#7f8c8d"
          autoCapitalize="characters"
        />
      </View>

      <TouchableOpacity
        style={[styles.nextButton, (!selectedId || !characterName.trim()) && styles.disabledButton]}
        onPress={onNextPress}
        disabled={!selectedId || !characterName.trim()}
      >
        <Text style={styles.nextButtonText}>NEXT </Text>
        <FontAwesome name="arrow-right" size={16} color="#1a2e4d" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e4d', alignItems: 'center' },
  header: { marginTop: 40, width: '90%', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  headerUnderline: { height: 2, backgroundColor: '#fff', width: '100%', marginTop: 10 },
  card: {
    marginTop: 30, backgroundColor: '#dcdcdc', width: '90%',
    borderRadius: 20, padding: 20, alignItems: 'center',
    borderWidth: 2, borderColor: '#4a658a', elevation: 10,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a2e4d', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  avatarWrapper: {
    width: 85, height: 85, borderRadius: 12, borderWidth: 2,
    borderColor: '#fff', overflow: 'hidden', backgroundColor: '#fff', position: 'relative'
  },
  selectedWrapper: { borderColor: '#f1c40f', borderWidth: 4, transform: [{ scale: 1.05 }] },
  avatarImage: { width: '100%', height: '100%' },
  checkBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#fff', borderRadius: 10 },
  addButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#bdc3c7', borderStyle: 'dashed' },
  addButtonText: { fontSize: 10, color: '#7f8c8d', fontWeight: 'bold', marginTop: 4 },
  nameSection: { width: '90%', marginTop: 50, alignItems: 'center' },
  nameLabel: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  nameInput: {
    width: '100%', height: 65, backgroundColor: '#bdc3c7', borderRadius: 12,
    borderWidth: 2, borderColor: '#4a658a', paddingHorizontal: 20,
    fontSize: 20, color: '#000', fontWeight: 'bold', textAlign: 'center'
  },
  nextButton: {
    position: 'absolute', bottom: 50, right: 25, flexDirection: 'row',
    backgroundColor: '#dcdcdc', paddingVertical: 14, paddingHorizontal: 25,
    borderRadius: 12, alignItems: 'center', elevation: 8
  },
  disabledButton: { opacity: 0.5, backgroundColor: '#95a5a6' },
  nextButtonText: { color: '#1a2e4d', fontWeight: 'bold', fontSize: 18 }
});