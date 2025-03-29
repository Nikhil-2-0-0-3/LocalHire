import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList 
} from "react-native";
import StarRating from "react-native-star-rating-widget";
import { firebase } from "@react-native-firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";


const SaveToDb = async (rating: number, feedback: string, userId: string, userName: string) => {
  try {
    const uid = await AsyncStorage.getItem("userId");
    const reviewerName = await AsyncStorage.getItem("userName"); 

    if (!uid || !reviewerName) {
      console.error("User ID or name not found");
      return;
    }

    const userData = {
      rating,
      feedback,
      reviewedBy: uid,
      reviewedByName: reviewerName,
      reviewedUserName: userName,
      timestamp: Date.now(),
    };

    const db = firebase
      .app()
      .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");
    
    const revID = `${uid}_${userData.timestamp}`;

    await db.ref(`users/${userId}/reviews/${revID}`).set(userData);
    console.log("Review saved successfully");

    await updateAverageRating(userId);
  } catch (error) {
    console.error("Error saving review:", error);
  }
};

const updateAverageRating = async (userId: string) => {
  try {
    const db = firebase
      .app()
      .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");

    const snapshot = await db.ref(`users/${userId}/reviews`).once("value");

    if (!snapshot.exists()) return;

    const reviews = snapshot.val();
    const reviewList = Object.values(reviews).filter((review: any) => review && review.rating !== undefined);

    if (reviewList.length === 0) return;

    const totalRating = reviewList.reduce((sum, review: any) => sum + Number(review.rating), 0);
    const avgRating = totalRating / reviewList.length;

    await db.ref(`users/${userId}/averageRating`).set(avgRating.toFixed(1)); // Store only 1 decimal place
  } catch (error) {
    console.error("Error updating average rating:", error);
  }
};


const Reviews = ({ route }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" (highest first), "asc" (lowest first)
  const user = route?.params?.user;
  console.log('user',user)

  useEffect(() => {
    console.log('enter the reviews')
    
    if (user?.id) {
      fetchAverageRating(user.id);
      fetchUserReviews(user.id);
    }
  }, [user, sortOrder]);

  const fetchAverageRating = async (userId: string) => {
    try {
      const db = firebase
        .app()
        .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");

      const snapshot = await db.ref(`users/${userId}/averageRating`).once("value");

      if (snapshot.exists()) {
        setAverageRating(snapshot.val());
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  };

  const fetchUserReviews = async (userId: string) => {
    try {
      const db = firebase
        .app()
        .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");

      const snapshot = await db.ref(`users/${userId}/reviews`).once("value");

      if (snapshot.exists()) {
        let reviewsArray = Object.values(snapshot.val());

        // Sort reviews based on selected order
        reviewsArray.sort((a: any, b: any) => 
          sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
        );

        setReviews(reviewsArray);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  if (!user || !user.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: No user data found.</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!rating || feedback.trim() === "") {
      Alert.alert("Error", "Please provide a rating and feedback.");
      return;
    }

    await SaveToDb(rating, feedback, user.id, user.name);

    Alert.alert("Review Submitted", "Thank you for your feedback!");
    setRating(0);
    setFeedback("");

    fetchUserReviews(user.id);
    fetchAverageRating(user.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Employee Review</Text>

      <View style={styles.card}>
        <Text style={styles.title}>User Profile</Text>
        <Text style={styles.info}>Name: {user.name}</Text>
        <Text style={styles.info}>Location: {user.location}</Text>
        <Text style={styles.avgRating}>Average Rating: {averageRating.toFixed(1)}</Text>
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

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by: </Text>
        <TouchableOpacity onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          <Text style={styles.sortText}>
            {sortOrder === "asc" ? "Lowest First" : "Highest First"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.reviewHeader}>User Reviews:</Text>
      {reviews.length === 0 ? (
        <Text style={styles.noReviews}>No reviews available</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, index) => (item.timestamp ? item.timestamp.toString() : index.toString())}
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewerName}>{item.reviewedByName}</Text>
              <StarRating rating={item.rating} starSize={20} color="#f39c12" disabled />
              <Text style={styles.reviewText}>{item.feedback}</Text>
              <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 20, elevation: 3 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 5 },
  avgRating: { fontSize: 18, fontWeight: "bold", marginTop: 10, color: "#f39c12" },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  textInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: "top",
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
  sortContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sortLabel: { fontSize: 16, color: "#000" },
  sortText: { fontSize: 16, color: "#007bff" },
  reviewHeader: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  noReviews: { fontSize: 16, color: "#777", textAlign: "center", marginTop: 20 },
  reviewItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    elevation: 2,
  },
  reviewerName: { fontSize: 18, fontWeight: "bold" },
  reviewText: { fontSize: 16, marginVertical: 5 },
  timestamp: { fontSize: 12, color: "#777" },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 20 },
});

export default Reviews;
