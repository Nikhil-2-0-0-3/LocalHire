import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator 
} from "react-native";
import StarRating from "react-native-star-rating-widget";
import { firebase } from "@react-native-firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const uid = await AsyncStorage.getItem("userId");
        if (!uid) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }
        setUserId(uid);

        const db = firebase
          .app()
          .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");

        const snapshot = await db.ref(`users/${uid}/reviews`).once("value");

        if (snapshot.exists()) {
          setReviews(Object.values(snapshot.val()));
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching user reviews:", error);
      }
      setLoading(false);
    };

    fetchUserReviews();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Reviews</Text>
      {reviews.length === 0 ? (
        <Text style={styles.noReviews}>You have no reviews yet.</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item, index) => (item.timestamp ? item.timestamp.toString() : index.toString())}
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewerName}>From: {item.reviewedByName}</Text>
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
});

export default UserReviews;