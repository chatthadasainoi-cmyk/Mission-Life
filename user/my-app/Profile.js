import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function Profile({ navigation, characterName, selectedAvatar, onBackPress }) {

  const [name, setName] = useState(characterName || '');
  const [date, setDate] = useState(new Date(2006, 8, 12));
  const [show, setShow] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(selectedAvatar);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalAvatar({ uri: result.assets[0].uri });
    }
  };

  const getAvatarSource = (source) => {
    if (!source) return require('./assets/icon.png');
    if (typeof source === 'number') return source;
    if (typeof source === 'string') return { uri: source };
    if (typeof source === 'object' && source.uri) return { uri: source.uri };
    return require('./assets/icon.png');
  };

  const formatDate = (rawDate) => {
    let d = rawDate.getDate().toString().padStart(2, '0');
    let m = (rawDate.getMonth() + 1).toString().padStart(2, '0');
    let y = (rawDate.getFullYear() + 543).toString().slice(-2);
    return `${d} / ${m} / ${y}`;
  };

  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtnContainer}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          {/* CHANGE CHARACTER Section */}
          <TouchableOpacity style={styles.characterCard} onPress={pickImage} activeOpacity={0.7}>
            <Text style={styles.cardLabel}>CHANGE CHARACTER</Text>
            <View style={styles.imageContainer}>
              <Image
                source={getAvatarSource(localAvatar)}
                style={styles.avatarLarge}
              />
              <View style={styles.topRightPlusBadge}>
                <Text style={styles.plusIconTextSmall}>+</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Name Section */}
          <Text style={styles.inputLabel}>Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="กรอกชื่อของคุณ"
              placeholderTextColor="#AAB4C3"
            />
            <Text style={styles.editIcon}>✎</Text>
          </View>

          {/* Birth Date & Age Row */}
          <View style={styles.row}>
            <View style={{ flex: 1.5, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Birth Date</Text>
              <TouchableOpacity style={styles.inputWrapper} onPress={() => setShow(true)}>
                <Text style={styles.input}>{formatDate(date)}</Text>
                <Text style={styles.editIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Age</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { textAlign: 'center' }]}
                  defaultValue="20"
                  keyboardType="numeric"
                  placeholderTextColor="#AAB4C3"
                />
              </View>
            </View>
          </View>

          {show && (
            <DateTimePicker value={date} mode="date" display="default" onChange={onChange} />
          )}

          {/* Email Section (Read Only) */}
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { color: '#AAB4C3' }]}
              defaultValue="user@email.com"
              editable={false}
            />
            <Text style={styles.editIcon}>🔒</Text>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={styles.changePassBtn}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.changePassText}>Change Password?</Text>
          </TouchableOpacity>

          {/* Save Button อยู่ใน ScrollView เพื่อให้เลื่อนเจอได้ในจอเล็ก */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว")}
          >
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
          </TouchableOpacity>
        </View>

        {/* Padding ท้ายรายการ */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A2A47' },
  scrollContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4A63',
    height: 70
  },
  backBtnContainer: { width: 40, alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  backButton: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  mainContent: { padding: 20 },
  characterCard: {
    backgroundColor: '#253552',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#4A5A73'
  },
  cardLabel: { color: 'white', fontWeight: 'bold', marginBottom: 15, fontSize: 13, letterSpacing: 1 },
  imageContainer: { position: 'relative' },
  avatarLarge: {
    width: 120,
    height: 140,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4A5A73',
    backgroundColor: '#121F35'
  },
  topRightPlusBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#253552',
  },
  plusIconTextSmall: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  inputLabel: { color: 'white', fontWeight: 'bold', marginBottom: 8, fontSize: 14, marginLeft: 4 },
  inputWrapper: {
    backgroundColor: '#253552',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
    borderWidth: 1,
    borderColor: '#4A5A73'
  },
  input: { flex: 1, color: 'white', fontSize: 15, fontWeight: 'bold' },
  editIcon: { color: '#AAB4C3', fontSize: 18 },
  row: { flexDirection: 'row' },
  saveBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveBtnText: { color: '#1A2A47', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  changePassBtn: { marginTop: 10, marginBottom: 5, alignItems: 'center' },
  changePassText: { color: 'white', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 14 },
});