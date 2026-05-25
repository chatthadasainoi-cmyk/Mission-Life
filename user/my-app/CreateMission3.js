import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const UNITS = [
  'ครั้ง', 'เล่ม', 'กม.', 'ชั่วโมง', 'นาที', 'วินาที',
  'หน้า', 'บท', 'ข้อ', 'แก้ว', 'ลิตร', 'บาท'
];
const DURATIONS = [7, 21, 30, 90];
const DIFFICULTIES = [
  { id: 'easy', label: 'ง่าย', xp: 30 },
  { id: 'medium', label: 'ปานกลาง', xp: 60 },
  { id: 'hard', label: 'ยาก', xp: 100 }
];
const DAYS_OF_WEEK = [
  { id: 0, label: 'อา.' }, { id: 1, label: 'จ.' }, { id: 2, label: 'อ.' },
  { id: 3, label: 'พ.' }, { id: 4, label: 'พฤ.' }, { id: 5, label: 'ศ.' }, { id: 6, label: 'ส.' }
];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CreateMission3({ navigation, route, characterName, selectedAvatar }) {
  const { missionName, category, goalType } = route?.params || {};

  const [amount, setAmount] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('ครั้ง');
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [customDuration, setCustomDuration] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [calculatedXP, setCalculatedXP] = useState(0);
  const [scheduleType, setScheduleType] = useState('everyday');
  const [selectedDays, setSelectedDays] = useState([]);
  const [monthlyDays, setMonthlyDays] = useState([]);
  const [startDate] = useState(new Date());

  const dailyAmount = parseInt(amount) || 1;
  const effectiveDuration = scheduleType === 'everyday' ? selectedDuration : 30;
  const isCustomDuration = !DURATIONS.includes(selectedDuration);

  useEffect(() => {
    let xp = 0;
    switch (goalType) {
      case 'count': xp = dailyAmount * effectiveDuration; break;
      case 'xp': xp = dailyAmount; break;
      case 'streak': xp = effectiveDuration * 2; break;
      case 'once':
        const diff = DIFFICULTIES.find(d => d.id === selectedDifficulty);
        xp = diff ? diff.xp : 30;
        break;
      default: xp = 50;
    }
    setCalculatedXP(Math.min(Math.max(xp, 1), 100));
  }, [amount, selectedDuration, selectedDifficulty, goalType, scheduleType]);

  const toggleDay = (dayId) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
  };

  const toggleMonthlyDay = (day) => {
    setMonthlyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const getSummaryText = () => {
    if (goalType === 'once') return `ทำ ${dailyAmount} ${selectedUnit} แล้วเสร็จ`;
    if (goalType === 'streak') {
      return scheduleType === 'everyday'
        ? `ทำ ${dailyAmount} ${selectedUnit}/วัน ต่อเนื่อง ${selectedDuration} วัน`
        : `ทำ ${dailyAmount} ${selectedUnit} ตามตาราง ต่อเนื่องไม่ขาด`;
    }
    const unitLabel = goalType === 'xp' ? 'XP' : selectedUnit;
    if (scheduleType === 'everyday') {
      return `ทำ ${dailyAmount} ${unitLabel}/วัน × ${selectedDuration} วัน`;
    } else if (scheduleType === 'weekly') {
      const dayNames = selectedDays.sort((a, b) => a - b)
        .map(id => DAYS_OF_WEEK.find(d => d.id === id)?.label).join(', ');
      return `ทำ ${dailyAmount} ${unitLabel} — ทุกวัน${dayNames || 'ยังไม่ได้เลือก'} ทุกสัปดาห์`;
    } else {
      return `ทำ ${dailyAmount} ${unitLabel} — วันที่ ${monthlyDays.join(', ') || 'ยังไม่ได้เลือก'} ของทุกเดือน`;
    }
  };

  const handleNext = () => {
    const scheduleData = {
      type: scheduleType,
      startDate: startDate.toISOString(),
      daysOfWeek: scheduleType === 'weekly' ? selectedDays : [],
      datesOfMonth: scheduleType === 'monthly' ? monthlyDays : [],
    };
    navigation.navigate('CreateMonster', {
      ...route.params,
      amount: dailyAmount,
      unit: selectedUnit,
      duration: goalType === 'once' ? 1 : (scheduleType === 'everyday' ? selectedDuration : -1),
      difficulty: selectedDifficulty,
      totalXP: calculatedXP,
      xp: calculatedXP,
      totalCount: dailyAmount,
      dailyQuota: dailyAmount,
      schedule: scheduleData,
      currentProgress: 0,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SET YOUR GOAL</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              ภารกิจ: <Text style={{ color: '#F59E0B' }}>{missionName}</Text>
            </Text>
            <Text style={styles.infoSub}>ประเภท: {
              goalType === 'count' ? 'นับจำนวน' :
              goalType === 'xp' ? 'สะสมแต้ม' :
              goalType === 'streak' ? 'ทำต่อเนื่อง' : 'ทำครั้งเดียวจบ'
            }</Text>
          </View>

          {/* count / xp */}
          {(goalType === 'count' || goalType === 'xp') && (
            <View style={styles.card}>
              <Text style={styles.label}>
                {goalType === 'count' ? 'เป้าหมายที่ต้องทำ (ต่อวัน)' : 'กำหนดเป้าหมายรวม (สูงสุด 100)'}
              </Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.numberInput} keyboardType="number-pad" value={amount} onChangeText={setAmount} maxLength={3} />
                <Text style={styles.unitText}>{goalType === 'xp' ? 'แต้ม (XP)' : selectedUnit}</Text>
                {goalType === 'count' && <Text style={styles.perDayBadge}>/ วัน</Text>}
              </View>
              {goalType === 'count' && (
                <View style={styles.chipContainer}>
                  {UNITS.map(u => (
                    <TouchableOpacity key={u} style={[styles.chip, selectedUnit === u && styles.chipActive]} onPress={() => setSelectedUnit(u)}>
                      <Text style={[styles.chipText, selectedUnit === u && styles.chipTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* once / streak */}
          {(goalType === 'once' || goalType === 'streak') && (
            <View style={styles.card}>
              <Text style={styles.label}>
                {goalType === 'once' ? 'เป้าหมายที่ต้องทำ (ครั้งเดียว)' : 'เป้าหมายที่ต้องทำ (ต่อวัน)'}
              </Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.numberInput} keyboardType="number-pad" value={amount} onChangeText={setAmount} maxLength={3} />
                <Text style={styles.unitText}>{selectedUnit}</Text>
                {goalType === 'streak' && <Text style={styles.perDayBadge}>/ วัน</Text>}
              </View>
              <View style={styles.chipContainer}>
                {UNITS.map(u => (
                  <TouchableOpacity key={u} style={[styles.chip, selectedUnit === u && styles.chipActive]} onPress={() => setSelectedUnit(u)}>
                    <Text style={[styles.chipText, selectedUnit === u && styles.chipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ✅ กำหนดเวลา — ซ่อนถ้าเป็น once */}
          {goalType !== 'once' && (
            <View style={styles.card}>
              <Text style={styles.label}>กำหนดเวลาทำภารกิจ</Text>
              <View style={styles.dateRow}>
                <Text style={styles.subLabel}>เริ่มวันที่:</Text>
                <TouchableOpacity style={styles.dateBtn}>
                  <Text style={styles.dateBtnText}>{formatDate(startDate)} (วันนี้)</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.subLabel, { marginTop: 15, marginBottom: 10 }]}>ทำบ่อยแค่ไหน?</Text>
              <View style={styles.chipContainer}>
                {[{ id: 'everyday', label: 'ทุกวัน' }, { id: 'weekly', label: 'บางวัน' }, { id: 'monthly', label: 'รายเดือน' }].map(s => (
                  <TouchableOpacity key={s.id} style={[styles.chip, scheduleType === s.id && styles.chipActive]} onPress={() => setScheduleType(s.id)}>
                    <Text style={[styles.chipText, scheduleType === s.id && styles.chipTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {scheduleType === 'weekly' && (
                <View style={styles.dynamicBox}>
                  <Text style={styles.subLabel}>เลือกวันในสัปดาห์:</Text>
                  <View style={styles.daysRow}>
                    {DAYS_OF_WEEK.map(day => (
                      <TouchableOpacity key={day.id} style={[styles.dayCircle, selectedDays.includes(day.id) && styles.dayCircleActive]} onPress={() => toggleDay(day.id)}>
                        <Text style={[styles.dayText, selectedDays.includes(day.id) && styles.dayTextActive]}>{day.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {scheduleType === 'monthly' && (
                <View style={styles.dynamicBox}>
                  <Text style={styles.subLabel}>เลือกวันที่ต้องการทำ:</Text>
                  <View style={styles.calendarGrid}>
                    {MONTH_DAYS.map(day => (
                      <TouchableOpacity key={day} style={[styles.calendarDay, monthlyDays.includes(day) && styles.calendarDayActive]} onPress={() => toggleMonthlyDay(day)}>
                        <Text style={[styles.calendarDayText, monthlyDays.includes(day) && styles.calendarDayTextActive]}>{day}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {monthlyDays.length > 0 && (
                    <Text style={styles.monthlySummaryText}>คิวทำภารกิจ: วันที่ {monthlyDays.join(', ')} ของทุกเดือน</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* ✅ ระยะเวลาแคมเปญ — ซ่อนถ้าเป็น once */}
          {(goalType !== 'once' && scheduleType === 'everyday') && (
            <View style={styles.card}>
              <Text style={styles.label}>ระยะเวลาแคมเปญ (วันสิ้นสุดภารกิจ)</Text>
              <View style={styles.durationRow}>
                {DURATIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.boxChip, selectedDuration === d && !isCustomDuration && styles.boxChipActive]}
                    onPress={() => { setSelectedDuration(d); setCustomDuration(''); }}
                  >
                    <Text style={[styles.boxChipNum, selectedDuration === d && !isCustomDuration && styles.boxChipTextActive]}>{d}</Text>
                    <Text style={[styles.boxChipSub, selectedDuration === d && !isCustomDuration && styles.boxChipTextActive]}>วัน</Text>
                  </TouchableOpacity>
                ))}

                <View style={[styles.boxChipInput, isCustomDuration && styles.boxChipInputActive]}>
                  <Text style={[styles.boxChipEditIcon, isCustomDuration && { color: '#F59E0B' }]}>✏️</Text>
                  <TextInput
                    style={[styles.boxChipInputText, isCustomDuration && { color: '#F59E0B' }]}
                    keyboardType="number-pad"
                    value={customDuration}
                    onChangeText={(v) => {
                      setCustomDuration(v);
                      const num = parseInt(v) || 0;
                      if (num > 0) setSelectedDuration(num);
                    }}
                    placeholder="กำหนด"
                    placeholderTextColor="#5A6A83"
                    maxLength={3}
                    textAlign="center"
                  />
                  <Text style={[styles.boxChipSub, isCustomDuration && { color: '#F59E0B' }]}>วัน</Text>
                </View>
              </View>

              {isCustomDuration && (
                <Text style={styles.selectedDurationText}>
                  ✅ ระยะเวลาที่เลือก: <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>{selectedDuration} วัน</Text>
                </Text>
              )}
            </View>
          )}

          {/* ระดับความยาก once */}
          {goalType === 'once' && (
            <View style={styles.card}>
              <Text style={styles.label}>ประเมินความยากของภารกิจนี้</Text>
              <View style={styles.chipContainer}>
                {DIFFICULTIES.map(diff => (
                  <TouchableOpacity key={diff.id} style={[styles.chip, { flex: 1 }, selectedDifficulty === diff.id && styles.chipActive]} onPress={() => setSelectedDifficulty(diff.id)}>
                    <Text style={[styles.chipText, selectedDifficulty === diff.id && styles.chipTextActive]}>{diff.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋 สรุปภารกิจ</Text>
            <Text style={styles.summaryText}>{getSummaryText()}</Text>
          </View>

          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>รางวัลเมื่อทำสำเร็จ (HP บอส)</Text>
            <Text style={styles.rewardXP}>+ {calculatedXP.toLocaleString()} XP</Text>
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>ถัดไป (เลือกมอนสเตอร์) →</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#151F32', borderBottomWidth: 1, borderBottomColor: '#3A4A63' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#253552', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: 'white', fontSize: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  infoBox: { marginBottom: 20, alignItems: 'center' },
  infoTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  infoSub: { color: '#AAB4C3', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#1E2B48', borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#3A4A63' },
  label: { color: 'white', fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  subLabel: { color: '#AAB4C3', fontSize: 13, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#151F32', borderRadius: 12, paddingVertical: 10, marginBottom: 15, borderWidth: 1, borderColor: '#4A5A73' },
  numberInput: { color: '#F59E0B', fontSize: 32, fontWeight: 'bold', textAlign: 'center', minWidth: 100, borderBottomWidth: 2, borderBottomColor: '#F59E0B', paddingBottom: 5 },
  unitText: { color: '#AAB4C3', fontSize: 18, marginLeft: 15, fontWeight: 'bold' },
  perDayBadge: { color: '#F59E0B', fontSize: 14, fontWeight: 'bold', marginLeft: 6, backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: { backgroundColor: '#253552', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#4A5A73' },
  chipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  chipText: { color: '#AAB4C3', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  chipTextActive: { color: '#1A2A47' },
  durationRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  boxChip: { width: 58, height: 65, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4A5A73', backgroundColor: '#253552' },
  boxChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  boxChipNum: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  boxChipSub: { color: '#AAB4C3', fontSize: 11 },
  boxChipTextActive: { color: '#1A2A47' },
  boxChipInput: { width: 65, height: 65, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#4A5A73', backgroundColor: '#253552', borderStyle: 'dashed' },
  boxChipInputActive: { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', borderStyle: 'solid' },
  boxChipEditIcon: { fontSize: 12, color: '#AAB4C3', marginBottom: 1 },
  boxChipInputText: { color: '#AAB4C3', fontSize: 15, fontWeight: 'bold', width: '100%', textAlign: 'center', paddingVertical: 0 },
  selectedDurationText: { color: '#AAB4C3', fontSize: 11, textAlign: 'center', marginTop: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151F32', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#3A4A63' },
  dateBtn: { backgroundColor: '#253552', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  dateBtnText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 13 },
  dynamicBox: { marginTop: 15, backgroundColor: '#151F32', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#3A4A63' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#253552', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4A5A73' },
  dayCircleActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  dayText: { color: '#AAB4C3', fontSize: 12, fontWeight: 'bold' },
  dayTextActive: { color: '#1A2A47' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 8, marginTop: 15 },
  calendarDay: { width: (width - 120) / 7, aspectRatio: 1, borderRadius: 8, backgroundColor: '#253552', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3A4A63' },
  calendarDayActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  calendarDayText: { color: '#AAB4C3', fontSize: 14, fontWeight: 'bold' },
  calendarDayTextActive: { color: '#1A2A47' },
  monthlySummaryText: { color: '#10B981', fontSize: 12, marginTop: 15, fontStyle: 'italic', textAlign: 'center' },
  summaryCard: { backgroundColor: '#0F2040', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1.5, borderColor: '#3B82F6' },
  summaryTitle: { color: '#60A5FA', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  summaryText: { color: 'white', fontSize: 15, fontWeight: 'bold', lineHeight: 22 },
  rewardCard: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#10B981', marginBottom: 25 },
  rewardLabel: { color: '#AAB4C3', fontSize: 12, marginBottom: 8 },
  rewardXP: { color: '#10B981', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  nextBtn: { backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 18, alignItems: 'center', elevation: 5 },
  nextBtnText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 16 },
});