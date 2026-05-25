import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';

export default function ForgetPassword2Screen({ route, onBackPress, onVerifySuccess }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const inputs = useRef([]);

  // ดึงค่าจาก params (ตรวจสอบว่ามีค่าส่งมาจริงไหม)
  const email = route?.params?.email || '';
  const correctOTP = route?.params?.otp || '';

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text, index) => {
    // รับเฉพาะตัวเลข
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    // เลื่อนไปช่องถัดไปอัตโนมัติ
    if (cleanText && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // กดลบแล้วย้อนกลับไปช่องก่อนหน้า
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    // 1. เตรียมค่าที่ผู้ใช้กรอก (รวมร่าง array เป็น string และลบช่องว่าง)
    const enteredOTP = otp.join('').replace(/\s/g, '');

    // 2. เตรียมค่าที่ถูกต้องจากระบบ (แปลงเป็น string และลบช่องว่าง)
    const targetOTP = correctOTP.toString().trim();

    if (enteredOTP.length < 6) {
      Alert.alert("เตือน", "กรุณากรอกรหัสให้ครบ 6 หลัก");
      return;
    }

    // ล็อกดูค่าจริงใน Terminal เพื่อ Debug
    console.log("--- ตรวจสอบรหัส ---");
    console.log("กรอกมา:", `"${enteredOTP}"`);
    console.log("เป้าหมาย:", `"${targetOTP}"`);

    // 3. เปรียบเทียบ
    if (enteredOTP === targetOTP && targetOTP !== '') {
      Alert.alert("สำเร็จ", "รหัส OTP ถูกต้อง", [
        {
          text: "ตกลง",
          onPress: () => {
            if (onVerifySuccess) {
              onVerifySuccess(email);
            } else {
              console.warn("ไม่ได้ส่ง prop onVerifySuccess มาจาก App.js");
            }
          }
        }
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

        <Text style={styles.label}>OTP</Text>

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

        <TouchableOpacity disabled={timer > 0}>
          <Text style={styles.resendText}>
            {timer > 0
              ? `Send OTP Again in 0:${timer < 10 ? `0${timer}` : timer} sec`
              : "Resend OTP Now"}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
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
  container: { flex: 1, backgroundColor: '#1a2e4d', alignItems: 'center' },
  header: { marginTop: 20, width: '95%', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerUnderline: { height: 1.5, backgroundColor: '#fff', width: '100%', marginTop: 10 },
  card: { marginTop: 80, backgroundColor: '#dcdcdc', width: '85%', borderRadius: 15, padding: 25, alignItems: 'center', elevation: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a2e4d', marginBottom: 10 },
  emailSubLabel: { fontSize: 12, color: '#1a2e4d', marginBottom: 20, opacity: 0.7 },
  label: { alignSelf: 'flex-start', color: '#7f8c8d', fontSize: 14, marginBottom: 5, marginLeft: '2%' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  otpInput: { width: 40, height: 50, backgroundColor: '#f5f6fa', borderWidth: 1.5, borderColor: '#1a2e4d', borderRadius: 5, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#1a2e4d' },
  resendText: { fontSize: 12, color: '#7f8c8d', alignSelf: 'flex-end', marginBottom: 30 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  backButton: { backgroundColor: '#2c3e50', paddingVertical: 12, borderRadius: 10, width: '45%', alignItems: 'center' },
  enterButton: { backgroundColor: '#1a2e4d', paddingVertical: 12, borderRadius: 10, width: '45%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});