import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';

//  นำเข้าฟังก์ชันที่จำเป็นจาก Firebase Firestore
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ForgetPasswordScreen({ db, onBackPress, onEnterPress }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckEmail = async () => {
    // ตรวจสอบว่ากรอกอีเมลหรือไม่
    if (!email.trim()) {
      Alert.alert("เตือน", "กรุณากรอกอีเมล");
      return;
    }

    setIsLoading(true);
    try {
      //  ค้นหาในคอลเลกชัน "users" ว่ามีอีเมลนี้อยู่จริงหรือไม่
      const q = query(collection(db, "users"), where("email", "==", email.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        //  เจออีเมลในระบบ: จำลองการสร้าง OTP 6 หลัก
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

        // แสดง Alert บอกรหัส (ในแอปจริงส่วนนี้ต้องส่งผ่าน Email Service)
        Alert.alert(
          "สำเร็จ",
          `ระบบได้ตรวจสอบอีเมลเรียบร้อยแล้ว\nรหัส OTP ของคุณคือ: ${generatedOTP}`,
          [{ text: "ตกลง", onPress: () => onEnterPress(email.trim(), generatedOTP) }]
        );
      } else {
        //  ไม่เจออีเมล
        Alert.alert("ผิดพลาด", "ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      {/* Forget Password Card */}
      <View style={styles.card}>
        <Text style={styles.title}>FORGET PASSWORD</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonBack]}
            onPress={onBackPress}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>BACK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonEnter]}
            onPress={handleCheckEmail}
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

  card: {
    marginTop: 50,
    backgroundColor: '#dcdcdc',
    width: '85%',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a2e4d',
    marginBottom: 25
  },

  inputGroup: {
    width: '100%',
     marginBottom: 25
    },

  label: {
    color: '#666',
    marginBottom: 5,
    fontSize: 14
  },

  input: {
    borderWidth: 2,
    borderColor: '#1a2e4d',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },

  button: {
    flex: 0.45,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5
  },
  buttonBack: { backgroundColor: '#233e63' },

  buttonEnter: {
     backgroundColor: '#1a2e4d'
    },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
});