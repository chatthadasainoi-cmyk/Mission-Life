import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// นำเข้าฟังก์ชันที่จำเป็นจาก Firebase
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

// ✅ เพิ่ม route เข้ามาใน Props เพื่อรับค่าจาก params
export default function ForgetPassword3Screen({ db, route, onBackPress, onEnterPress }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ ดึงค่า email ที่ส่งมาจากหน้า ForgetPassword2
  const { email } = route.params || {};

  const handleResetPassword = async () => {
    // ตรวจสอบว่ามี email หรือไม่ (ป้องกัน Error undefined ใน where)
    if (!email) {
      Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลอีเมล กรุณาทำรายการใหม่จากหน้าแรก");
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกรหัสผ่านให้ครบทั้ง 2 ช่อง");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      // ค้นหาเอกสารของผู้ใช้ที่ตรงกับ email ใน Firestore
      const q = query(collection(db, "users"), where("email", "==", email.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // อัปเดตรหัสผ่านใน Firestore
        const userDocRef = querySnapshot.docs[0].ref;
        await updateDoc(userDocRef, {
          password: newPassword
        });

        Alert.alert("สำเร็จ", "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว", [
          { text: "ตกลง", onPress: () => onEnterPress() }
        ]);
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลผู้ใช้ในระบบ");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      // ✅ จะไม่เกิด Error undefined แล้วเพราะเราเช็ค !email ไว้ด้านบน
      Alert.alert("Error", "ไม่สามารถเปลี่ยนรหัสผ่านได้ในขณะนี้: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>FORGET PASSWORD</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder=""
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter New Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder=""
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            {/* ปุ่ม BACK */}
            <TouchableOpacity style={[styles.button, styles.buttonBack]} onPress={onBackPress}>
               <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>

            {/* ปุ่ม ENTER */}
            <TouchableOpacity style={[styles.button, styles.buttonEnter]} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>ENTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a2e4d' },
  topHeader: { alignItems: 'center', paddingVertical: 15 },
  topHeaderText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerUnderline: { height: 2, backgroundColor: '#fff', width: '95%', marginTop: 10 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingTop: 50, paddingBottom: 30 },
  card: {
    backgroundColor: '#D9D9D9',
    width: '85%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a2e4d', marginBottom: 25 },
  inputGroup: { width: '100%', marginBottom: 20 },
  label: { fontSize: 14, color: '#1a2e4d', marginBottom: 5, fontWeight: '500' },
  passwordWrapper: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1a2e4d',
    borderRadius: 5,
    height: 50
  },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 16, color: '#000' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  button: { paddingVertical: 12, borderRadius: 10, width: '45%', alignItems: 'center' },
  buttonBack: { backgroundColor: '#2c3e50' },
  buttonEnter: { backgroundColor: '#1a2e4d' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});