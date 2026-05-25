import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyArOQh-5ekPoY5WNgOPmoXQ6ZQdPZyo2Jc",
  authDomain: "missionlife-3c76b.firebaseapp.com",
  projectId: "missionlife-3c76b",
  storageBucket: "missionlife-3c76b.firebasestorage.app",
  messagingSenderId: "1021732205095",
  appId: "1:1021732205095:web:7a1a5030b280d300781402"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

import LoginScreen from './LoginScreen';
import RegisterScreen from './Register';
import ForgetPassword from './ForgetPassword';
import ForgetPassword2 from './ForgetPassword2';
import ForgetPassword3 from './ForgetPassword3';
import Home from './home';
import CreateCharacterScreen from './CreateCharacter';
import CreateCharacter2 from './CreateCharacter2';
import CreateCharacter3 from './CreateCharacter3';
import Quest from './quest';
import CreateMission from './CreateMission';
import CreateMission2 from './CreateMission2';
import CreateMission3 from './CreateMission3';
import CreateMonster from './CreateMonster';
import MissionBattle from './MissionBattle';
import Trophy from './trophy';
import HistoryList from './HistoryList';
import Profile from './Profile';
import FeedbackScreen from './FeedbackScreen';       // ✅
import FeedbackWriteScreen from './feedbackWrite';   // ✅
import GuideScreen from './GuideScreen'; // (เปลี่ยนชื่อไฟล์ให้ตรงกับที่คุณตั้งไว้)

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [hasCharacter, setHasCharacter] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [characterImage, setCharacterImage] = useState(null);

  const checkCharacterStatus = async (username) => {
    if (!username) return;
    setIsChecking(true);
    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData && userData.characterName && userData.characterName.trim() !== "") {
          setCharacterName(userData.characterName);
          if (userData.avatarSource) {
            const rawSource = userData.avatarSource;
            const finalUri = typeof rawSource === 'object' ? rawSource.uri : rawSource;
            setCharacterImage(finalUri);
          }
          setHasCharacter(true);
        } else {
          setHasCharacter(false);
        }
      } else {
        setHasCharacter(false);
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Database Error: ", error);
      setIsLoggedIn(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
    checkCharacterStatus(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setHasCharacter(false);
    setCharacterName('');
    setCharacterImage(null);
  };

  const getCommonProps = (props) => ({
    ...props,
    db,
    storage,
    loggedInUser: currentUser,
    characterName,
    selectedAvatar: characterImage,
    onLogout: handleLogout,
    onNavigate: (page, data) => props.navigation.navigate(page, data),
  });

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>กำลังดึงข้อมูลนักล่าภารกิจ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!isLoggedIn ? (
            <Stack.Group>
              <Stack.Screen name="LoginScreen">
                {(props) => (
                  <LoginScreen
                    {...getCommonProps(props)}
                    onLoginSuccess={handleLoginSuccess}
                    onSignUpPress={() => props.navigation.navigate('Register')}
                    onForgetPasswordPress={() => props.navigation.navigate('ForgetPassword')}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="Register">
                {(props) => (
                  <RegisterScreen
                    {...getCommonProps(props)}
                    onBackPress={() => props.navigation.goBack()}
                    onEnterPress={() => props.navigation.navigate('LoginScreen')}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="ForgetPassword">
                {(props) => (
                  <ForgetPassword
                    {...getCommonProps(props)}
                    onEnterPress={(email, otp) => props.navigation.navigate('ForgetPassword2', { email, otp })}
                    onNextPress={(email, otp) => props.navigation.navigate('ForgetPassword2', { email, otp })}
                    onBackPress={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="ForgetPassword2">
                {(props) => (
                  <ForgetPassword2
                    {...getCommonProps(props)}
                    route={props.route}
                    onVerifySuccess={(email) => props.navigation.navigate('ForgetPassword3', { email })}
                    onBackPress={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="ForgetPassword3">
                {(props) => (
                  <ForgetPassword3
                    {...getCommonProps(props)}
                    onEnterPress={() => props.navigation.navigate('LoginScreen')}
                    onBackPress={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>
            </Stack.Group>
          ) : (
            <Stack.Group>
              {!hasCharacter ? (
                <Stack.Group>
                  <Stack.Screen name="CreateCharacter">
                    {(props) => (
                      <CreateCharacterScreen
                        {...getCommonProps(props)}
                        onNameChange={(name) => setCharacterName(name)}
                        onSelectAvatar={(img) => {
                          if (typeof img === 'string') setCharacterImage(img);
                          else if (img?.uri) setCharacterImage(img.uri);
                          else setCharacterImage(img);
                        }}
                        onNextPress={() => props.navigation.navigate('CreateCharacter2')}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="CreateCharacter2">
                    {(props) => (
                      <CreateCharacter2
                        {...getCommonProps(props)}
                        characterImage={characterImage}
                        characterName={characterName}
                        onBackPress={() => props.navigation.goBack()}
                        onNextPress={() => props.navigation.navigate('CreateCharacter3')}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="CreateCharacter3">
                    {(props) => (
                      <CreateCharacter3
                        {...getCommonProps(props)}
                        username={currentUser}
                        onBackPress={() => props.navigation.goBack()}
                        onEnterPress={() => { checkCharacterStatus(currentUser); }}
                      />
                    )}
                  </Stack.Screen>
                </Stack.Group>
              ) : (
                <Stack.Group>

                  <Stack.Screen name="Home">
                    {(props) => (
                      <Home
                        {...getCommonProps(props)}
                        db={db}
                        loggedInUser={currentUser}
                        navigation={props.navigation}
                        onGoToQuest={() => props.navigation.navigate('Quest')}
                        onGoToTrophy={() => props.navigation.navigate('Trophy')}
                        onGoToHistoryList={() => props.navigation.navigate('History')}
                        onGoToProfile={() => props.navigation.navigate('Profile')}
                        onGoToFeedback={() => props.navigation.navigate('Feedback')}
                        onGoToGuide={() => props.navigation.navigate('Guide')}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="Quest">
                    {(props) => (
                      <Quest
                        {...getCommonProps(props)}
                        db={db}
                        loggedInUser={currentUser}
                        onGoToHome={() => props.navigation.navigate('Home')}
                        onGoToTrophy={() => props.navigation.navigate('Trophy')}
                        onGoToHistoryList={() => props.navigation.navigate('History')}
                        onGoToProfile={() => props.navigation.navigate('Profile')}
                        onGoToFeedback={() => props.navigation.navigate('Feedback')}
                        onGoToGuide={() => props.navigation.navigate('Guide')}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="CreateMission">
                    {(props) => (
                      <CreateMission
                        {...getCommonProps(props)}
                        onNextPress={(data) => props.navigation.navigate('CreateMission2', data)}
                        onBackPress={() => props.navigation.goBack()}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="CreateMission2">
                    {(props) => (
                      <CreateMission2
                        {...getCommonProps(props)}
                        onBackPress={() => props.navigation.goBack()}
                        onNextPress={(data) => props.navigation.navigate('CreateMission3', data)}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="CreateMission3">
                    {(props) => (
                      <CreateMission3
                        {...getCommonProps(props)}
                        onBackPress={() => props.navigation.goBack()}
                        onNextPress={(data) => {
                          props.navigation.navigate('CreateMonster', {
                            ...props.route.params,
                            ...data,
                            characterName,
                            avatarSource: characterImage
                          });
                        }}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="CreateMonster">
                    {(props) => (
                      <CreateMonster
                        {...getCommonProps(props)}
                        loggedInUser={currentUser}
                        characterName={characterName}
                        selectedAvatar={characterImage}
                        onBackPress={() => props.navigation.goBack()}
                        onEnterPress={() => {
                          props.navigation.navigate('Quest', { refresh: true, updatedAt: Date.now() });
                        }}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="MissionBattle">
                    {(props) => <MissionBattle {...getCommonProps(props)} />}
                  </Stack.Screen>

                  <Stack.Screen name="Trophy">
                    {(props) => (
                      <Trophy
                        {...getCommonProps(props)}
                        onGoToHome={() => props.navigation.navigate('Home')}
                        onGoToQuest={() => props.navigation.navigate('Quest')}
                        onGoToHistoryList={() => props.navigation.navigate('History')}
                        onGoToProfile={() => props.navigation.navigate('Profile')}
                        onGoToFeedback={() => props.navigation.navigate('Feedback')}
                        onGoToGuide={() => props.navigation.navigate('Guide')}
                        onLogout={handleLogout}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="History">
                    {(props) => (
                      <HistoryList
                        {...getCommonProps(props)}
                        db={db}
                        loggedInUser={currentUser}
                        navigation={props.navigation}
                        onGoToHome={() => props.navigation.navigate('Home')}
                        onGoToQuest={() => props.navigation.navigate('Quest')}
                        onGoToTrophy={() => props.navigation.navigate('Trophy')}
                        onGoToProfile={() => props.navigation.navigate('Profile')}
                        onGoToFeedback={() => props.navigation.navigate('Feedback')}
                        onGoToGuide={() => props.navigation.navigate('Guide')}
                        onLogout={handleLogout}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="Profile">
                    {(props) => (
                      <Profile
                        {...getCommonProps(props)}
                        onBackPress={() => props.navigation.goBack()}
                        onUpdateProfile={checkCharacterStatus}
                      />
                    )}
                  </Stack.Screen>

                  {/* ✅ Feedback */}
                  <Stack.Screen name="Feedback">
                    {(props) => (
                      <FeedbackScreen
                        {...getCommonProps(props)}
                        navigation={props.navigation}
                      />
                    )}
                  </Stack.Screen>

                  {/* ✅ FeedbackWrite */}
                  <Stack.Screen name="FeedbackWrite">
                    {(props) => (
                      <FeedbackWriteScreen
                        {...getCommonProps(props)}
                        navigation={props.navigation}
                        route={props.route}
                      />
                    )}
                  </Stack.Screen>

                  <Stack.Screen name="Guide">
                    {(props) => (
                        <GuideScreen
                        {...getCommonProps(props)}
                        navigation={props.navigation}
                        />
                        )}
                  </Stack.Screen>

                </Stack.Group>
              )}
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#1a2e4d', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 15, fontWeight: 'bold' }
});