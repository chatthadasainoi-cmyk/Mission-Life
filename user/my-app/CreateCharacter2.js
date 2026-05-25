import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function CreateCharacter2Screen({ onNextPress, onBackPress, characterImage, characterName }) {

  const renderAvatar = () => {
    if (!characterImage) return require('./avatar.jpg');
    if (typeof characterImage === 'number') return characterImage;
    if (typeof characterImage === 'object' && characterImage.uri) return { uri: characterImage.uri };
    if (typeof characterImage === 'string' && characterImage.startsWith('data:image')) return { uri: characterImage }; // ✅ base64
    if (typeof characterImage === 'string') return { uri: characterImage };
    return require('./avatar.jpg');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>CREATE CHARACTER</Text>
        <View style={styles.imageContainer}>
          <Image source={renderAvatar()} style={styles.characterImage} resizeMode="cover" />
        </View>
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.nameLabel}>NAME</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.nameInput}>
            {characterName ? characterName.toUpperCase() : 'NO NAME'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.navButton} onPress={onBackPress}>
          <FontAwesome name="arrow-left" size={18} color="#1a2e4d" />
          <Text style={styles.navButtonText}> PREVIOUS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={onNextPress}>
          <Text style={styles.navButtonText}>NEXT </Text>
          <FontAwesome name="arrow-right" size={18} color="#1a2e4d" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e4d', alignItems: 'center' },
  header: { marginTop: 20, width: '95%', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  headerUnderline: { height: 1.5, backgroundColor: '#fff', width: '100%', marginTop: 10 },
  card: {
    marginTop: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', width: '90%',
    borderRadius: 20, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  imageContainer: {
    width: 220, height: 220, borderRadius: 25, overflow: 'hidden',
    backgroundColor: '#1E2B48', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  characterImage: { width: '100%', height: '100%' },
  nameSection: { width: '90%', marginTop: 60, alignItems: 'center' },
  nameLabel: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  inputWrapper: {
    width: '100%', height: 60, backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12, borderWidth: 2, borderColor: '#bdc3c7',
    justifyContent: 'center', paddingHorizontal: 20,
  },
  nameInput: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 40 },
  navButton: {
    flexDirection: 'row', backgroundColor: '#E0E0E0', paddingVertical: 14,
    paddingHorizontal: 20, borderRadius: 12, alignItems: 'center',
    width: '47%', justifyContent: 'center', elevation: 3
  },
  navButtonText: { color: '#1a2e4d', fontWeight: 'bold', fontSize: 16 }
});