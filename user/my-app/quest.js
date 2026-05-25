import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsModal from './SettingsModal';

import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Quest({
  db,
  navigation,
  characterName,
  selectedAvatar,
  loggedInUser,
  onGoToHome,
  onGoToTrophy,
  onGoToHistoryList,
  onLogout,
  onGoToProfile,
  onGoToFeedback,
  onGoToGuide
}) {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
  const [myMissions, setMyMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const FILTERS = ['ทั้งหมด', 'สุขภาพ', 'การเรียน', 'การเงิน', 'อื่นๆ'];

  useEffect(() => {
    if (!loggedInUser || !db) {
      setIsLoading(false);
      return;
    }

    const missionRef = collection(db, "missions");
    const q = query(missionRef, where("username", "==", loggedInUser));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      const sortedList = list.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setMyMissions(sortedList);
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase Error in Quest: ", error.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loggedInUser, db]);

  const getSource = (source) => {
    if (!source) return require('./assets/icon.png');
    if (typeof source === 'number') return source;
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return require('./assets/icon.png');
  };

  // ✅ 1. กรองภารกิจที่ยังไม่สำเร็จมาก่อน (เพื่อไม่ให้แสดงในการ์ดหน้านี้)
  const activeMissionsOnly = myMissions.filter(item => {
    const maxHP = Number(item.xp) || Number(item.totalCount) || 100;
    const damage = Number(item.currentDamage) || Number(item.currentProgress) || 0;
    const remainingHP = Math.max(0, maxHP - damage);

    // รีเทิร์นเฉพาะภารกิจที่เลือดบอสยังไม่หมด และสถานะยังไม่เป็น completed
    return remainingHP > 0 && item.status !== 'completed';
  });

  // ✅ 2. จากนั้นค่อยเอากรองตามหมวดหมู่
  const filteredMissions = activeFilter === 'ทั้งหมด'
    ? activeMissionsOnly
    : activeMissionsOnly.filter(m => m.category === activeFilter);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerProfile}>
          <View style={styles.avatarWrap}>
            <Image
              source={getSource(selectedAvatar)}
              style={styles.headerAvatar}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <View style={styles.subNameRow}>
              <Text style={styles.headerSubtitle}>สวัสดีคุณ </Text>
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
        <TouchableOpacity style={styles.tabItem} onPress={onGoToHome}>
          <Text style={styles.tabText}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.tabActive]}>
          <Text style={styles.tabTextActive}>QUEST</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToTrophy}>
          <Text style={styles.tabText}>TROPHY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToHistoryList}>
          <Text style={styles.tabText}>HISTORY</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* FILTERS */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={{ marginTop: 100 }}>
             <ActivityIndicator size="large" color="#F59E0B" />
             <Text style={{ color: '#AAB4C3', textAlign: 'center', marginTop: 10 }}>กำลังสแกนหาเป้าหมาย...</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredMissions.length > 0 ? (
              filteredMissions.map((item) => {
                const maxHP = Number(item.xp) || Number(item.totalCount) || 100;
                const damage = Number(item.currentDamage) || Number(item.currentProgress) || 0;
                const remainingHP = Math.max(0, maxHP - damage);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.missionCard}
                    // ✅ ส่งข้อมูลไปหน้า MissionBattle ให้ครบถ้วนเพื่อแก้ Error No document to update
                    onPress={() => navigation.navigate('MissionBattle', {
                      missionId: item.id,
                      ...item
                    })}
                  >
                    <View style={styles.monsterIconContainer}>
                        <Image source={getSource(item.monsterImage)} style={styles.missionCardImg} resizeMode="contain" />
                    </View>

                    <Text style={styles.missionTitle} numberOfLines={1}>{item.missionName}</Text>

                    <Text style={styles.missionDesc} numberOfLines={1}>
                      เลือดบอส: {remainingHP} / {maxHP}
                    </Text>

                    <View style={[styles.missionBadge, { backgroundColor: '#7C3AED' }]}>
                      <Text style={styles.missionBadgeText}>
                        {item.xp || 0} XP
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>ไม่มีภารกิจที่ต้องทำแล้ว... ไปสร้างเพิ่มกันเถอะ!</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateMission', { username: loggedInUser })}
        >
          <View style={styles.createButtonInner}>
            <View style={styles.createIconCircle}><Text style={styles.createIconText}>+</Text></View>
            <View>
              <Text style={styles.createButtonTitle}>สร้าง Mission ใหม่</Text>
              <Text style={styles.createButtonSub}>ออกไปล่ามอนสเตอร์กันเถอะ!</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={{ height: 60 }} />
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
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 80 },
  headerProfile: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 50, height: 50, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#4A5A73', marginRight: 12, backgroundColor: '#121F35' },
  headerAvatar: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  subNameRow: { flexDirection: 'row', alignItems: 'center' },
  headerSubtitle: { color: '#AAB4C3', fontSize: 10 },
  headerSubName: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  settingsIcon: { color: '#AAB4C3', fontSize: 24 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3A4A63', height: 50 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#FFFFFF' },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 15 },
  filterRow: { marginBottom: 16 },
  filterContent: { paddingRight: 8 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#253552', marginRight: 8, borderWidth: 1, borderColor: '#3A4A63' },
  filterChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  filterChipText: { color: '#AAB4C3', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#1A2A47', fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  missionCard: { width: '48%', backgroundColor: '#253552', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#3A4A63', marginBottom: 15, alignItems: 'center' },
  monsterIconContainer: { position: 'relative', width: 70, height: 70, marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  missionCardImg: { width: '100%', height: '100%' },
  missionTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  missionDesc: { color: '#AAB4C3', fontSize: 11, textAlign: 'center', marginTop: 4 },
  missionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 10 },
  missionBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  createButton: { backgroundColor: '#253552', borderRadius: 12, borderWidth: 1.5, borderColor: '#3A4A63', padding: 20, marginTop: 10, borderStyle: 'dashed' },
  createButtonInner: { flexDirection: 'row', alignItems: 'center' },
  createIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3A4A63', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  createIconText: { color: 'white', fontSize: 28 },
  createButtonTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  createButtonSub: { color: '#AAB4C3', fontSize: 12, marginTop: 2 },
  emptyContainer: { flex: 1, width: '100%', alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#AAB4C3', fontSize: 15, fontStyle: 'italic' },
});