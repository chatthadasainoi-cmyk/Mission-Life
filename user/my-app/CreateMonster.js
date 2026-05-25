import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// ✅ นำเข้า Firebase
import { db } from './App';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const PRESET_MONSTERS = [
  { id: 'preset_1', image: require('./avatar.jpg') },
  { id: 'preset_4', image: { uri: 'https://cdn-icons-png.flaticon.com/512/1033/1033955.png' } },
  { id: 'preset_5', image: { uri: 'https://cdn-icons-png.flaticon.com/512/1033/1033979.png' } },
  { id: 'preset_6', image: { uri: 'https://cdn-icons-png.flaticon.com/512/1033/1033991.png' } },
];

export default function CreateMonster({ navigation, route, loggedInUser, characterName, selectedAvatar }) {
  const params = route?.params || {};
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [monsterName, setMonsterName] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ แสดงรูป Header (แก้ไขให้รองรับทุกรูปแบบ)
  const getHeaderAvatar = () => {
    if (!selectedAvatar) return { uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' };
    if (typeof selectedAvatar === 'number') return selectedAvatar;
    return typeof selectedAvatar === 'string' ? { uri: selectedAvatar } : { uri: selectedAvatar.uri };
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตการเข้าถึงคลังภาพในตั้งค่า');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3, // ✅ ปรับคุณภาพให้พอดี ไม่ใหญ่เกินไป
    });
    if (!result.canceled) {
      setCustomImage(result.assets[0].uri);
      setSelectedMonster(null);
    }
  };

  const selectedSource = customImage ? { uri: customImage } : (selectedMonster ? selectedMonster.image : null);
  const canProceed = selectedSource && monsterName.trim().length > 0 && !isSaving;

  // ✅ แปลงรูปเป็น Base64 แบบเสถียร
  const convertImageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject("Failed to convert image");
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return uri;
    }
  };

  const handleSaveAndEnter = async () => {
    if (!canProceed || isSaving) return;

    const finalXP = params.xp || 100;
    if (finalXP <= 0) {
      Alert.alert("ผิดพลาด", "ข้อมูลเป้าหมายไม่ถูกต้อง กรุณาย้อนกลับไปตั้งค่าใหม่");
      return;
    }

    setIsSaving(true);

    try {
      let finalMonsterImageUrl = "";

      if (customImage) {
        finalMonsterImageUrl = await convertImageToBase64(customImage);
      } else if (selectedMonster) {
        // ดึง URI จาก Preset
        finalMonsterImageUrl = typeof selectedMonster.image === 'number'
          ? Image.resolveAssetSource(selectedMonster.image).uri
          : selectedMonster.image.uri;
      }

      const finalMissionData = {
        username: loggedInUser || 'unknown',
        characterName: characterName || 'นักล่าภารกิจ',
        userAvatar: typeof selectedAvatar === 'string' ? selectedAvatar : (selectedAvatar?.uri || ''),
        missionName: params.missionName || 'ภารกิจใหม่',
        category: params.category || 'ทั่วไป',
        goalType: params.goalType || 'normal',

        // ⚔️ ระบบ HP & Progress
        xp: finalXP,
        currentDamage: 0,
        totalCount: params.totalCount || 1,
        currentProgress: 0,

        unit: params.unit || 'ครั้ง',
        duration: params.duration || 7,
        difficulty: params.difficulty || 'ง่าย',
        dailyQuota: params.dailyQuota || 1,

        monsterName: monsterName.trim(),
        monsterImage: finalMonsterImageUrl,
        status: 'active',
        isCompleted: false,
        lastUpdated: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "missions"), finalMissionData);

      Alert.alert("สำเร็จ!", "บอสของคุณถูกสร้างแล้ว เตรียมตัวต่อสู้!", [
        { text: "เริ่มเลย", onPress: () => navigation.navigate('Quest', { refresh: true }) }
      ]);

    } catch (error) {
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกได้: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.headerAvatar}>
            <Image source={getHeaderAvatar()} style={styles.avatarImage} />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <Text style={styles.headerSubtitle}>สวัสดีคุณ {characterName || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
           <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {['Home', 'Quest', 'Trophy', 'History'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, tab === 'Quest' && styles.tabActive]}
            onPress={() => navigation.navigate(tab)}
          >
            <Text style={tab === 'Quest' ? styles.tabTextActive : styles.tabText}>{tab.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.cardHeaderText}>CREATE YOUR MONSTER</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.sectionTitle}>เลือกรูปมอนสเตอร์หรือกิจกรรม</Text>

            {/* ✅ แก้ไข Grid ให้เรียง 3 คอลัมน์สวยงาม */}
            <View style={styles.grid}>
              <TouchableOpacity
                style={[styles.monsterSlot, customImage && styles.monsterSlotActive, styles.addSlot]}
                onPress={handlePickImage}
                disabled={isSaving}
              >
                {customImage ? (
                  <Image source={{ uri: customImage }} style={styles.monsterImage} />
                ) : (
                  <View style={styles.addIconBox}>
                    <Text style={styles.previewLabel}>เพิ่มรูป</Text>
                    <Text style={styles.addIconRing}>+</Text>
                  </View>
                )}
                {customImage && <Text style={styles.selectedCheck}>✓</Text>}
              </TouchableOpacity>

              {PRESET_MONSTERS.map((m) => {
                const isSelected = selectedMonster?.id === m.id && !customImage;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.monsterSlot, isSelected && styles.monsterSlotActive]}
                    onPress={() => { setSelectedMonster(m); setCustomImage(null); }}
                    disabled={isSaving}
                  >
                    <Image source={m.image} style={styles.monsterImage} resizeMode="cover" />
                    {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedSource && (
              <TouchableOpacity style={styles.previewRow} onPress={() => setPreviewVisible(true)}>
                <Image source={selectedSource} style={styles.previewThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>บอสที่เลือกไว้</Text>
                  <Text style={styles.previewLabel}>แตะเพื่อขยายดูความน่าเกรงขาม</Text>
                </View>
              </TouchableOpacity>
            )}

            <Text style={styles.inputLabel}>ชื่อมอนสเตอร์ / ชื่อบอส</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น ยักษ์ขี้เกียจ, บอสโซเชียล..."
              placeholderTextColor="#5A6A83"
              value={monsterName}
              onChangeText={setMonsterName}
              editable={!isSaving}
            />

            <TouchableOpacity
              style={[styles.enterBtn, !canProceed && styles.enterBtnDisabled]}
              onPress={handleSaveAndEnter}
              disabled={!canProceed}
            >
              {isSaving ? (
                <ActivityIndicator color="#1A2A47" />
              ) : (
                <Text style={styles.enterBtnText}>ตกลงสร้างเควส</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal Preview */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.previewModalOverlay}
          activeOpacity={1}
          onPress={() => setPreviewVisible(false)}
        >
          <View style={styles.previewModalBox}>
            <Image source={selectedSource} style={styles.previewModalImage} resizeMode="contain" />
            <View style={styles.previewNameBadge}>
              <Text style={styles.previewNameText}>{monsterName || 'BOSS'}</Text>
            </View>
            <TouchableOpacity style={styles.previewCloseBtn} onPress={() => setPreviewVisible(false)}>
              <Text style={styles.previewCloseBtnText}>ย้อนกลับ</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ Styles เดิมของคุณ (ปรับปรุงเล็กน้อยเพื่อความเป๊ะ)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 70 },
  headerProfile: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 45, height: 45, borderRadius: 10, marginRight: 12, borderWidth: 1.5, borderColor: '#fff', backgroundColor: '#3A4A63', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  headerSubtitle: { color: '#AAB4C3', fontSize: 11 },
  settingsIcon: { color: 'white', fontSize: 24 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3A4A63', height: 45, marginTop: 5 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#F59E0B' },
  tabTextActive: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 20 },
  card: { backgroundColor: '#253552', borderRadius: 18, borderWidth: 1, borderColor: '#3A4A63', overflow: 'hidden', marginBottom: 30 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E2B48', paddingHorizontal: 12, paddingVertical: 14 },
  backBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#3A4A63', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: 'white', fontSize: 18 },
  cardHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  cardBody: { padding: 20 },
  sectionTitle: { color: 'white', fontSize: 16, marginBottom: 15, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  monsterSlot: { width: '30%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#3A4A63', backgroundColor: '#1E2B48' },
  monsterSlotActive: { borderColor: '#F59E0B', borderWidth: 3 },
  monsterImage: { width: '100%', height: '100%' },
  selectedCheck: { position: 'absolute', top: 5, right: 8, color: '#F59E0B', fontWeight: 'bold', fontSize: 18 },
  addSlot: { alignItems: 'center', justifyContent: 'center' },
  addIconBox: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  addIconRing: { color: '#AAB4C3', fontSize: 35 },
  previewRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2B48', borderRadius: 12, borderWidth: 1, borderColor: '#3A4A63', padding: 12, marginBottom: 20, gap: 15 },
  previewThumb: { width: 50, height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#3A4A63' },
  previewLabel: { color: '#AAB4C3', fontSize: 12 },
  inputLabel: { color: 'white', fontSize: 14, marginBottom: 10, fontWeight: '600' },
  input: { backgroundColor: '#1E2B48', borderRadius: 12, borderWidth: 1.5, borderColor: '#3A4A63', color: 'white', fontSize: 15, paddingHorizontal: 15, paddingVertical: 14, marginBottom: 25 },
  enterBtn: { backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', width: '100%' },
  enterBtnDisabled: { opacity: 0.4, backgroundColor: '#3A4A63' },
  enterBtnText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  previewModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  previewModalBox: { width: '90%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#1E2B48', borderWidth: 1, borderColor: '#3A4A63' },
  previewModalImage: { width: '100%', height: 350, backgroundColor: '#000' },
  previewNameBadge: { backgroundColor: '#1E2B48', padding: 20, alignItems: 'center' },
  previewNameText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 22 },
  previewCloseBtn: { backgroundColor: '#F59E0B', padding: 16, alignItems: 'center' },
  previewCloseBtnText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 15 },
});