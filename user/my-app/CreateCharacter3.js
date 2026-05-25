import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function CreateCharacter3Screen({
  onEnterPress,
  onBackPress,
  selectedAvatar,
  characterName,
  db,
  username
}) {
  const [isLoading, setIsLoading] = useState(false);

  const getAvatarSource = (source) => {
    if (!source) return require('./avatar.jpg');
    if (typeof source === 'number') return source;
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string') return { uri: source };
    return require('./avatar.jpg');
  };

  // ✅ แปลง local URI → base64 โดยไม่ใช้ expo-file-system
  const convertToBase64 = (localUri) => {
    return new Promise((resolve, reject) => {
      fetch(localUri)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result); // "data:image/jpeg;base64,..."
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const handleFinalSubmit = async () => {
    if (!username) {
      Alert.alert("ผิดพลาด", "ไม่พบข้อมูลชื่อผู้ใช้ กรุณาล็อกอินใหม่อีกครั้ง");
      return;
    }

    setIsLoading(true);

    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) throw new Error("ไม่พบบัญชีผู้ใช้ในฐานข้อมูล");

      const userDocId = querySnapshot.docs[0].id;
      const userRef = doc(db, "users", userDocId);

      // ✅ แปลงรูปเป็น base64 แล้วเก็บลง Firestore
      let avatarData = null;

      if (selectedAvatar && typeof selectedAvatar === 'object' && selectedAvatar.uri) {
        avatarData = await convertToBase64(selectedAvatar.uri);
      } else if (typeof selectedAvatar === 'string' && selectedAvatar.startsWith('data:image')) {
        avatarData = selectedAvatar;
      } else if (typeof selectedAvatar === 'string' && !selectedAvatar.startsWith('http')) {
        avatarData = await convertToBase64(selectedAvatar);
      } else {
        avatarData = selectedAvatar ?? null;
      }

      await updateDoc(userRef, {
        characterName: characterName || "SMART",
        avatarSource: avatarData,
        hasCharacter: true,
        characterCreatedAt: new Date().toISOString()
      });

      Alert.alert("สำเร็จ", "ตัวละครของคุณพร้อมสำหรับการผจญภัยแล้ว!", [
        { text: "ตกลง", onPress: () => onEnterPress() }
      ]);

    } catch (error) {
      console.error("Firebase Update Error:", error);
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.mainCard}>
        <Text style={styles.cardTitle}>CONFIRM CHARACTER</Text>

        <View style={styles.imageContainer}>
          <Image
            source={getAvatarSource(selectedAvatar)}
            style={styles.characterImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.nameDisplayBox}>
          <Text style={styles.nameLabel}>
            NAME : {characterName ? characterName.toUpperCase() : 'SMART'}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.previousButton} onPress={onBackPress} disabled={isLoading}>
            <FontAwesome name="arrow-left" size={16} color="#1a2e4d" />
            <Text style={styles.previousButtonText}> BACK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.enterButton, { backgroundColor: isLoading ? '#7f8c8d' : '#F59E0B' }]}
            onPress={handleFinalSubmit}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.enterButtonText}>CONFIRM</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e4d', alignItems: 'center' },
  header: {
    marginTop: Platform.OS === 'android' ? 40 : 10,
    width: '95%', alignItems: 'center', marginBottom: 30,
  },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  headerUnderline: { height: 1.5, backgroundColor: '#fff', width: '100%', marginTop: 10 },
  mainCard: {
    width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 25, alignItems: 'center', marginTop: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 20, letterSpacing: 1 },
  imageContainer: {
    width: 220, height: 220, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#000', borderWidth: 2, borderColor: '#fff',
  },
  characterImage: { width: '100%', height: '100%' },
  nameDisplayBox: {
    backgroundColor: '#1a2e4d', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 10, marginTop: 25, marginBottom: 30,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  nameLabel: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  previousButton: {
    flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', width: '45%', justifyContent: 'center',
  },
  previousButtonText: { color: '#1a2e4d', fontWeight: 'bold', fontSize: 14 },
  enterButton: {
    paddingVertical: 14, borderRadius: 12,
    width: '45%', justifyContent: 'center', alignItems: 'center',
  },
  enterButtonText: { color: '#1a2e4d', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
});