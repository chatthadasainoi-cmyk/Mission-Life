import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import SettingsModal from './SettingsModal';
import { collection, query, where, onSnapshot } from "firebase/firestore";

const FALLBACK_AVATAR = require('./assets/icon.png');

// ✅ PieChart SVG แม่นยำ รองรับทุกสัดส่วน
function PieChart({ accomplished = 0, missed = 0 }) {
  const total = accomplished + missed;
  const size = 80;
  const cx = 40, cy = 40, r = 35, innerR = 22;

  const toXY = (angleDeg, radius) => {
    const angle = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const makePath = (startDeg, endDeg, color) => {
    if (endDeg - startDeg >= 359.99) {
      return <Circle key={color} cx={cx} cy={cy} r={r} fill={color} />;
    }
    const large = endDeg - startDeg > 180 ? 1 : 0;
    const o1 = toXY(startDeg, r), o2 = toXY(endDeg, r);
    const i1 = toXY(startDeg, innerR), i2 = toXY(endDeg, innerR);
    const d = [
      `M ${o1.x} ${o1.y}`,
      `A ${r} ${r} 0 ${large} 1 ${o2.x} ${o2.y}`,
      `L ${i2.x} ${i2.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y}`,
      'Z'
    ].join(' ');
    return <Path key={color + startDeg} d={d} fill={color} />;
  };

  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} fill="#3A4A63" />
        <Circle cx={cx} cy={cy} r={innerR} fill="#253552" />
      </Svg>
    );
  }

  const accDeg = (accomplished / total) * 360;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} fill="#3A4A63" />
      {accomplished > 0 && makePath(0, accDeg, '#4CAF50')}
      {missed > 0 && makePath(accDeg, 360, '#E8896A')}
      <Circle cx={cx} cy={cy} r={innerR} fill="#253552" />
    </Svg>
  );
}

// ✅ คำนวณ Level จาก XP รวม (ทวีขึ้น Level×10)
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

const getRank = (lv) => {
  if (lv >= 20) return 'Legendary';
  if (lv >= 15) return 'Master';
  if (lv >= 10) return 'Expert';
  if (lv >= 5) return 'Veteran';
  if (lv >= 3) return 'Warrior';
  return 'Rookie';
};

export default function Home({
  db, loggedInUser, navigation, characterName = 'User', onLogout, selectedAvatar,
  onGoToQuest, onGoToTrophy, onGoToHistoryList, onGoToProfile, onGoToFeedback, onGoToGuide,
}) {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [activeMissions, setActiveMissions] = useState([]);
  const [allMissions, setAllMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => { setAvatarError(false); }, [selectedAvatar]);

  useEffect(() => {
    if (!db || !loggedInUser) { if (!loggedInUser) setLoadingMissions(false); return; }
    const q = query(collection(db, "missions"), where("username", "==", loggedInUser), where("status", "==", "in_progress"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveMissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingMissions(false);
    }, (error) => { console.error("Home Data Fetch Error:", error); setLoadingMissions(false); });
    return () => unsubscribe();
  }, [db, loggedInUser]);

  useEffect(() => {
    if (!db || !loggedInUser) return;
    const q = query(collection(db, "missions"), where("username", "==", loggedInUser));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllMissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [db, loggedInUser]);

  const getAvatarSource = (source) => {
    if (!source || avatarError) return FALLBACK_AVATAR;
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string' && source.startsWith('http')) return { uri: source, cache: 'reload' };
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return FALLBACK_AVATAR;
  };

  // ✅ XP และ Level จริง
  const totalXP = allMissions
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + (Number(m.xp) || 0), 0);
  const levelInfo = calcLevelInfo(totalXP);
  const xpPercent = levelInfo.xpNeeded > 0 ? (levelInfo.currentXP / levelInfo.xpNeeded) * 100 : 0;

  // ✅ สถิติ
  const successCount = allMissions.filter(m => m.status === 'completed').length;
  const missedCount = allMissions.filter(m => m.status === 'missed').length;

  const categoryCount = {};
  allMissions.forEach(m => {
    const cat = m.category || 'อื่นๆ';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const totalCat = topCategories.reduce((sum, [, v]) => sum + v, 0) || 1;
  const catColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatarWrap}>
            <Image
              key={typeof selectedAvatar === 'string' ? selectedAvatar : 'avatar'}
              source={getAvatarSource(selectedAvatar)}
              style={s.headerAvatar}
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
          </View>
          <View>
            <Text style={s.headerTitle}>MISSION LIFE</Text>
            <View style={s.subNameRow}>
              <Text style={s.headerSub}>สวัสดีคุณ </Text>
              <Text style={s.headerSubName}>{characterName}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)} activeOpacity={0.7}>
          <Text style={s.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        <View style={[s.tabItem, s.tabActive]}><Text style={s.tabTextActive}>HOME</Text></View>
        <TouchableOpacity style={s.tabItem} onPress={onGoToQuest}><Text style={s.tabText}>QUEST</Text></TouchableOpacity>
        <TouchableOpacity style={s.tabItem} onPress={onGoToTrophy}><Text style={s.tabText}>TROPHY</Text></TouchableOpacity>
        <TouchableOpacity style={s.tabItem} onPress={onGoToHistoryList}><Text style={s.tabText}>HISTORY</Text></TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* PROFILE OVERVIEW */}
        <View style={s.card}>
          <View style={s.cardHeader}><Text style={s.cardHeaderText}>PROFILE OVERVIEW</Text></View>
          <View style={s.profileBody}>
            <Image
              key={typeof selectedAvatar === 'string' ? selectedAvatar + '_main' : 'avatar_main'}
              source={getAvatarSource(selectedAvatar)}
              style={s.mainAvatar}
              resizeMode="cover"
              onError={() => setAvatarError(true)}
            />
            <View style={s.profileRight}>
              <Text style={s.profileName} numberOfLines={1}>{characterName}</Text>
              <View style={s.rankRow}>
                <Text style={{ fontSize: 14 }}>⭐</Text>
                <Text style={s.rankText}>Rank: {getRank(levelInfo.level)}</Text>
              </View>
              <Text style={s.xpLabel}>XP PROGRESS  (รวม {totalXP} XP)</Text>
              <View style={s.xpBarBg}>
                <View style={[s.xpBarFill, { width: `${Math.min(xpPercent, 100)}%` }]} />
              </View>
              <View style={s.xpLevelRow}>
                <Text style={s.xpLevel}>Lv.{levelInfo.level}</Text>
                <Text style={s.xpAmount}>{levelInfo.currentXP} / {levelInfo.xpNeeded}</Text>
                <Text style={s.xpLevel}>Lv.{levelInfo.level + 1}</Text>
              </View>
              <TouchableOpacity style={s.newMissionBtn} onPress={onGoToQuest} activeOpacity={0.8}>
                <Text style={s.newMissionText}>NEW MISSION  ▷</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MISSION ACCOMPLISHED */}
        <View style={s.card}>
          <View style={s.cardHeader}><Text style={s.cardHeaderText}>MISSION ACCOMPLISHED</Text></View>
          <View style={s.accomplishedBody}>
            <View style={s.pieSection}>
              <PieChart accomplished={successCount} missed={missedCount} />
              <Text style={s.labelAccomplished}>SUCCESS  {successCount}</Text>
              <Text style={s.labelMissed}>MISSED  {missedCount}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.questSection}>
              <Text style={s.mostQuestTitle}>
                {topCategories.length > 0 ? 'MOST QUEST' : 'ยังไม่มีข้อมูล'}
              </Text>
              {topCategories.length > 0 ? (
                topCategories.map(([cat, count], index) => {
                  const pct = Math.round((count / totalCat) * 100);
                  return (
                    <View key={cat} style={s.miniBarRow}>
                      <Text style={s.miniBarLabel}>{cat}</Text>
                      <View style={s.miniBarBg}>
                        <View style={[s.miniBarFill, { width: `${pct}%`, backgroundColor: catColors[index] || '#4CAF50' }]} />
                      </View>
                      <Text style={s.miniBarPct}>{pct}%</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={{ color: '#AAB4C3', fontSize: 10, textAlign: 'center', marginTop: 10 }}>
                  สร้าง Mission แรกเพื่อดูสถิติ
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* MISSION IN PROGRESS */}
        <View style={[s.card, { marginBottom: 30 }]}>
          <View style={s.cardHeader}><Text style={s.cardHeaderText}>MISSION IN PROGRESS</Text></View>
          <View style={s.inProgressBody}>
            {loadingMissions ? (
              <ActivityIndicator color="#F59E0B" style={{ margin: 20 }} />
            ) : activeMissions.length > 0 ? (
              activeMissions.map((item) => {
                const xp = Number(item.xp) || 100;
                const damage = Number(item.currentDamage) || 0;
                const pct = Math.min(100, Math.round((damage / xp) * 100));
                const isDone = pct >= 100 || item.status === 'completed';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[s.missionCardDetail, isDone && { borderColor: '#4ADE80' }]}
                    onPress={() => navigation.navigate('MissionBattle', { missionId: item.id })}
                  >
                    <View style={s.missionLeft}>
                      <Text style={s.missionTitleText} numberOfLines={1}>{item.missionName}</Text>
                      <Text style={s.missionXPText}>⭐ + {item.xp || 200}</Text>
                    </View>
                    <View style={s.verticalDividerLine} />
                    <View style={s.missionRight}>
                      <Text style={s.categoryText}>ประเภท : {item.category || 'ภารกิจ'}</Text>
                      <View style={s.longProgressBarBg}>
                        <View style={[s.longProgressBarFill, { width: `${pct}%` }, { backgroundColor: isDone ? '#4ADE80' : '#4CAF50' }]} />
                      </View>
                      {isDone ? (
                        <Text style={[s.progressDetailText, { color: '#4ADE80' }]}>🏆 ทำภารกิจสำเร็จแล้ว!</Text>
                      ) : (
                        <Text style={s.progressDetailText}>
                          Progress : {item.currentProgress || 0} / {item.totalCount} {item.unit}  ({pct}%)
                        </Text>
                      )}
                    </View>
                    <View style={s.playBtnSide}><Text style={s.playIconText}>▷</Text></View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={s.emptyProgress}><Text style={s.emptyText}>ยังไม่มีภารกิจที่กำลังดำเนินการ</Text></View>
            )}
          </View>
        </View>

      </ScrollView>

      <SettingsModal visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} onLogout={onLogout} onProfile={onGoToProfile} onFeedback={onGoToFeedback} onGuide={onGoToGuide} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 80, backgroundColor: '#1A2A47' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 50, height: 50, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#4A5A73', marginRight: 12, backgroundColor: '#121F35' },
  headerAvatar: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  subNameRow: { flexDirection: 'row', alignItems: 'center' },
  headerSub: { color: '#AAB4C3', fontSize: 10 },
  headerSubName: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  settingsIcon: { fontSize: 22, color: '#AAB4C3' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3A4A63', height: 50, backgroundColor: '#1A2A47' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#FFFFFF' },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },
  scroll: { flex: 1, paddingHorizontal: 15, paddingTop: 20 },
  card: { backgroundColor: '#253552', borderRadius: 16, borderWidth: 1, borderColor: '#4A5A73', overflow: 'hidden', marginBottom: 20 },
  cardHeader: { backgroundColor: '#3A4A63', paddingVertical: 12 },
  cardHeaderText: { color: 'white', textAlign: 'center', fontWeight: '800', fontSize: 11, letterSpacing: 1.5 },
  profileBody: { flexDirection: 'row', padding: 20 },
  mainAvatar: { width: 110, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#4A5A73', backgroundColor: '#121F35' },
  profileRight: { flex: 1, marginLeft: 20 },
  profileName: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  rankText: { color: '#AAB4C3', fontSize: 13, marginLeft: 6 },
  xpLabel: { color: '#AAB4C3', fontSize: 10, marginBottom: 6, fontWeight: 'bold' },
  xpBarBg: { height: 8, backgroundColor: '#121F35', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#4CAF50' },
  xpLevelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 20 },
  xpLevel: { color: '#AAB4C3', fontSize: 10 },
  xpAmount: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  newMissionBtn: { backgroundColor: '#FFF', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  newMissionText: { color: '#1A2A47', fontWeight: '900', fontSize: 12 },
  accomplishedBody: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  pieSection: { width: 100, alignItems: 'center' },
  labelAccomplished: { color: '#4CAF50', fontSize: 10, fontWeight: 'bold', marginTop: 12 },
  labelMissed: { color: '#E8896A', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, backgroundColor: '#4A5A73', height: '70%', marginHorizontal: 20 },
  questSection: { flex: 1 },
  mostQuestTitle: { color: 'white', fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  miniBarRow: { marginBottom: 10 },
  miniBarLabel: { color: '#DDD', fontSize: 10, marginBottom: 4 },
  miniBarBg: { height: 5, backgroundColor: '#121F35', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },
  miniBarPct: { color: '#AAB4C3', fontSize: 9, textAlign: 'right', marginTop: 3 },
  inProgressBody: { padding: 15 },
  missionCardDetail: { flexDirection: 'row', backgroundColor: '#1E2B48', borderRadius: 8, borderWidth: 1, borderColor: '#4A5A73', marginBottom: 10, padding: 12, alignItems: 'center' },
  missionLeft: { width: '25%', alignItems: 'center', justifyContent: 'center' },
  missionTitleText: { color: 'white', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  missionXPText: { color: '#F59E0B', fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  verticalDividerLine: { width: 1, height: '100%', backgroundColor: '#4A5A73', marginHorizontal: 10 },
  missionRight: { flex: 1, justifyContent: 'center' },
  categoryText: { color: '#AAB4C3', fontSize: 10, marginBottom: 5 },
  longProgressBarBg: { height: 10, backgroundColor: '#121F35', borderRadius: 5, overflow: 'hidden', width: '100%' },
  longProgressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
  progressDetailText: { color: 'white', fontSize: 11, marginTop: 5, textAlign: 'center', fontWeight: '500' },
  playBtnSide: { marginLeft: 10, justifyContent: 'center' },
  playIconText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  emptyProgress: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#AAB4C3', fontSize: 12, fontStyle: 'italic' }
});