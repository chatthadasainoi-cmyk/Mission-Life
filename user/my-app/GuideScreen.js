import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Modal,
} from 'react-native';
import {
  Settings, ChevronLeft, LayoutGrid, Star, Flame,
  CheckCircle2, Plus, ChevronRight, BookOpen,
} from 'lucide-react-native';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const GOAL_TYPES = [
  {
    icon: <LayoutGrid color="#F59E0B" size={28} />,
    title: 'นับครั้ง',
    desc: 'สะสมให้ครบตามจำนวนที่ตั้งไว้',
    detail: 'เหมาะกับกิจกรรมที่ทำซ้ำได้ เช่น วิ่ง 3 ครั้ง/วัน หรืออ่านหนังสือ 10 หน้า/วัน',
  },
  {
    icon: <Star color="#AAB4C3" size={28} />,
    title: 'สะสม XP',
    desc: 'กำหนดเป้าหมายแต้ม XP ที่ต้องการ',
    detail: 'เหมาะกับกิจกรรมที่มีคะแนนหรือมูลค่า เช่น ออมเงิน 500 บาท/วัน',
  },
  {
    icon: <Flame color="#AAB4C3" size={28} />,
    title: 'ต่อเนื่อง',
    desc: 'ทำทุกวัน ห้ามขาด (Streak)',
    detail: 'เหมาะกับการสร้างนิสัย ต้องทำทุกวันไม่ให้สาย Streak ขาด',
  },
  {
    icon: <CheckCircle2 color="#AAB4C3" size={28} />,
    title: 'ทำครั้งเดียว',
    desc: 'เป้าหมายที่ทำแค่ครั้งเดียวจบ',
    detail: 'เหมาะกับงานที่ต้องทำให้เสร็จครั้งเดียว เช่น สมัครสมาชิกยิม',
  },
];

const UNITS = ['ครั้ง', 'เล่ม', 'กม.', 'ชั่วโมง', 'นาที', 'วินาที', 'หน้า', 'บท', 'ข้อ', 'แก้ว', 'ลิตร', 'บาท'];
const FREQUENCIES = ['ทุกวัน', 'บางวัน', 'รายเดือน'];
const DURATIONS = [
  { label: '7', sub: 'วัน' },
  { label: '21', sub: 'วัน' },
  { label: '30', sub: 'วัน' },
  { label: '90', sub: 'วัน' },
  { label: 'กำหนด', sub: 'วัน' },
];
const MONSTER_IMAGES = [
  { emoji: '👹', label: 'ยักษ์แดง' },
  { emoji: '🐉', label: 'มังกร' },
  { emoji: '👻', label: 'ผีสิง' },
  { emoji: '🤖', label: 'หุ่นยนต์' },
];

// คำแนะนำแต่ละ step
const GUIDE_STEPS = [
  {
    step: 1,
    title: 'ตั้งชื่อ MISSION',
    badge: 'STEP 1 / 4',
    color: '#3B82F6',
    guideTitle: '📝 ตั้งชื่อเป้าหมายของคุณ',
    guidePoints: [
      'ตั้งชื่อให้ชัดเจนและจำง่าย เช่น "วิ่งทุกเช้า 30 นาที"',
      'ระบุสิ่งที่ต้องการทำเป็นประจำ ยิ่งชัด ยิ่งจำได้',
      'เลือกหมวดหมู่ให้ตรงกับประเภทกิจกรรมของคุณ',
    ],
    tip: '💡 เคล็ดลับ: ชื่อที่ดีควรบอกได้ว่า "ทำอะไร" และ "เท่าไหร่"',
  },
  {
    step: 2,
    title: 'เลือกประเภท GOAL',
    badge: 'STEP 2 / 4',
    color: '#8B5CF6',
    guideTitle: '🎯 เลือกวิธีวัดผลที่เหมาะกับคุณ',
    guidePoints: [
      '"นับครั้ง" — ทำซ้ำๆ สะสมครบตามเป้า เช่น 10 ครั้ง/วัน',
      '"สะสม XP" — เหมาะกับของที่มีมูลค่า เช่น เงินออม',
      '"ต่อเนื่อง" — ต้องทำทุกวัน ห้ามขาด สร้าง Streak',
      '"ทำครั้งเดียว" — งานที่ทำครั้งเดียวจบ เช่น สมัครสมาชิก',
    ],
    tip: '💡 เคล็ดลับ: อยากสร้างนิสัย → เลือก "ต่อเนื่อง" จะ Streak ยาวขึ้นเรื่อยๆ',
  },
  {
    step: 3,
    title: 'ตั้งเป้าหมาย',
    badge: 'STEP 3 / 4',
    color: '#10B981',
    guideTitle: '⚙️ กำหนดรายละเอียดภารกิจ',
    guidePoints: [
      'ตั้งจำนวนต่อวันที่ทำได้จริง อย่าตั้งสูงเกินไปในครั้งแรก',
      'เลือกหน่วยให้ตรงกับกิจกรรม เช่น "ครั้ง" "หน้า" "กม."',
      'ระยะเวลา 7 วัน = เริ่มต้น, 21 วัน = สร้างนิสัย, 30-90 วัน = เป้าหมายใหญ่',
      'XP ที่ได้ = จำนวน × ระยะวัน ยิ่งเป้าสูง XP ยิ่งมาก!',
    ],
    tip: '💡 เคล็ดลับ: เริ่มจาก 7 วันก่อน แล้วค่อยขยับเป็น 30 วัน',
  },
  {
    step: 4,
    title: 'สร้าง MONSTER',
    badge: 'STEP 4 / 4',
    color: '#EF4444',
    guideTitle: '👹 เลือกบอสตัวแทนอุปสรรค',
    guidePoints: [
      'เลือกรูปมอนสเตอร์หรืออัปโหลดรูปที่เป็นแรงผลักดันคุณ',
      'ตั้งชื่อบอสให้เป็นชื่อของอุปสรรค เช่น "ยักษ์ขี้เกียจ"',
      'ทุกครั้งที่ทำภารกิจสำเร็จ บอสจะถูกโจมตีด้วย XP',
      'เมื่อ HP บอสหมด = คุณเอาชนะอุปสรรคนั้นได้แล้ว!',
    ],
    tip: '💡 เคล็ดลับ: ตั้งชื่อบอสเป็นนิสัยที่อยากเลิก เช่น "บอสโซเชียล"',
  },
];

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function GuideScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0 = หน้า Guide Overview
  const [isSuccess, setIsSuccess] = useState(false);

  // States
  const [missionName, setMissionName] = useState('');
  const [category, setCategory] = useState('สุขภาพ');
  const [goalType, setGoalType] = useState('นับครั้ง');
  const [count, setCount] = useState(1);
  const [unit, setUnit] = useState('ครั้ง');
  const [frequency, setFrequency] = useState('ทุกวัน');
  const [duration, setDuration] = useState('7');
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [bossName, setBossName] = useState('');

  const totalXP = count * parseInt(duration === 'กำหนด' ? 7 : duration);
  const currentGuide = step > 0 ? GUIDE_STEPS[step - 1] : null;

  const cardTitle = step === 0
    ? 'MISSION GUIDE'
    : step === 4 ? 'CREATE YOUR MONSTER'
    : step === 3 ? 'SET YOUR GOAL'
    : 'CREATE YOUR MISSION';

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 missionName={missionName} setMissionName={setMissionName} category={category} setCategory={setCategory} />;
      case 2: return <Step2 goalType={goalType} setGoalType={setGoalType} missionName={missionName} />;
      case 3: return <Step3 count={count} setCount={setCount} unit={unit} setUnit={setUnit} frequency={frequency} setFrequency={setFrequency} duration={duration} setDuration={setDuration} totalXP={totalXP} />;
      case 4: return <Step4 selectedMonster={selectedMonster} setSelectedMonster={setSelectedMonster} bossName={bossName} setBossName={setBossName} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      {/* HEADER */}
      <View style={s.header}>
        <View style={s.userInfo}>
          <View style={s.avatar} />
          <View style={{ marginLeft: 12 }}>
            <Text style={s.headerTitle}>MISSION LIFE</Text>
            <Text style={s.headerSub}>คู่มือการสร้าง Mission</Text>
          </View>
        </View>
        <TouchableOpacity><Settings color="white" size={26} /></TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={s.tabsRow}>
        {['HOME', 'QUEST', 'TROPHY', 'HISTORY'].map(t => (
          <TouchableOpacity key={t} onPress={() => { if (t === 'HOME') navigation?.navigate('Home'); if (t === 'QUEST') navigation?.navigate('Quest'); }}>
            <View style={t === 'QUEST' ? s.activeTab : null}>
              <Text style={t === 'QUEST' ? s.tabTextActive : s.tabText}>{t}</Text>
              {t === 'QUEST' && <View style={s.activeIndicator} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.container}>
        <View style={s.mainCard}>
          {/* CARD TOP BAR */}
          <View style={s.cardTopBar}>
            <TouchableOpacity
              style={s.backCircle}
              onPress={() => step > 0 ? setStep(p => p - 1) : navigation?.goBack()}
            >
              <ChevronLeft color="white" size={18} />
            </TouchableOpacity>
            <Text style={s.cardTopTitle}>{cardTitle}</Text>
          </View>

          {/* PROGRESS — แสดงเฉพาะ step 1-4 */}
          {step > 0 && (
            <View style={s.progressContainer}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={[s.progressLine, step >= i && s.lineActive]} />
              ))}
            </View>
          )}

          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

            {/* ─── OVERVIEW PAGE (step 0) ─── */}
            {step === 0 && (
              <View>
                {/* Banner */}
                <View style={s.overviewBanner}>
                  <Text style={s.overviewEmoji}>📖</Text>
                  <Text style={s.overviewBannerTitle}>คู่มือสร้าง Mission</Text>
                  <Text style={s.overviewBannerSub}>
                    ทำตามขั้นตอนง่ายๆ 4 ขั้น เพื่อสร้าง Mission และ Monster บอสที่จะเป็นแรงผลักดันให้คุณสำเร็จ!
                  </Text>
                </View>

                {/* Step cards overview */}
                {GUIDE_STEPS.map(g => (
                  <TouchableOpacity
                    key={g.step}
                    style={s.overviewCard}
                    onPress={() => setStep(g.step)}
                    activeOpacity={0.85}
                  >
                    <View style={[s.overviewStepBadge, { backgroundColor: g.color }]}>
                      <Text style={s.overviewStepNum}>{g.step}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={s.overviewCardTitle}>{g.title}</Text>
                      <Text style={s.overviewCardDesc}>{g.guideTitle}</Text>
                    </View>
                    <ChevronRight color="#AAB4C3" size={20} />
                  </TouchableOpacity>
                ))}

                {/* Start button */}
                <TouchableOpacity style={s.btnStart} onPress={() => setStep(1)}>
                  <BookOpen color="#1A2A47" size={18} />
                  <Text style={s.btnStartText}>  เริ่มสร้าง Mission เลย →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ─── STEP PAGES (step 1-4) ─── */}
            {step > 0 && currentGuide && (
              <View>
                {/* Step badge */}
                <View style={s.stepBadgeRow}>
                  <View style={[s.stepBadge, { backgroundColor: currentGuide.color }]}>
                    <Text style={s.stepBadgeText}>{currentGuide.badge}</Text>
                  </View>
                </View>

                {/* Guide box */}
                <View style={[s.guideBox, { borderColor: currentGuide.color + '55' }]}>
                  <Text style={[s.guideBoxTitle, { color: currentGuide.color }]}>
                    {currentGuide.guideTitle}
                  </Text>
                  <View style={s.guideDivider} />
                  {currentGuide.guidePoints.map((pt, i) => (
                    <View key={i} style={s.guidePointRow}>
                      <View style={[s.guideDot, { backgroundColor: currentGuide.color }]} />
                      <Text style={s.guidePointText}>{pt}</Text>
                    </View>
                  ))}
                  <View style={s.tipBox}>
                    <Text style={s.tipText}>{currentGuide.tip}</Text>
                  </View>
                </View>

                {/* Step content */}
                {renderStep()}

                {/* NAV */}
                <View style={s.navRow}>
                  {step > 1 && (
                    <TouchableOpacity style={s.btnPrev} onPress={() => setStep(p => p - 1)}>
                      <Text style={s.btnPrevText}>← ย้อนกลับ</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[s.btnNext, step === 1 && { flex: 1 }, { backgroundColor: currentGuide.color }]}
                    onPress={() => step < 4 ? setStep(p => p + 1) : setIsSuccess(true)}
                  >
                    <Text style={s.btnNextText}>
                      {step === 4 ? '✅ เริ่มสร้างเควส' : step === 3 ? 'ถัดไป (มอนสเตอร์) →' : 'ถัดไป →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </ScrollView>
        </View>
      </View>

      {/* SUCCESS MODAL */}
      <Modal visible={isSuccess} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.successBox}>
            <Text style={s.successEmoji}>🎉</Text>
            <Text style={s.successTitle}>สำเร็จ!</Text>
            <Text style={s.successSub}>บอสของคุณถูกสร้างแล้ว{'\n'}เตรียมตัวต่อสู้!</Text>
            <TouchableOpacity
              style={s.btnSuccessStart}
              onPress={() => { setIsSuccess(false); setStep(0); navigation?.navigate('Home'); }}
            >
              <Text style={s.btnSuccessStartText}>เริ่มเลย 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STEP COMPONENTS
// ─────────────────────────────────────────────
function Step1({ missionName, setMissionName, category, setCategory }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={s.stepTitle}>ตั้งชื่อ MISSION</Text>
      <Text style={s.inputLabel}>ชื่อ mission</Text>
      <View style={s.inputWrapper}>
        <TextInput
          placeholder="เช่น อ่านหนังสือวันละ 10 หน้า..."
          placeholderTextColor="#5B6B8A"
          style={s.textInput}
          value={missionName}
          onChangeText={setMissionName}
        />
      </View>
      <Text style={[s.inputLabel, { marginTop: 18 }]}>หมวดหมู่</Text>
      <View style={s.chipRow}>
        {['สุขภาพ', 'การเรียน', 'การเงิน', 'อื่นๆ'].map(item => (
          <TouchableOpacity
            key={item}
            style={[s.chip, category === item && s.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[s.chipText, category === item && { color: '#1A2A47', fontWeight: 'bold' }]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function Step2({ goalType, setGoalType, missionName }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={s.stepTitle}>เลือกประเภท GOAL</Text>
      {missionName ? (
        <View style={s.missionTag}>
          <Text style={s.missionTagText}>ภารกิจ: {missionName}</Text>
        </View>
      ) : null}
      <View style={s.grid}>
        {GOAL_TYPES.map(({ icon, title, desc, detail }) => {
          const isActive = goalType === title;
          return (
            <TouchableOpacity
              key={title}
              style={[s.typeCard, isActive && s.typeCardActive]}
              onPress={() => setGoalType(title)}
            >
              <View style={[s.typeIconBox, isActive && s.typeIconActive]}>{icon}</View>
              <Text style={[s.typeTitle, isActive && { color: '#F59E0B' }]}>{title}</Text>
              <Text style={s.typeDesc}>{desc}</Text>
              {isActive && <Text style={s.typeDetail}>{detail}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function Step3({ count, setCount, unit, setUnit, frequency, setFrequency, duration, setDuration, totalXP }) {
  const today = '11 พ.ค. 2026 (วันนี้)';
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={s.stepTitle}>ตั้งเป้าหมาย</Text>

      <Text style={s.sectionLabel}>เป้าหมายที่ต้องทำ (ต่อวัน)</Text>
      <View style={s.goalBox}>
        <View style={s.countRow}>
          <TouchableOpacity style={s.counterBtn} onPress={() => setCount(p => Math.max(1, p - 1))}>
            <Text style={s.counterBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={s.countNum}>{count}</Text>
          <TouchableOpacity style={s.counterBtn} onPress={() => setCount(p => p + 1)}>
            <Text style={s.counterBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={s.perDayLabel}>ครั้ง /วัน</Text>
        </View>
        <View style={s.chipRow}>
          {UNITS.map(u => (
            <TouchableOpacity key={u} style={[s.chip, unit === u && s.chipActive]} onPress={() => setUnit(u)}>
              <Text style={[s.chipText, unit === u && { color: '#1A2A47', fontWeight: 'bold' }]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={s.sectionLabel}>กำหนดเวลาทำภารกิจ</Text>
      <View style={s.timeBox}>
        <View style={s.startRow}>
          <Text style={s.timeLabel}>เริ่มวันที่:</Text>
          <View style={s.dateBadge}><Text style={s.dateBadgeText}>{today}</Text></View>
        </View>
        <Text style={[s.timeLabel, { marginTop: 14, marginBottom: 8 }]}>ทำบ่อยแค่ไหน?</Text>
        <View style={s.chipRow}>
          {FREQUENCIES.map(f => (
            <TouchableOpacity key={f} style={[s.chip, frequency === f && s.chipActive]} onPress={() => setFrequency(f)}>
              <Text style={[s.chipText, frequency === f && { color: '#1A2A47', fontWeight: 'bold' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={s.sectionLabel}>ระยะเวลาแคมเปญ (วันสิ้นสุดภารกิจ)</Text>
      <View style={s.durationRow}>
        {DURATIONS.map(d => (
          <TouchableOpacity
            key={d.label}
            style={[s.durationChip, duration === d.label && s.durationChipActive]}
            onPress={() => setDuration(d.label)}
          >
            <Text style={[s.durationNum, duration === d.label && { color: '#1A2A47' }]}>{d.label}</Text>
            <Text style={[s.durationSub, duration === d.label && { color: '#1A2A47' }]}>{d.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.summaryBlueBox}>
        <Text style={s.summaryLabel}>📋 สรุปภารกิจ</Text>
        <Text style={s.summaryText}>ทำ {count} ครั้ง/วัน × {duration === 'กำหนด' ? '?' : duration} วัน</Text>
      </View>
      <View style={s.summaryGreenBox}>
        <Text style={s.rewardLabel}>รางวัลเมื่อทำสำเร็จ (HP บอส)</Text>
        <Text style={s.xpBig}>+ {totalXP} XP</Text>
      </View>
    </View>
  );
}

function Step4({ selectedMonster, setSelectedMonster, bossName, setBossName }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={s.stepTitle}>สร้าง MONSTER</Text>
      <Text style={s.inputLabel}>เลือกรูปมอนสเตอร์หรือกิจกรรม</Text>
      <View style={s.monsterGrid}>
        <TouchableOpacity style={s.monsterSquare}>
          <Plus color="#AAB4C3" size={24} />
          <Text style={{ color: '#AAB4C3', fontSize: 10, marginTop: 4 }}>เพิ่มรูป</Text>
        </TouchableOpacity>
        {MONSTER_IMAGES.map((m, i) => (
          <TouchableOpacity
            key={i}
            style={[s.monsterSquare, selectedMonster === i && s.monsterActive]}
            onPress={() => setSelectedMonster(i)}
          >
            <Text style={{ fontSize: 36 }}>{m.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedMonster !== null && (
        <View style={s.selectedBossBox}>
          <Text style={{ fontSize: 28 }}>{MONSTER_IMAGES[selectedMonster].emoji}</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={s.bossName}>{MONSTER_IMAGES[selectedMonster].label}</Text>
            <Text style={s.bossDesc}>บอสที่เลือกไว้ — แตะเพื่อขยายดูความน่าเกรงขาม</Text>
          </View>
        </View>
      )}
      <Text style={[s.inputLabel, { marginTop: 18 }]}>ชื่อมอนสเตอร์ / ชื่อบอส</Text>
      <View style={s.inputWrapper}>
        <TextInput
          placeholder="เช่น ยักษ์ขี้เกียจ, บอสโซเชียล..."
          placeholderTextColor="#5B6B8A"
          style={s.textInput}
          value={bossName}
          onChangeText={setBossName}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#3A4A63', borderWidth: 1, borderColor: '#fff' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  headerSub: { color: '#AAB4C3', fontSize: 11 },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 10 },
  tabText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 13 },
  tabTextActive: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  activeTab: { alignItems: 'center' },
  activeIndicator: { height: 3, width: 60, backgroundColor: '#F59E0B', marginTop: 6 },

  container: { flex: 1, padding: 15 },
  mainCard: { flex: 1, backgroundColor: '#253552', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#3A4A63' },
  cardTopBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2B48', padding: 12 },
  backCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#3A4A63', alignItems: 'center', justifyContent: 'center' },
  cardTopTitle: { color: 'white', fontWeight: 'bold', fontSize: 13, flex: 1, textAlign: 'center', marginRight: 30 },

  progressContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 14, gap: 6 },
  progressLine: { flex: 1, height: 4, backgroundColor: '#3A4A63', borderRadius: 2 },
  lineActive: { backgroundColor: '#F59E0B' },

  scrollContent: { padding: 18, paddingBottom: 40 },

  // ── Overview ──
  overviewBanner: { backgroundColor: '#1E2B48', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#3A4A63' },
  overviewEmoji: { fontSize: 40, marginBottom: 10 },
  overviewBannerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  overviewBannerSub: { color: '#AAB4C3', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  overviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2B48', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#3A4A63' },
  overviewStepBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  overviewStepNum: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  overviewCardTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 3 },
  overviewCardDesc: { color: '#AAB4C3', fontSize: 12 },
  btnStart: { flexDirection: 'row', backgroundColor: '#F59E0B', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnStartText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 15 },

  // ── Guide box ──
  stepBadgeRow: { flexDirection: 'row', marginBottom: 12 },
  stepBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  stepBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  guideBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1 },
  guideBoxTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 10 },
  guideDivider: { height: 1, backgroundColor: '#3A4A63', marginBottom: 12 },
  guidePointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  guideDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5, marginRight: 10 },
  guidePointText: { color: '#D1D5DB', fontSize: 13, flex: 1, lineHeight: 20 },
  tipBox: { marginTop: 10, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
  tipText: { color: '#F59E0B', fontSize: 12, lineHeight: 18 },

  // ── Step content ──
  stepTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  inputLabel: { color: '#AAB4C3', fontSize: 12, marginBottom: 8, fontWeight: 'bold' },
  sectionLabel: { color: '#AAB4C3', fontSize: 12, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  inputWrapper: { backgroundColor: '#1E2B48', borderRadius: 12, borderWidth: 1.5, borderColor: '#3A4A63', padding: 15 },
  textInput: { color: 'white', fontSize: 14 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#3A4A63' },
  chipActive: { backgroundColor: '#F59E0B' },
  chipText: { color: 'white', fontSize: 12 },
  missionTag: { backgroundColor: '#1E2B48', borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: '#3A4A63' },
  missionTagText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  typeCard: { width: '47%', backgroundColor: '#1E2B48', padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3A4A63', marginBottom: 4 },
  typeCardActive: { borderColor: '#F59E0B', borderWidth: 2, backgroundColor: '#2A3B5A' },
  typeIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#3A4A63', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  typeIconActive: { backgroundColor: '#F59E0B' },
  typeTitle: { color: 'white', fontWeight: 'bold', fontSize: 13, marginBottom: 3 },
  typeDesc: { color: '#6B7280', fontSize: 10, textAlign: 'center' },
  typeDetail: { color: '#AAB4C3', fontSize: 10, textAlign: 'center', marginTop: 6, lineHeight: 15 },
  goalBox: { backgroundColor: '#1E2B48', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#3A4A63', marginBottom: 4 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 },
  counterBtn: { width: 36, height: 36, backgroundColor: '#3A4A63', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  countNum: { color: '#F59E0B', fontSize: 36, fontWeight: 'bold', minWidth: 50, textAlign: 'center' },
  perDayLabel: { color: '#AAB4C3', fontSize: 13, marginLeft: 8 },
  timeBox: { backgroundColor: '#1E2B48', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#3A4A63' },
  startRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeLabel: { color: '#AAB4C3', fontSize: 13 },
  dateBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  dateBadgeText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 12 },
  durationRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  durationChip: { width: 58, height: 58, backgroundColor: '#1E2B48', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3A4A63' },
  durationChipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  durationNum: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  durationSub: { color: '#AAB4C3', fontSize: 10 },
  summaryBlueBox: { marginTop: 14, backgroundColor: '#1E2B48', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#3B82F6' },
  summaryLabel: { color: '#AAB4C3', fontSize: 12, marginBottom: 5 },
  summaryText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  summaryGreenBox: { marginTop: 10, backgroundColor: '#0F3320', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#16A34A', alignItems: 'center' },
  rewardLabel: { color: '#AAB4C3', fontSize: 12 },
  xpBig: { color: '#4ADE80', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  monsterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  monsterSquare: { width: 78, height: 78, backgroundColor: '#3A4A63', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  monsterActive: { borderWidth: 2.5, borderColor: '#F59E0B' },
  selectedBossBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2B48', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#3A4A63' },
  bossName: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  bossDesc: { color: '#AAB4C3', fontSize: 11, marginTop: 3 },

  // Nav buttons
  navRow: { flexDirection: 'row', marginTop: 24, gap: 10 },
  btnPrev: { flex: 1, backgroundColor: '#3A4A63', padding: 15, borderRadius: 13, alignItems: 'center' },
  btnPrevText: { color: 'white', fontWeight: 'bold' },
  btnNext: { flex: 1, padding: 15, borderRadius: 13, alignItems: 'center' },
  btnNextText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' },
  successBox: { width: '82%', backgroundColor: 'white', borderRadius: 22, padding: 30, alignItems: 'center' },
  successEmoji: { fontSize: 50, marginBottom: 10 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A2A47', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btnSuccessStart: { backgroundColor: '#1A2A47', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  btnSuccessStartText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});