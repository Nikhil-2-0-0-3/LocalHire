import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';



const SaveToDb = async (rating:number,feedback:string,userId:string) => {
    const uid = await AsyncStorage.getItem('userId'); // Ensure correct retrieval of UID
    if (!uid) {
        console.error("User ID not found");
        return;
    }


    console.log(rating,feedback)
    const userData = {
        rating:rating,
        feedback:feedback,
        reviewedBy:uid,
      };
    const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
    const timestamp = Date.now();
    const revID= `${uid}_${timestamp}`

    db.ref(`users/${userId}/reviews/${revID}`).update(userData)
        .then(() => {console.log("Skills saved successfully"
        )})
        .catch((error) => console.error("Error saving skills:", error));
};


const Reviews = ({ route }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const user = route?.params?.user;

  
  const handleSubmit = () => {
    if (!rating || feedback.trim() === "") {
      Alert.alert("Error", "Please provide a rating and feedback.");
      return;
    }

    //Alert.alert("Review Submitted", `Rating: ${rating}\nFeedback: ${feedback}`);
    SaveToDb(rating,feedback,user.uid)
    setRating(0);
    setFeedback("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Employee Review</Text>
      
      <View style={styles.card}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.info}>Name: {user.name}</Text>
      <Text style={styles.info}>Location: {user.location}</Text>
      </View>

      <Text style={styles.label}>Rating:</Text>
      <StarRating rating={rating} onChange={setRating} starSize={30} color="#f39c12" />

      <Text style={styles.label}>Feedback:</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Write feedback here..."
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detail: {
    fontSize: 16,
    color: "#555",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default Reviews;