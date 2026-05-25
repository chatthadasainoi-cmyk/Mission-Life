import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Keyboard
} from 'react-native';

// ✅ เปลี่ยนชื่อเป็น OTPChange เพื่อให้ระบบหาเจอ
export default function OTPChange({ navigation, route }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const inputs = useRef([]);

  // ดึงค่า email ที่ส่งมาจากหน้า ChangePassword
  const { email } = route.params || { email: 'User@email.com' };

  // ในที่นี้เราจะสมมติรหัส OTP เป็น '123456' สำหรับทดสอบ (หรือรับจาก route.params)
  const targetOTP = route.params?.otp || '123456';

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const enteredOTP = otp.join('').trim();

    if (enteredOTP.length < 6) {
      Alert.alert("เตือน", "กรุณากรอกรหัสให้ครบ 6 หลัก");
      return;
    }

    if (enteredOTP == targetOTP) {
      Alert.alert("สำเร็จ", "รหัส OTP ถูกต้อง", [
        { text: "ตกลง", onPress: () => navigation.navigate('Profile') } // ย้อนกลับไป Profile หรือหน้าตั้งรหัสใหม่
      ]);
    } else {
      Alert.alert("ผิดพลาด", "รหัส OTP ไม่ถูกต้อง");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>VERIFY OTP</Text>
        <Text style={styles.emailSubLabel}>รหัสถูกส่งไปที่: {email}</Text>

        <Text style={styles.label}>กรอกรหัส 6 หลัก</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              ref={(ref) => (inputs.current[index] = ref)}
            />
          ))}
        </View>

        <TouchableOpacity disabled={timer > 0} style={{ alignSelf: 'flex-end' }}>
          <Text style={styles.resendText}>
            {timer > 0
              ? `ส่งรหัสอีกครั้งใน 0:${timer < 10 ? `0${timer}` : timer}`
              : "ขอรหัส OTP ใหม่ตอนนี้"}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>BACK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.enterButton}
            onPress={handleVerify}
          >
            <Text style={styles.buttonText}>ENTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A2A47', alignItems: 'center' },
  header: { marginTop: 40, width: '90%', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  headerUnderline: { height: 1, backgroundColor: '#3A4A63', width: '100%', marginTop: 15 },
  card: {
    marginTop: 60,
    backgroundColor: '#253552',
    width: '85%',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5A73',
    elevation: 10
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10, letterSpacing: 1 },
  emailSubLabel: { fontSize: 12, color: '#AAB4C3', marginBottom: 25, textAlign: 'center' },
  label: { alignSelf: 'flex-start', color: '#fff', fontSize: 13, marginBottom: 10, fontWeight: 'bold' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  otpInput: {
    width: 40,
    height: 55,
    backgroundColor: '#1A2A47',
    borderWidth: 1.5,
    borderColor: '#4A5A73',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  resendText: { fontSize: 12, color: '#AAB4C3', marginBottom: 30 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  backButton: { backgroundColor: '#3A4A63', paddingVertical: 14, borderRadius: 10, width: '46%', alignItems: 'center', borderWidth: 1, borderColor: '#4A5A73' },
  enterButton: { backgroundColor: '#F59E0B', paddingVertical: 14, borderRadius: 10, width: '46%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});