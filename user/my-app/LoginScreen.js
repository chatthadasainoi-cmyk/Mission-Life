import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// 1. นำเข้า Firebase SDK
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

// Config สำหรับเชื่อมต่อ Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArOQh-5ekPoY5WNgOPmoXQ6ZQdPZyo2Jc",
  authDomain: "missionlife-3c76b.firebaseapp.com",
  projectId: "missionlife-3c76b",
  storageBucket: "missionlife-3c76b.firebasestorage.app",
  messagingSenderId: "1021732205095",
  appId: "1:1021732205095:web:7a1a5030b280d300781402",
  measurementId: "G-J6PSMP07FV"
};

// ตรวจสอบสถานะ Firebase เพื่อป้องกัน App Crash จากการเชื่อมต่อซ้ำ
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function LoginScreen({ onSignUpPress, onForgetPasswordPress, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ---  ฟังก์ชันเช็คชื่อและรหัสผ่านจากฐานข้อมูล ---
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("เตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsLoading(true);

    try {
      // ค้นหาใน Collection "users" ว่ามี username และ password ที่ตรงกันไหม
      const q = query(
        collection(db, "users"),
        where("username", "==", username),
        where("password", "==", password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        //  Login สำเร็จ
        Alert.alert("สำเร็จ", "เข้าสู่ระบบเรียบร้อย!");

        //  ส่ง 'username' กลับไปให้ App.js เพื่อใช้ในการบันทึกตัวละครหน้า CreateCharacter3
        onLoginSuccess(username);
      } else {
        // ❌ Login ล้มเหลว
        Alert.alert("ผิดพลาด", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ตหรือ Rules");
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

      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>LOGIN</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity onPress={onForgetPasswordPress}>
          <Text style={styles.forgotText}>! Forget Password</Text>
        </TouchableOpacity>

        {/* ปุ่ม LOGIN */}
        <TouchableOpacity
          style={[styles.buttonLogin, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOG IN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSignUp}
          onPress={onSignUpPress}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2e4d',
    alignItems: 'center'
  },
  header: {
    marginTop: 60,
    width: '90%',
    alignItems: 'center'
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold'
  },
  headerUnderline: {
    height: 2,
    backgroundColor: '#fff',
    width: '100%',
    marginTop: 10
  },
  loginCard: {
    marginTop: 50,
    backgroundColor: '#dcdcdc',
    width: '85%',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a2e4d',
    marginBottom: 20
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15
  },
  label: {
    color: '#666',
    marginBottom: 5
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#1a2e4d',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    color: '#000'
  },
  forgotText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 20
  },
  buttonLogin: {
    backgroundColor: '#1e3a5f',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonSignUp: {
    backgroundColor: '#233e63',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    marginTop: 10
  },
  socialButton: {
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});