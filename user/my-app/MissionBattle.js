import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from './App';

const FALLBACK_AVATAR = require('./assets/icon.png');

export default function MissionBattle({ navigation, route, characterName, selectedAvatar }) {
  const { missionId } = route?.params || {};

  // ✅ โหลดข้อมูลทั้งหมดจาก Firestore (ไม่รับจาก route.params อีกต่อไป)
  const [monsterName, setMonsterName] = useState('มอนสเตอร์');
  const [monsterImage, setMonsterImage] = useState(null);
  const [xp, setXp] = useState(100);
  const [missionName, setMissionName] = useState('ภารกิจ');
  const [totalCount, setTotalCount] = useState(1);
  const [unit, setUnit] = useState('หน่วย');
  const [duration, setDuration] = useState(7);

  const [currentCount, setCurrentCount] = useState(0);
  const [currentDamage, setCurrentDamage] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const hasInitializedTime = useRef(false);

  const isTimeUnit = ['ชั่วโมง', 'นาที', 'วินาที'].includes(unit);
  const daysToCalc = duration > 0 ? duration : 30;
  const damagePerAction = Math.ceil(xp / daysToCalc);

  // ✅ 1. โหลดข้อมูลทั้งหมดจาก Firestore ตาม missionId
  useEffect(() => {
    if (!missionId) return;

    const missionRef = doc(db, "missions", missionId);

    const checkReset = async () => {
      const today = new Date().toISOString().split('T')[0];
      const snap = await getDoc(missionRef);
      if (snap.exists() && snap.data().lastUpdated !== today) {
        await updateDoc(missionRef, { currentProgress: 0, lastUpdated: today });
      }
    };
    checkReset();

    const unsub = onSnapshot(missionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // ✅ โหลดข้อมูล mission ทั้งหมดจาก Firestore
        setMonsterName(data.monsterName || 'มอนสเตอร์');
        setMonsterImage(data.monsterImage || null);
        setXp(data.xp || 100);
        setMissionName(data.missionName || 'ภารกิจ');
        setTotalCount(data.totalCount || 1);
        setUnit(data.unit || 'หน่วย');
        setDuration(data.duration || 7);
        setCurrentDamage(data.currentDamage || 0);
        setCurrentCount(data.currentProgress || 0);

        // ✅ ตั้งค่าเวลาเริ่มต้นครั้งแรกครั้งเดียว
        const u = data.unit || 'หน่วย';
        const tc = data.totalCount || 1;
        const isTime = ['ชั่วโมง', 'นาที', 'วินาที'].includes(u);
        if (isTime && !hasInitializedTime.current) {
          let total = 0;
          if (u === 'ชั่วโมง') total = tc * 3600;
          else if (u === 'นาที') total = tc * 60;
          else total = tc;
          setSecondsLeft(total);
          hasInitializedTime.current = true;
        }
      }
    });
    return () => unsub();
  }, [missionId]);

  // ✅ 2. Logic การนับถอยหลัง (Timer)
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      handleAction();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const handleAction = async () => {
    if (!missionId || isDefeated || isDailyQuotaFull) return;
    const today = new Date().toISOString().split('T')[0];
    const newDamage = Math.min(xp, currentDamage + damagePerAction);
    const newProgress = currentCount + 1;

    try {
      const missionRef = doc(db, "missions", missionId);
      await updateDoc(missionRef, {
        currentDamage: newDamage,
        currentProgress: newProgress,
        lastUpdated: today,
        status: newDamage >= xp ? 'completed' : 'in_progress'
      });

      if (isTimeUnit && newProgress < totalCount) {
        let total = 0;
        if (unit === 'ชั่วโมง') total = totalCount * 3600;
        else if (unit === 'นาที') total = totalCount * 60;
        else total = totalCount;
        setSecondsLeft(total);
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  // ✅ รองรับ base64, http URL, local
  const getAvatarSource = (source) => {
    if (!source) return FALLBACK_AVATAR;
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return FALLBACK_AVATAR;
  };

  const getMonsterSource = (source) => {
    if (!source) return FALLBACK_AVATAR;
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return FALLBACK_AVATAR;
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const remainingHP = Math.max(0, xp - currentDamage);
  const hpPercent = xp > 0 ? remainingHP / xp : 0;
  const isDefeated = remainingHP <= 0;
  const isDailyQuotaFull = currentCount >= totalCount;
  const hpColor = hpPercent > 0.6 ? '#4CAF50' : hpPercent > 0.3 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Image
              source={getAvatarSource(selectedAvatar)}
              style={styles.headerAvatarImage}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <View style={styles.subNameRow}>
              <Text style={styles.headerSub}>สวัสดีคุณ </Text>
              <Text style={styles.headerSubName}>{characterName || 'User'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity><Text style={styles.settingsIcon}>⚙️</Text></TouchableOpacity>
      </View>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        {['Home', 'Quest', 'Trophy', 'History'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, tab === 'Quest' && styles.tabActive]}
            onPress={() => navigation.navigate(tab)}
          >
            <Text style={tab === 'Quest' ? styles.tabTextActive : styles.tabText}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>BATTLE FIELD</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.monsterNameText}>{monsterName}</Text>
            <Text style={styles.missionTitle}>ภารกิจ: {missionName}</Text>

            {/* ✅ แสดงรูปมอนสเตอร์จาก Firestore */}
            <View style={styles.monsterImageBox}>
              <Image
                source={getMonsterSource(monsterImage)}
                style={styles.monsterImage}
                resizeMode="contain"
              />
              {isDefeated && (
                <View style={styles.defeatedOverlay}>
                  <Text style={styles.defeatedText}>💀 DEFEATED</Text>
                </View>
              )}
            </View>

            <View style={styles.hpSection}>
              <View style={styles.hpLabelRow}>
                <Text style={styles.hpLabel}>HP (BOSS)</Text>
                <Text style={styles.hpValue}>{remainingHP} / {xp}</Text>
              </View>
              <View style={styles.hpBarBg}>
                <View style={[styles.hpBarFill, { width: `${hpPercent * 100}%`, backgroundColor: hpColor }]} />
              </View>
              <Text style={styles.dmgInfo}>พลังโจมตีของคุณ: -{damagePerAction} HP ต่อครั้ง</Text>
            </View>

            {/* TIMER หรือ PROGRESS */}
            {isTimeUnit && !isDailyQuotaFull && !isDefeated ? (
              <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              </View>
            ) : (
              <View style={styles.progressIconBox}>
                <View style={styles.glassOuter}>
                  <View style={[styles.glassFill, { height: `${(currentCount / totalCount) * 100}%` }]} />
                  <Text style={styles.glassCount}>{currentCount}</Text>
                </View>
                <Text style={styles.progressText}>ความคืบหน้าวันนี้: {currentCount} / {totalCount} {unit}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.actionBtn,
                (isDailyQuotaFull && !isDefeated) && styles.actionBtnLocked,
                isDefeated && styles.actionBtnDefeated,
                isTimerRunning && { backgroundColor: '#3B82F6' }
              ]}
              onPress={() => {
                if (isDefeated) navigation.navigate('Quest');
                else if (isTimeUnit) setIsTimerRunning(!isTimerRunning);
                else handleAction();
              }}
              disabled={isDailyQuotaFull && !isDefeated}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>
                {isDefeated ? '🏆 ชนะแล้ว! กลับหน้าเควส'
                  : isDailyQuotaFull ? '✅ วันนี้ทำครบโควตาแล้ว'
                  : isTimeUnit ? (isTimerRunning ? '⏸️ หยุดเวลา' : '▶️ เริ่มนับเวลา')
                  : `โจมตีบอส (-${damagePerAction} HP)`}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>โควตา: {totalCount} {unit} / วัน</Text>
              <Text style={styles.footerText}>บอสตัวนี้มีเวลา: {duration} วันในการพิชิต</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 80, backgroundColor: '#1A2A47' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 50, height: 50, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#4A5A73', marginRight: 12, backgroundColor: '#121F35' },
  headerAvatarImage: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  subNameRow: { flexDirection: 'row', alignItems: 'center' },
  headerSub: { color: '#AAB4C3', fontSize: 10 },
  headerSubName: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  settingsIcon: { color: '#AAB4C3', fontSize: 24 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3A4A63', height: 50, backgroundColor: '#1A2A47' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#FFFFFF' },
  tabTextActive: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 15 },
  card: { backgroundColor: '#253552', borderRadius: 16, borderWidth: 1, borderColor: '#3A4A63', overflow: 'hidden' },
  cardHeader: { backgroundColor: '#1E2B48', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#3A4A63' },
  cardHeaderText: { color: 'white', fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  cardBody: { padding: 20, alignItems: 'center' },
  monsterNameText: { color: '#FFD700', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  missionTitle: { color: 'white', fontSize: 16, marginBottom: 20 },
  monsterImageBox: { width: 200, height: 200, marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
  monsterImage: { width: '100%', height: '100%' },
  defeatedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderRadius: 100 },
  defeatedText: { color: '#FF4444', fontSize: 24, fontWeight: '900', borderWidth: 3, borderColor: '#FF4444', padding: 10, transform: [{ rotate: '-15deg' }] },
  hpSection: { width: '100%', marginBottom: 25 },
  hpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  hpLabel: { color: '#FF4444', fontSize: 12, fontWeight: 'bold' },
  hpValue: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  hpBarBg: { height: 16, backgroundColor: '#121F35', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#3A4A63' },
  hpBarFill: { height: '100%' },
  dmgInfo: { color: '#AAB4C3', fontSize: 10, marginTop: 6, textAlign: 'center', fontStyle: 'italic' },
  progressIconBox: { alignItems: 'center', marginBottom: 25 },
  glassOuter: { width: 60, height: 80, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#121F35' },
  glassFill: { width: '100%', backgroundColor: '#3B82F6' },
  glassCount: { color: 'white', fontWeight: 'bold', fontSize: 24, position: 'absolute', width: '100%', textAlign: 'center', bottom: 25, textShadowColor: 'black', textShadowRadius: 5 },
  progressText: { color: 'white', fontSize: 14, marginTop: 10, fontWeight: '600' },
  actionBtn: { width: '100%', backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  actionBtnLocked: { backgroundColor: '#3A4A63', opacity: 0.6 },
  actionBtnDefeated: { backgroundColor: '#16A34A' },
  actionBtnText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 18 },
  footerRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  footerText: { color: '#AAB4C3', fontSize: 11 },
  timerDisplay: { marginBottom: 25, paddingVertical: 15, paddingHorizontal: 20, backgroundColor: '#1E2B48', borderRadius: 12, borderWidth: 2, borderColor: '#3B82F6', minWidth: 200, alignItems: 'center', justifyContent: 'center' },
  timerText: { color: '#3B82F6', fontSize: 44, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 },
});