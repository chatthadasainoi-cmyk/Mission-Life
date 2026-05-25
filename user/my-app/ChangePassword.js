import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function ChangePassword({ navigation, loggedInUser, db, onBackPress }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!loggedInUser) {
        setIsLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "users"), where("username", "==", loggedInUser));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setEmail(userData.email || '');
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserEmail();
  }, [loggedInUser]);

  const handleEnter = () => {
    if (!email) {
      Alert.alert("ผิดพลาด", "ไม่พบข้อมูลอีเมลในระบบ");
      return;
    }

    // ✅ ส่งข้อมูลไปยังหน้า OTPChange
    // หมายเหตุ: ในระบบจริง ตรง 'otp' ควรจะส่งผ่าน Service ส่งอีเมล
    // แต่สำหรับการทดสอบ เราจะส่งรหัส '123456' ไปให้หน้าถัดไปตรวจสอบครับ
    navigation.navigate('OTPChange', {
      email: email,
      otp: '123456'
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inner}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>MISSION LIFE</Text>
            <View style={styles.headerUnderline} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>FORGET PASSWORD</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                editable={false}
                placeholder="Loading email..."
                placeholderTextColor="#AAB4C3"
              />
              <Text style={styles.infoText}>*รหัส OTP จะถูกส่งไปยังอีเมลนี้</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonBack]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.buttonText}>BACK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonEnter]}
                onPress={handleEnter}
              >
                <Text style={styles.buttonText}>ENTER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A2A47' },
  inner: { flex: 1, alignItems: 'center', width: '100%' },
  header: { marginTop: 40, width: '90%', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  headerUnderline: { height: 1, backgroundColor: '#3A4A63', width: '100%', marginTop: 15 },
  card: {
    marginTop: 60, backgroundColor: '#253552', width: '85%', borderRadius: 16,
    padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#4A5A73', elevation: 5
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 25 },
  inputGroup: { width: '100%', marginBottom: 25 },
  label: { color: '#AAB4C3', marginBottom: 8, fontSize: 14, fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#4A5A73', borderRadius: 8, padding: 12,
    backgroundColor: '#1A2A47', color: '#fff', fontSize: 14, fontWeight: 'bold'
  },
  infoText: { color: '#AAB4C3', fontSize: 10, marginTop: 8, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  button: { flex: 0.45, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  buttonBack: { backgroundColor: '#3A4A63', borderColor: '#4A5A73' },
  buttonEnter: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});