import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const ChangePassword = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const reauthenticate = async () => {
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(credential);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    try {
      await reauthenticate();
      await auth().currentUser.updatePassword(newPassword);
      Alert.alert("Success", "Password updated successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <TextInput style={styles.input} placeholder="Current Password" secureTextEntry onChangeText={setCurrentPassword} placeholderTextColor="gray" />
      <TextInput style={styles.input} placeholder="New Password" secureTextEntry onChangeText={setNewPassword} placeholderTextColor="gray"/>
      <TextInput style={styles.input} placeholder="Confirm New Password" secureTextEntry onChangeText={setConfirmPassword} placeholderTextColor="gray"/>
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 50, borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 8 ,color:'black'},
  button: { backgroundColor: '#0057FF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default ChangePassword;
