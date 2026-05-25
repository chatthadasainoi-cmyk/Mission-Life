import React, { createContext, useState } from 'react';

// สร้าง Context สำหรับเก็บข้อมูลผู้ใช้
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 1. เก็บข้อมูลรูปโปรไฟล์
  const [profileImage, setProfileImage] = useState('https://i.ibb.co/vz6mD0r/avatar.png');

  // 2. เพิ่ม State สำหรับเก็บชื่อผู้ใช้ (ค่าเริ่มต้นคือ SMART)
  const [userName, setUserName] = useState('SMART'); 

  return (
    // ส่งทั้งรูปภาพ (profileImage) และชื่อ (userName) ไปยัง Provider
    <UserContext.Provider value={{ 
      profileImage, 
      setProfileImage, 
      userName, 
      setUserName 
    }}>
      {children}
    </UserContext.Provider>
  );
};