import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TouchableWithoutFeedback, Alert, Platform
} from 'react-native';

// ✅ 1. เพิ่ม onFeedback ตรงนี้
const SettingsModal = ({ visible, onClose, onLogout, onProfile, onGuide, onFeedback }) => {

  const handleLogoutPress = () => {
    Alert.alert(
      "ยืนยันการออกจากระบบ",
      "คุณต้องการออกจากระบบใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ตกลง",
          onPress: () => {
            onClose();
            if (onLogout) onLogout();
          },
          style: "destructive"
        }
      ]
    );
  };

  // ✅ ฟังก์ชันช่วยปิด Modal ก่อนเปลี่ยนหน้า
  const handleAction = (action) => {
    onClose();
    if (action) action();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              {/* ✅ เรียกใช้ onProfile */}
              <TouchableOpacity style={styles.menuItem} onPress={() => handleAction(onProfile)}>
                <Text style={styles.menuIcon}>👤</Text>
                <Text style={styles.menuText}>PROFILE</Text>
              </TouchableOpacity>

              {/* ✅ 2. เพิ่ม onPress ตรงนี้ */}
              <TouchableOpacity style={styles.menuItem} onPress={() => handleAction(onFeedback)}>
                <Text style={styles.menuIcon}>💬</Text>
                <Text style={styles.menuText}>FEEDBACK</Text>
              </TouchableOpacity>

              {/* ✅ เรียกใช้ onGuide */}
              <TouchableOpacity style={styles.menuItem} onPress={() => handleAction(onGuide)}>
                <Text style={styles.menuIcon}>📔</Text>
                <Text style={styles.menuText}>GUIDE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.lastItem]}
                onPress={handleLogoutPress}
              >
                <Text style={styles.menuIcon}>↪️</Text>
                <Text style={[styles.menuText, { color: '#FF6B6B' }]}>LOG OUT</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ... styles เดิมของคุณคงเดิม ...
const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    right: 20,
    backgroundColor: '#253552', borderRadius: 12, borderWidth: 1, borderColor: '#4A5A73', width: 180,
    elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#3A4A63' },
  lastItem: { borderBottomWidth: 0 },
  menuIcon: { fontSize: 18, marginRight: 15 },
  menuText: { color: 'white', fontSize: 14, fontWeight: '600', letterSpacing: 0.8 },
});

export default SettingsModal;