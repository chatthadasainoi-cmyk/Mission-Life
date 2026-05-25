import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from './App';
import SettingsModal from './SettingsModal';

const { width } = Dimensions.get('window');

// ✅ สูตรคำนวณ Level
const calcLevelInfo = (totalXP) => {
  let level = 1, xpUsed = 0;
  while (true) {
    const xpNeeded = level * 10;
    if (xpUsed + xpNeeded > totalXP) {
      return { level, currentXP: totalXP - xpUsed, xpNeeded, totalXP };
    }
    xpUsed += xpNeeded;
    level++;
  }
};

// ✅ ข้อมูลถ้วยรางวัล 10 ระดับ
const TROPHIES = [
  { id: 1, reqLevel: 100, name: 'ก้าวแรกแห่งตำนาน', bonusXP: 500 },
  { id: 2, reqLevel: 250, name: 'จิตวิญญาณนักสู้', bonusXP: 1500 },
  { id: 3, reqLevel: 500, name: 'นักรบแห่งความอดทน', bonusXP: 3000 },
  { id: 4, reqLevel: 1000, name: 'จอมเวทย์แห่งวินัย', bonusXP: 8000 },
  { id: 5, reqLevel: 2500, name: 'ผู้พิชิตเป้าหมาย', bonusXP: 15000 },
  { id: 6, reqLevel: 5000, name: 'ตำนานที่ยังมีลมหายใจ', bonusXP: 35000 },
  { id: 7, reqLevel: 10000, name: 'ผู้ปกครองกาลเวลา', bonusXP: 80000 },
  { id: 8, reqLevel: 25000, name: 'เทพเจ้าแห่งความเพียร', bonusXP: 200000 },
  { id: 9, reqLevel: 50000, name: 'จักรพรรดิแห่ง MISSION', bonusXP: 500000 },
  { id: 10, reqLevel: 100000, name: 'มหาเทพไร้พ่าย', bonusXP: 1000000 },
];

const FALLBACK_AVATAR = require('./assets/icon.png');

export default function Trophy({
  navigation, loggedInUser, characterName, selectedAvatar,
  onLogout, onGoToHome, onGoToQuest, onGoToHistoryList, onGoToProfile, onGoToFeedback, onGoToGuide
}) {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loggedInUser) return;
    const q = query(collection(db, "missions"), where("username", "==", loggedInUser), where("status", "==", "completed"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalXP = 0;
      snapshot.forEach(doc => {
        totalXP += Number(doc.data().xp) || 0;
      });
      const levelInfo = calcLevelInfo(totalXP);
      setUserLevel(levelInfo.level);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loggedInUser]);

  const getAvatarSource = (source) => {
    if (!source) return FALLBACK_AVATAR;
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return FALLBACK_AVATAR;
  };

  // ✅ หาจำนวนถ้วยที่มี และหาถ้วยเป้าหมายใบถัดไป
  const unlockedCount = TROPHIES.filter(t => userLevel >= t.reqLevel).length;
  const nextTrophy = TROPHIES.find(t => userLevel < t.reqLevel);

  // ✅ หลอดวิ่งตามเปอร์เซ็นต์ของ เลเวลปัจจุบัน / เลเวลถ้วยถัดไป
  const progressPercent = nextTrophy ? (userLevel / nextTrophy.reqLevel) * 100 : 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Image source={getAvatarSource(selectedAvatar)} style={styles.headerAvatar} resizeMode="cover" />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <View style={styles.subNameRow}>
              <Text style={styles.headerSub}>สวัสดีคุณ </Text>
              <Text style={styles.headerSubName}>{characterName || 'User'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToHome}><Text style={styles.tabText}>HOME</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToQuest}><Text style={styles.tabText}>QUEST</Text></TouchableOpacity>
        <View style={[styles.tabItem, styles.tabActive]}><Text style={styles.tabTextActive}>TROPHY</Text></View>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToHistoryList}><Text style={styles.tabText}>HISTORY</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {isLoading ? (
          <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.mainCard}>

            {/* ✅ ส่วนหัว: ความคืบหน้าสู่ถ้วยถัดไป */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressTitle}>🏆 ถ้วยรางวัล ({unlockedCount}/{TROPHIES.length})</Text>
                <Text style={styles.progressCount}>Lv.{userLevel} / {nextTrophy ? nextTrophy.reqLevel : 'Max'}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              {nextTrophy && (
                <Text style={styles.nextTrophyHint}>
                  *อีก {nextTrophy.reqLevel - userLevel} เลเวล จะปลดล็อค "{nextTrophy.name}"
                </Text>
              )}
            </View>

            {/* Grid ถ้วยรางวัล */}
            <View style={styles.gridContainer}>
              {TROPHIES.map((trophy) => {
                const isUnlocked = userLevel >= trophy.reqLevel;

                return (
                  <View
                    key={trophy.id}
                    style={[styles.trophyCard, isUnlocked ? styles.cardUnlocked : styles.cardLocked]}
                  >
                    {isUnlocked ? (
                      <>
                        <Text style={styles.trophyIcon}>🏆</Text>
                        <Text style={styles.unlockedTitle} numberOfLines={2}>รางวัล : {trophy.name}</Text>
                        <Text style={styles.rewardText}>⭐ + {trophy.bonusXP.toLocaleString()} XP</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.lockIcon}>🔒</Text>
                        <Text style={styles.lockedReq}>ปลดล็อคที่ Lv.{trophy.reqLevel}</Text>
                        <Text style={styles.lockedTitle} numberOfLines={1}>{trophy.name}</Text>
                        <Text style={styles.lockedSub}>ยังไม่ปลดล็อค</Text>
                      </>
                    )}
                  </View>
                );
              })}
            </View>

          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onLogout={onLogout}
        onProfile={onGoToProfile}
        onFeedback={onGoToFeedback}
        onGuide={onGoToGuide}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#152033' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 80, backgroundColor: '#1A2A47' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 50, height: 50, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#4A5A73', marginRight: 12, backgroundColor: '#121F35' },
  headerAvatar: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  subNameRow: { flexDirection: 'row', alignItems: 'center' },
  headerSub: { color: '#AAB4C3', fontSize: 10 },
  headerSubName: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  settingsIcon: { fontSize: 24, color: '#AAB4C3' },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3A4A63', height: 50, backgroundColor: '#1A2A47' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#FFFFFF' },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },

  container: { flex: 1, paddingHorizontal: 15, paddingTop: 20 },
  mainCard: { backgroundColor: '#1E2B48', borderRadius: 16, borderWidth: 1, borderColor: '#3A4A63', padding: 20, minHeight: 500 },

  progressSection: { marginBottom: 25 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  progressCount: { color: '#F59E0B', fontSize: 14, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: '#121F35', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
  nextTrophyHint: { color: '#AAB4C3', fontSize: 11, marginTop: 8, fontStyle: 'italic' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  trophyCard: {
    width: (width - 80) / 2,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
  },
  cardUnlocked: { backgroundColor: '#D4AF37', borderColor: '#FDE047' },
  trophyIcon: { fontSize: 40, marginBottom: 8 },
  unlockedTitle: { color: '#1A2A47', fontWeight: '900', fontSize: 12, textAlign: 'center', marginBottom: 5 },
  rewardText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 11 },

  cardLocked: { backgroundColor: '#253552', borderColor: '#3A4A63' },
  lockIcon: { fontSize: 30, marginBottom: 8, opacity: 0.5 },
  lockedReq: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  lockedTitle: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 11, textAlign: 'center', opacity: 0.6 },
  lockedSub: { color: '#64748B', fontSize: 10, marginTop: 4 },
});