import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";

const OTPScreen = () => {
  const [recipientEmail, setRecipientEmail] = useState("");

  const sendOTP = async () => {
    if (!recipientEmail) {
      Alert.alert("Error", "Please enter recipient email");
      return;
    }

    try {
      const response = await axios.post("http://YOUR_SERVER_IP:3000/send-otp", {
        recipientEmail,
      });

      if (response.data.success) {
        Alert.alert("Success", "OTP sent to your email!");
      } else {
        Alert.alert("Error", "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert("Error", "Failed to send OTP. Check your connection.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send OTP via Email</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Recipient Email (e.g., user@example.com)"
        keyboardType="email-address"
        value={recipientEmail}
        onChangeText={setRecipientEmail}
      />
      
      <TouchableOpacity style={styles.button} onPress={sendOTP}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OTPScreen;