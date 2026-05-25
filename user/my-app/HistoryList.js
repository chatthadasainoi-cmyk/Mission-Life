import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import SettingsModal from './SettingsModal';
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function HistoryList({
  db, loggedInUser, characterName, selectedAvatar,
  onGoToHome, onGoToQuest, onGoToTrophy, onGoToHistoryList,
  onLogout, onNavigate, navigation
}) {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [allMissions, setAllMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  const FALLBACK_AVATAR = require('./assets/icon.png');

  useEffect(() => { setAvatarError(false); }, [selectedAvatar]);

  useEffect(() => {
    if (!db || !loggedInUser) { setIsLoading(false); return; }
    const q = query(collection(db, "missions"), where("username", "==", loggedInUser));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllMissions(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setIsLoading(false);
    }, (error) => { console.error("History Fetch Error:", error); setIsLoading(false); });
    return () => unsubscribe();
  }, [db, loggedInUser]);

  const getAvatarSource = (source) => {
    if (!source || avatarError) return FALLBACK_AVATAR;
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string' && source.startsWith('http')) return { uri: source, cache: 'reload' };
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri, cache: 'reload' };
    return FALLBACK_AVATAR;
  };

  const totalXP = allMissions
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + (Number(item.xp) || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Image
              key={typeof selectedAvatar === 'string' ? selectedAvatar : 'avatar'}
              source={getAvatarSource(selectedAvatar)}
              style={styles.headerAvatar}
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <Text style={styles.headerSubtitle}>สวัสดีคุณ {characterName || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabMenu}>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToHome}><Text style={styles.tabText}>HOME</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToQuest}><Text style={styles.tabText}>QUEST</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={onGoToTrophy}><Text style={styles.tabText}>TROPHY</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.tabActive]}><Text style={styles.tabTextActive}>HISTORY</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.cardHeaderInternal}>
            <TouchableOpacity onPress={onGoToHome} style={styles.backBtn}>
              <FontAwesome name="chevron-left" size={14} color="white" />
            </TouchableOpacity>
            <Text style={styles.cardHeaderText}>MISSION LIST</Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={styles.listPadding}>
            {isLoading ? (
              <ActivityIndicator color="#F59E0B" style={{ marginTop: 50 }} />
            ) : allMissions.length > 0 ? (
              allMissions.map((item) => {
                // ✅ คำนวณ % จาก currentDamage vs xp (HP บอสจริง)
                const xp = Number(item.xp) || 100;
                const damage = Number(item.currentDamage) || 0;
                const percent = Math.min(100, Math.round((damage / xp) * 100));
                const isDone = percent >= 100 || item.status === 'completed';

                return (
                  <View key={item.id} style={[styles.missionCard, isDone && styles.missionCardDone]}>
                    <View style={styles.missionLeft}>
                      <Text style={styles.mTitle} numberOfLines={1}>{item.missionName}</Text>
                      <Text style={styles.mXp}>⭐ + {item.xp || 0}</Text>
                    </View>
                    <View style={styles.missionRight}>
                      <View style={styles.typeRow}>
                        <Text style={styles.mType}>ประเภท : {item.category || 'ทั่วไป'}</Text>
                        {/* ✅ แสดง % จริง ถ้าเสร็จแล้วแสดง "✅ เสร็จแล้ว" */}
                        <Text style={[styles.mPercent, isDone && { color: '#4ADE80' }]}>
                          {isDone ? '✅ เสร็จแล้ว' : `⏳ ${percent}%`}
                        </Text>
                      </View>

                      <View style={styles.progressBg}>
                        {/* ✅ สีส้ม = กำลังทำ, สีเขียว = เสร็จแล้ว */}
                        <View style={[
                          styles.progressFill,
                          { width: `${isDone ? 100 : percent}%` },
                          { backgroundColor: isDone ? '#4ADE80' : '#F59E0B' }
                        ]} />
                      </View>

                      {/* ✅ ถ้าเสร็จแสดง "ทำภารกิจสำเร็จ" ถ้ายังทำอยู่แสดง progress จริง */}
                      {isDone ? (
                        <Text style={[styles.mProgressText, { color: '#4ADE80' }]}>
                          🏆 ทำภารกิจสำเร็จแล้ว!
                        </Text>
                      ) : (
                        <Text style={styles.mProgressText}>
                          Progress : {item.currentProgress || 0} / {item.totalCount} {item.unit}
                        </Text>
                      )}
                    </View>

                    <View style={styles.cardAction}>
                      {isDone ? (
                        <Text style={styles.successText}>SUCCESS!!</Text>
                      ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('MissionBattle', { missionId: item.id })}>
                          <FontAwesome name="play-circle" size={30} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>ยังไม่มีประวัติภารกิจ</Text>
            )}
          </View>

          <View style={styles.footerSummary}>
            <Text style={styles.footerText}>🏆 XP รวมทั้งหมด : {totalXP} XP</Text>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onLogout={onLogout}
        onProfile={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, height: 75, backgroundColor: '#1A2A47' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 48, height: 48, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#fff', marginRight: 12, backgroundColor: '#333' },
  headerAvatar: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  headerSubtitle: { color: '#AAB4C3', fontSize: 9 },
  settingsBtn: { padding: 5 },
  settingsIcon: { color: '#AAB4C3', fontSize: 24 },
  tabMenu: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#4A5A73', height: 45 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#fff' },
  tabTextActive: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 12 },
  contentContainer: { flex: 1, paddingHorizontal: 15, paddingTop: 15 },
  mainCard: { backgroundColor: '#253552', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#4A5A73', minHeight: 500 },
  cardHeaderInternal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  backBtn: { width: 30, alignItems: 'center' },
  listPadding: { marginTop: 10 },
  // ✅ card ปกติ vs card เสร็จแล้ว
  missionCard: { flexDirection: 'row', backgroundColor: '#1E2B48', borderRadius: 10, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3A4A63' },
  missionCardDone: { borderColor: '#4ADE80', backgroundColor: '#0F2820' },
  missionLeft: { width: '25%', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#3A4A63', paddingRight: 5 },
  mTitle: { color: 'white', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  mXp: { color: '#FFD700', fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  missionRight: { flex: 1, paddingHorizontal: 10 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  mType: { color: '#AAB4C3', fontSize: 9 },
  mPercent: { color: '#FFD700', fontSize: 9, fontWeight: 'bold' },
  progressBg: { height: 6, backgroundColor: '#1B263B', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF50' },
  mProgressText: { color: 'white', fontSize: 9, textAlign: 'center', marginTop: 5 },
  cardAction: { width: '20%', alignItems: 'center' },
  successText: { color: '#4ADE80', fontWeight: 'bold', fontSize: 8, textAlign: 'center' },
  footerSummary: { backgroundColor: '#3A4A63', padding: 15, alignItems: 'center', borderRadius: 10, marginTop: 10 },
  footerText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#AAB4C3', textAlign: 'center', marginTop: 50, fontStyle: 'italic' }
});