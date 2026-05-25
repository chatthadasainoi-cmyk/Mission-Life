import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from './App';

export default function FeedbackScreen({ navigation, loggedInUser }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loggedInUser) {
      setIsLoading(false);
      return;
    }

    // ✅ เปลี่ยนมาดึงข้อมูลจาก 'feedback_db'
    const feedbackRef = collection(db, "feedback_db");
    const q = query(feedbackRef, where("username", "==", loggedInUser));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setFeedbacks(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Feedback Fetch Error: ", error.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loggedInUser]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FEEDBACK TO ADMIN</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* CREATE BUTTON */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('FeedbackWrite')}
      >
        <Text style={styles.createBtnText}>CREATE NEW MESSAGE  ⊕</Text>
      </TouchableOpacity>

      {/* FEEDBACK LIST */}
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 50 }} />
        ) : feedbacks.length > 0 ? (
          feedbacks.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.feedbackCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('FeedbackWrite', { editItem: item })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.topicText}>{item.topic || 'ไม่มีหัวข้อ'}</Text>
                <Text style={styles.statusText}>
                  {item.status === 'replied' ? '✅ ตอบกลับแล้ว' : '⏳ รอการตอบกลับ'}
                </Text>
              </View>
              <Text style={styles.messageText}>{item.message}</Text>

              {item.reply && (
                <View style={styles.replyBox}>
                  <Text style={styles.replyLabel}>Admin Reply:</Text>
                  <Text style={styles.replyText}>{item.reply}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>ยังไม่มีข้อความของคุณ</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#152033' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 40, height: 40, backgroundColor: '#1E2B48', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: 'white', fontSize: 18 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  createBtn: { marginHorizontal: 20, paddingVertical: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#F59E0B', marginBottom: 20 },
  createBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  feedbackCard: { backgroundColor: '#1E2B48', borderRadius: 12, padding: 16, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  topicText: { color: '#F59E0B', fontWeight: 'bold', fontSize: 15, flex: 1 },
  statusText: { color: '#AAB4C3', fontSize: 11 },
  messageText: { color: '#E2E8F0', fontSize: 13, lineHeight: 22 },
  replyBox: { marginTop: 15, backgroundColor: '#151F32', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#4ADE80' },
  replyLabel: { color: '#4ADE80', fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  replyText: { color: '#E2E8F0', fontSize: 13, lineHeight: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 50, marginBottom: 10, opacity: 0.5 },
  emptyText: { color: '#AAB4C3', fontSize: 14 },
});