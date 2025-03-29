import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/database';
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const clearAndNavigate = (navigation) => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0, // The active screen index
      routes: [{ name: 'Details' }], // Replace with your target screen
    })
  );
};

const UserProfile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profileImage: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser; // Get logged-in user from Firebase Auth

      if (user) {
        const userId = user.uid;
        const reference = firebase
          .app()
          .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/')
          .ref(`users/${userId}`);

        reference.once('value').then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData({
              name: data.name || 'N/A',
              email: user.email || 'Unknown',
              profileImage: data.profileImage || null, // Ensure your database has this field
            });
          }
          setLoading(false);
        }).catch((error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await auth().signOut();
              await AsyncStorage.clear();
              clearAndNavigate(navigation)
              //navigation.replace("Details"); // Redirect to Login screen
            } catch (error) {
              console.error("Logout Error:", error);
            }
          },
          style: "destructive",
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0057FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <View>
      <Text style={styles.account}>Accounts & Settings</Text>
    </View>

    <View style={styles.profile}>
      <View style={styles.roundWhiteView}>
        {userData.profileImage ? (
          <Image source={{ uri: userData.profileImage }} style={styles.image} />
        ) : (
          <Image source={require('./assets/image.png')} style={styles.image} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>
    </View>

    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangeP')}>
      <Image source={require('./assets/Frame.png')} style={styles.icon} />
      <Text style={styles.menuText}>Change Password</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ChangeP')}>
        <Image source={require('./assets/chevron-right.png')} style={styles.chevron} />
      </TouchableOpacity>
    </TouchableOpacity>

    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Wp')}>
      <Image source={require('./assets/Frame.png')} style={styles.icon} />
      <Text style={styles.menuText}>Wp</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ChangeP')}>
        <Image source={require('./assets/chevron-right.png')} style={styles.chevron} />
      </TouchableOpacity>
    </TouchableOpacity>

    

    <View style={styles.logout}>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Image source={require('./assets/logout.png')} style={[styles.icon, { tintColor: '#FFFFFF' }]} />
        <Text style={styles.logoutText}>Logout</Text>
        <Image source={require('./assets/chevron-right.png')} style={[styles.chevron, styles.logoutChevron]} />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
container: { flex: 1, paddingHorizontal: 20 },
account: { fontWeight: '800', fontSize: 25, marginTop: 30, marginBottom: 20, textAlign: 'center' },
profile: { height: 120, backgroundColor: '#0057FF', borderRadius: 25, flexDirection: 'row', marginBottom: 30, paddingHorizontal: 15, alignItems: 'center' },
roundWhiteView: { width: 64, height: 64, backgroundColor: '#FFFFFF', borderRadius: 75, alignItems: 'center', justifyContent: 'center' },
textContainer: { marginLeft: 20, justifyContent: 'center' },
name: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
email: { fontSize: 14, fontWeight: '300', color: '#FFFFFF' },
image: { width: 50, height: 50, borderRadius: 25 },
menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
icon: { width: 24, height: 24, marginRight: 15 },
menuText: { flex: 1, fontSize: 16, color: '#333',left:20 },
chevron: { width: 20, height: 20 },
logout: { marginTop: 50 },
logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5020B', padding: 15, borderRadius: 25 },
logoutText: { flex: 1, fontSize: 16, color: '#FFFFFF', textAlign: 'center' },
logoutChevron: { tintColor: '#FFFFFF' },
});

export default UserProfile;