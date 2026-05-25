import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// 1. Firebase Setup
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArOQh-5ekPoY5WNgOPmoXQ6ZQdPZyo2Jc",
  authDomain: "missionlife-3c76b.firebaseapp.com",
  projectId: "missionlife-3c76b",
  storageBucket: "missionlife-3c76b.firebasestorage.app",
  messagingSenderId: "1021732205095",
  appId: "1:1021732205095:web:7a1a5030b280d300781402",
  measurementId: "G-J6PSMP07FV"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function RegisterScreen({ onBackPress, onEnterPress }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('0');
  const [birthDateText, setBirthDateText] = useState('');
  const [date, setDate] = useState(new Date());

  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันคำนวณอายุอัตโนมัติเมื่อเลือกวันที่
  const onChangeDate = (event, selectedDate) => {
    // ปิดหน้าต่างปฏิทินทันที (สำคัญสำหรับ Android)
    setShowDatePicker(false);

    if (selectedDate) {
      setDate(selectedDate);
      let fDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
      setBirthDateText(fDate);

      const today = new Date();
      let calculatedAge = today.getFullYear() - selectedDate.getFullYear();
      if (today < new Date(today.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge.toString());
    }
  };

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("เตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("เตือน", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      // ตรวจสอบชื่อผู้ใช้ซ้ำ
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert("เตือน", "Username นี้ถูกใช้งานแล้ว");
        setIsLoading(false);
        return;
      }

      // บันทึกข้อมูลลง Firestore
      await addDoc(collection(db, "users"), {
        username: username,
        email: email.trim().toLowerCase(),
        password: password,
        age: parseInt(age),
        birthDate: birthDateText,
        characterName: "",
        avatarSource: "",
        createdAt: new Date().toISOString()
      });

      Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อย!", [
        { text: "ตกลง", onPress: () => onEnterPress() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.signUpCard}>
          <Text style={styles.signUpTitle}>SIGN UP</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Birth Date & Age */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1.5, marginRight: 10 }]}>
              <Text style={styles.label}>Birth date</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.inputWithIcon}
                onPress={() => setShowDatePicker(true)}
              >
                <TextInput
                  style={[styles.inputFlex, { color: '#1a2e4d' }]}
                  placeholder="DD/MM/YYYY"
                  value={birthDateText}
                  editable={false}
                />
                <FontAwesome name="calendar" size={18} color="#1a2e4d" style={styles.icon} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.ageBox}>
                <Text style={styles.ageText}>{age}</Text>
              </View>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              maximumDate={new Date()} // เลือกได้ไม่เกินวันปัจจุบัน
              onChange={onChangeDate}
            />
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                secureTextEntry={!showPassword}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={18} color="#888" style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter Password</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFlex}
                secureTextEntry={!showPassword}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.buttonBack]} onPress={onBackPress}>
              <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonEnter]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>ENTER</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2e4d' },
  scrollContainer: { alignItems: 'center', paddingBottom: 40 },
  header: { marginTop: 40, width: '90%', alignItems: 'center', alignSelf: 'center' },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerUnderline: { height: 2, backgroundColor: '#fff', width: '100%', marginTop: 10 },
  signUpCard: { marginTop: 30, backgroundColor: '#dcdcdc', width: '85%', borderRadius: 15, padding: 25, alignItems: 'center', elevation: 10 },
  signUpTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a2e4d', marginBottom: 20 },
  inputGroup: { width: '100%', marginBottom: 12 },
  label: { color: '#666', marginBottom: 4, fontSize: 13 },
  row: { flexDirection: 'row', width: '100%', alignItems: 'flex-end' },
  input: { borderWidth: 2, borderColor: '#1a2e4d', borderRadius: 5, padding: 8, backgroundColor: '#fff', fontSize: 16 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#1a2e4d', borderRadius: 5, backgroundColor: '#fff' },
  inputFlex: { flex: 1, padding: 8, fontSize: 16 },
  icon: { paddingHorizontal: 10 },
  ageBox: { height: 45, backgroundColor: '#fff', borderWidth: 2, borderColor: '#1a2e4d', borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  ageText: { fontSize: 18, fontWeight: 'bold', color: '#1a2e4d' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25 },
  button: { flex: 0.45, paddingVertical: 12, borderRadius: 10, alignItems: 'center', elevation: 5 },
  buttonBack: { backgroundColor: '#233e63' },
  buttonEnter: { backgroundColor: '#1a2e4d' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});