import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Platform, StatusBar, TextInput, ScrollView,
  Alert, KeyboardAvoidingView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import SettingsModal from './SettingsModal';

export default function FeedbackWriteScreen({
  navigation, route, db, loggedInUser,
  characterName, selectedAvatar, onLogout
}) {
  const editItem = route?.params?.editItem || null;

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (editItem) {
      setTopic(editItem.topic || '');
      setMessage(editItem.message || '');
    } else {
      setTopic('');
      setMessage('');
    }
  }, [editItem]);

  const getAvatarSource = (source) => {
    if (!source) return require('./assets/icon.png');
    if (typeof source === 'number') return source;
    if (typeof source === 'string' && source.startsWith('data:image')) return { uri: source };
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return require('./assets/icon.png');
  };

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อความก่อนส่งครับ');
      return;
    }

    setIsSending(true);
    try {
      if (editItem?.id) {
        // ✅ อัปเดตข้อมูลเดิมใน 'feedback_db'
        await updateDoc(doc(db, "feedback_db", editItem.id), {
          topic: topic.trim() || 'Admin',
          message: message.trim(),
          updatedAt: serverTimestamp(),
        });
        Alert.alert('สำเร็จ', 'อัปเดตข้อความเรียบร้อยแล้ว', [
          { text: 'ตกลง', onPress: () => navigation.goBack() }
        ]);
      } else {
        // ✅ สร้างข้อมูลใหม่ใน 'feedback_db'
        await addDoc(collection(db, "feedback_db"), {
          username: loggedInUser || 'anonymous',
          characterName: characterName || '',
          topic: topic.trim() || 'Admin',
          message: message.trim(),
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        Alert.alert('สำเร็จ', 'ส่งข้อความถึงแอดมินเรียบร้อยแล้ว', [
          { text: 'ตกลง', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error("Firebase Error:", error);
      Alert.alert('ผิดพลาดในการส่ง', error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteOrClear = () => {
    if (editItem?.id) {
      Alert.alert("ยืนยันการลบ", "คุณต้องการลบข้อความนี้ทิ้งใช่หรือไม่?", [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ", style: "destructive",
          onPress: async () => {
            setIsSending(true);
            try {
              // ✅ ลบข้อมูลออกจาก 'feedback_db'
              await deleteDoc(doc(db, "feedback_db", editItem.id));
              navigation.goBack();
            } catch (error) {
              Alert.alert('ผิดพลาด', 'ลบข้อมูลไม่สำเร็จ: ' + error.message);
              setIsSending(false);
            }
          }
        }
      ]);
    } else {
      setTopic('');
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Image source={getAvatarSource(selectedAvatar)} style={styles.avatar} resizeMode="cover" />
          </View>
          <View>
            <Text style={styles.headerTitle}>MISSION LIFE</Text>
            <Text style={styles.headerSub}>สวัสดีคุณ <Text style={styles.headerSubName}>{characterName || 'User'}</Text></Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={26} color="#AAB4C3" />
        </TouchableOpacity>
      </View>

      {/* MAIN CARD */}
      <View style={styles.mainCard}>
        <View style={styles.cardTopHeader}>
          <Text style={styles.cardTitle}>FEEDBACK TO ADMIN</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderText}>
              {editItem ? '✏️ Edit Message' : '📝 Create New Message'}
            </Text>
          </View>

          <ScrollView style={styles.formBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Topic Input */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>To Admin | </Text>
              <TextInput
                style={styles.textInputInline}
                value={topic}
                onChangeText={setTopic}
                placeholder="ระบุหัวข้อ (เช่น แจ้งปัญหา, เสนอแนะ)"
                placeholderTextColor="#AAB4C3"
              />
            </View>

            {/* Message Input */}
            <View style={styles.storyInputContainer}>
              <TextInput
                style={styles.textArea}
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
                placeholder="เขียนรายละเอียดข้อความของคุณที่นี่..."
                placeholderTextColor="#AAB4C3"
              />
            </View>
          </ScrollView>

          {/* FOOTER ACTION */}
          <View style={styles.formFooter}>
            <TouchableOpacity
              style={[styles.sendBtn, isSending && { opacity: 0.6 }]}
              onPress={handleSend}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#1A2A47" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#1A2A47" />
                  <Text style={styles.sendBtnText}>{editItem ? 'UPDATE MESSAGE' : 'SEND MESSAGE'}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteOrClear} disabled={isSending}>
              <Ionicons name={editItem ? "trash-outline" : "refresh-outline"} size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* BACK BUTTON */}
      <TouchableOpacity style={styles.previousBtn} onPress={() => navigation.goBack()} disabled={isSending}>
        <Ionicons name="arrow-back" size={20} color="#AAB4C3" />
        <Text style={styles.previousBtnText}>BACK TO LIST</Text>
      </TouchableOpacity>

      <SettingsModal visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} onLogout={onLogout} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#152033', paddingTop: Platform.OS === 'ios' ? 55 : 35, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 50, height: 50, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#4A5A73', marginRight: 12 },
  avatar: { width: '100%', height: '100%' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  headerSub: { color: '#AAB4C3', fontSize: 10 },
  headerSubName: { color: '#FFFFFF', fontWeight: 'bold' },

  mainCard: { flex: 1, backgroundColor: '#1E2B48', borderRadius: 16, borderWidth: 1, borderColor: '#3A4A63', overflow: 'hidden', marginBottom: 20 },
  cardTopHeader: { alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#3A4A63' },
  cardTitle: { color: 'white', fontSize: 14, fontWeight: 'bold', letterSpacing: 1.5 },

  formContainer: { flex: 1, margin: 15, borderRadius: 12, borderWidth: 1, borderColor: '#4A5A73', overflow: 'hidden', backgroundColor: '#151F32' },
  formHeader: { backgroundColor: '#3A4A63', padding: 12, alignItems: 'center' },
  formHeaderText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  formBody: { flex: 1, padding: 15 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#3A4A63', paddingBottom: 10, marginBottom: 15 },
  inputLabel: { color: '#F59E0B', fontWeight: 'bold', fontSize: 14 },
  textInputInline: { flex: 1, color: 'white', fontSize: 14, padding: 0, paddingLeft: 5 },

  storyInputContainer: { flex: 1 },
  textArea: { color: 'white', minHeight: 180, padding: 15, fontSize: 14, backgroundColor: '#1E2B48', borderRadius: 8, borderWidth: 1, borderColor: '#3A4A63' },

  formFooter: { flexDirection: 'row', alignItems: 'center', padding: 15, borderTopWidth: 1, borderTopColor: '#3A4A63', backgroundColor: '#1E2B48' },
  sendBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  sendBtnText: { color: '#1A2A47', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  deleteBtn: { padding: 10, borderWidth: 1, borderColor: '#EF4444', borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)' },

  previousBtn: { flexDirection: 'row', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30, backgroundColor: '#1E2B48', borderWidth: 1, borderColor: '#3A4A63' },
  previousBtnText: { color: '#AAB4C3', fontWeight: 'bold', fontSize: 12, marginLeft: 8 },
});