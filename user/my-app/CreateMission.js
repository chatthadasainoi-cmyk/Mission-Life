import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = ['สุขภาพ', 'การเรียน', 'การเงิน', 'อื่นๆ'];
const TOTAL_STEPS = 3;

export default function CreateMission({
  navigation,
  route,
  characterName,
  selectedAvatar
}) {
  const [step, setStep] = useState(1);
  const [missionName, setMissionName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');

  useEffect(() => {
    if (route.params?.missionName) {
      setMissionName(route.params.missionName);
    }
  }, [route.params]);

  const handleNext = () => {
    const finalCategory = selectedCategory === 'อื่นๆ' ? otherCategory.trim() : selectedCategory;
    navigation.navigate('CreateMission2', {
      missionName: missionName.trim(),
      category: finalCategory,
    });
  };

  const canProceed =
    missionName.trim().length > 0 &&
    selectedCategory !== '' &&
    (selectedCategory === 'อื่นๆ' ? otherCategory.trim().length > 0 : true);

  // ✅ แก้ไขให้รองรับ base64, http URL, local
  const getAvatarSource = (source) => {
    if (!source) return require('./assets/icon.png');
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string' && source.startsWith('http')) return { uri: source, cache: 'reload' };
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return require('./assets/icon.png');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatarWrap}>
            <Image
              source={getAvatarSource(selectedAvatar)}
              style={styles.headerAvatar}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <Text style={styles.headerSubtitle}>สวัสดีคุณ {characterName || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        {['HOME', 'QUEST', 'TROPHY', 'HISTORY'].map((tab) => {
          const isActive = tab === 'QUEST';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && styles.tabActive]}
              onPress={() => {
                if (tab === 'HOME') navigation.navigate('Home');
                else if (tab === 'QUEST') navigation.navigate('Quest');
                else if (tab === 'TROPHY') navigation.navigate('Trophy');
                else if (tab === 'HISTORY') navigation.navigate('History');
              }}
            >
              <Text style={isActive ? styles.tabTextActive : styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* CARD HEADER */}
            <View style={styles.cardHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.cardHeaderText}>CREATE YOUR MISSION</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressRow}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressSegment,
                    i < step ? styles.progressSegmentActive : styles.progressSegmentInactive,
                    i < TOTAL_STEPS - 1 && { marginRight: 6 },
                  ]}
                />
              ))}
            </View>

            {/* FORM BODY */}
            <View style={styles.cardBody}>
              <Text style={styles.sectionTitle}>ตั้งชื่อ MISSION</Text>

              <Text style={styles.inputLabel}>ชื่อ mission</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น อ่านหนังสือวันละ 10 หน้า..."
                placeholderTextColor="#5A6A83"
                value={missionName}
                onChangeText={setMissionName}
              />

              <Text style={[styles.inputLabel, { marginTop: 25 }]}>หมวดหมู่</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedCategory === 'อื่นๆ' && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.inputLabel}>ระบุประเภท mission ของคุณ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ระบุประเภทของคุณที่นี่..."
                    placeholderTextColor="#5A6A83"
                    value={otherCategory}
                    onChangeText={setOtherCategory}
                    autoFocus={true}
                  />
                </View>
              )}

              {/* NEXT BUTTON */}
              <TouchableOpacity
                style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
                onPress={handleNext}
                disabled={!canProceed}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>ถัดไป  →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 70 },
  headerProfile: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 45, height: 45, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#fff', marginRight: 12, backgroundColor: '#3A4A63' },
  headerAvatar: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  headerSubtitle: { color: '#AAB4C3', fontSize: 11 },
  settingsIcon: { color: 'white', fontSize: 24 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3A4A63', height: 45, marginTop: 5 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#fff' },
  tabTextActive: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 20 },
  card: { backgroundColor: '#1E2B48', borderRadius: 14, borderWidth: 1, borderColor: '#3A4A63', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151F32', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#3A4A63', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: 'white', fontSize: 16 },
  cardHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  progressRow: { flexDirection: 'row', paddingHorizontal: 15, paddingTop: 20 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressSegmentActive: { backgroundColor: '#F59E0B' },
  progressSegmentInactive: { backgroundColor: '#3A4A63' },
  cardBody: { padding: 20, paddingTop: 10 },
  sectionTitle: { color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 20 },
  inputLabel: { color: '#AAB4C3', fontSize: 14, marginBottom: 10, fontWeight: '500' },
  input: {
    backgroundColor: '#151F32',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  categoryChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: '#253552', borderWidth: 1, borderColor: '#3A4A63' },
  categoryChipActive: { backgroundColor: '#3A4A63', borderColor: '#F59E0B', borderWidth: 1.5 },
  categoryChipText: { color: '#AAB4C3', fontSize: 14, fontWeight: '600' },
  categoryChipTextActive: { color: 'white' },
  nextBtn: { backgroundColor: '#F59E0B', borderRadius: 15, paddingVertical: 16, alignItems: 'center', marginTop: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  nextBtnDisabled: { backgroundColor: '#7A6030' },
  nextBtnText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 18 },
});