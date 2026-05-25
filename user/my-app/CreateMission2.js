import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GOAL_TYPES = [
  { id: 'count', icon: '⊞', title: 'นับครั้ง', desc: 'สะสมให้ครบตามจำนวนที่ตั้งไว้' },
  { id: 'xp', icon: '☆', title: 'สะสม XP', desc: 'กำหนดเป้าหมายแต้ม XP ที่ต้องการ' },
  { id: 'streak', icon: '🔥', title: 'ต่อเนื่อง', desc: 'ทำทุกวัน ห้ามขาด (Streak)' },
  { id: 'once', icon: '✓', title: 'ทำครั้งเดียว', desc: 'เป้าหมายที่ทำแค่ครั้งเดียวจบ' },
];

const TOTAL_STEPS = 3;
const CURRENT_STEP = 2;

export default function CreateMission2({ navigation, route, characterName, selectedAvatar }) {
  const { missionName, category } = route?.params || {};
  const [selectedGoal, setSelectedGoal] = useState('count');

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

  const handleNext = () => {
    navigation.navigate('CreateMission3', {
      missionName,
      category,
      goalType: selectedGoal,
      goalTitle: GOAL_TYPES.find(g => g.id === selectedGoal)?.title
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatarWrap}>
            <Image source={getAvatarSource(selectedAvatar)} style={styles.headerAvatarImage} resizeMode="cover" />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <Text style={styles.headerSubtitle}>สวัสดีคุณ {characterName || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {['HOME', 'QUEST', 'TROPHY', 'HISTORY'].map((tab) => {
          const isActive = tab === 'QUEST';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && styles.tabActive]}
              onPress={() => navigation.navigate(tab.charAt(0) + tab.slice(1).toLowerCase())}
            >
              <Text style={isActive ? styles.tabTextActive : styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.cardHeaderText}>CREATE YOUR MISSION</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.progressRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i < CURRENT_STEP ? styles.progressSegmentActive : styles.progressSegmentInactive,
                  i < TOTAL_STEPS - 1 && { marginRight: 6 },
                ]}
              />
            ))}
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.sectionTitle}>เลือกประเภท GOAL</Text>
            <View style={styles.grid}>
              {GOAL_TYPES.map((item) => {
                const isSelected = selectedGoal === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.goalCard, isSelected && styles.goalCardActive]}
                    onPress={() => setSelectedGoal(item.id)}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
                      <Text style={[styles.goalIcon, isSelected && styles.goalIconActive]}>{item.icon}</Text>
                    </View>
                    <Text style={[styles.goalTitle, isSelected && styles.goalTitleActive]}>{item.title}</Text>
                    <Text style={[styles.goalDesc, isSelected && styles.goalDescActive]}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.nextBtnText}>ถัดไป →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 70 },
  headerProfile: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 45, height: 45, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#fff', marginRight: 12, backgroundColor: '#333' },
  headerAvatarImage: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  headerSubtitle: { color: '#AAB4C3', fontSize: 11 },
  settingsBtn: { padding: 5 },
  settingsIcon: { color: 'white', fontSize: 24 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3A4A63', height: 45 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#F59E0B' },
  tabTextActive: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 20 },
  card: { backgroundColor: '#253552', borderRadius: 18, borderWidth: 1, borderColor: '#3A4A63', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1E2B48', paddingHorizontal: 15, paddingVertical: 14 },
  backBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#3A4A63', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cardHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.8 },
  progressRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  progressSegment: { flex: 1, height: 6, borderRadius: 3 },
  progressSegmentActive: { backgroundColor: '#F59E0B' },
  progressSegmentInactive: { backgroundColor: '#3A4A63' },
  cardBody: { padding: 20 },
  sectionTitle: { color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  goalCard: { width: '48%', backgroundColor: '#1E2B48', borderRadius: 15, borderWidth: 2, borderColor: '#3A4A63', padding: 16, alignItems: 'center', marginBottom: 15, minHeight: 140, justifyContent: 'center' },
  goalCardActive: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#253552', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  iconCircleActive: { backgroundColor: '#F59E0B' },
  goalIcon: { fontSize: 24, color: '#AAB4C3' },
  goalIconActive: { color: '#1A2A47' },
  goalTitle: { color: 'white', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  goalTitleActive: { color: '#F59E0B' },
  goalDesc: { color: '#AAB4C3', fontSize: 11, textAlign: 'center', lineHeight: 15 },
  goalDescActive: { color: '#FFFFFF' },
  nextBtn: { backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 15 },
  nextBtnText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
});