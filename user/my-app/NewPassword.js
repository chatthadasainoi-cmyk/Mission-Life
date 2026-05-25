import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function NewPassword({ navigation }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [secureText1, setSecureText1] = useState(true);
  const [secureText2, setSecureText2] = useState(true);

  const handleEnter = () => {
    if (newPassword === '' || confirmPassword === '') {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    Alert.alert(
      "Success", 
      "Your password has been changed!",
      [
        { 
          text: "OK", 
          onPress: () => navigation.navigate('Home') // แก้ไข: เปลี่ยนจาก Profile เป็น Home
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header สไตล์ MISSION LIFE */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MISSION LIFE</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>FORGET PASSWORD</Text>

        {/* Input: New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput 
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={secureText1}
              placeholder="Enter new password"
              placeholderTextColor="#4A5A73"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setSecureText1(!secureText1)}
            >
              <FontAwesome 
                name={secureText1 ? "eye-slash" : "eye"} 
                size={18} 
                color="#AAB4C3" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Input: Confirm New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter New Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput 
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureText2}
              placeholder="Confirm new password"
              placeholderTextColor="#4A5A73"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setSecureText2(!secureText2)}
            >
              <FontAwesome 
                name={secureText2 ? "eye-slash" : "eye"} 
                size={18} 
                color="#AAB4C3" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons Row */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A2A47', alignItems: 'center' },
  header: { marginTop: 40, width: '90%', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  headerUnderline: { height: 1, backgroundColor: '#3A4A63', width: '100%', marginTop: 15 },
  card: {
    marginTop: 60,
    backgroundColor: '#253552', 
    width: '85%',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5A73'
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 25 },
  inputGroup: { width: '100%', marginBottom: 20 },
  label: { fontSize: 13, color: '#AAB4C3', marginBottom: 8, fontWeight: 'bold' },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2A47',
    borderWidth: 1,
    borderColor: '#4A5A73',
    borderRadius: 8,
    height: 52,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#fff',
  },
  eyeIcon: { paddingHorizontal: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    width: '46%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonBack: { backgroundColor: '#3A4A63', borderColor: '#4A5A73' },
  buttonEnter: { backgroundColor: '#1A2A47', borderColor: '#fff' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});