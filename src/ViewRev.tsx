import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { firebase } from "@react-native-firebase/database";
import auth from "@react-native-firebase/auth";
import Loading from "../components/Loading";
import NavBar from "../components/NavBar";

const ViewRev = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          console.warn("User not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const id = currentUser.uid; // Use Firebase Auth UID
        setUserId(id);
        
        const reference = firebase
          .app()
          .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/")
          .ref(`users/${id}/reviews`);

        reference.on("value", (snapshot) => {
          if (snapshot.exists()) {
            const reviewsData = snapshot.val();
            const reviewsList = Object.keys(reviewsData).map((key) => ({
              id: key,
              ...reviewsData[key],
            }));
            setReviews(reviewsList);
          } else {
            setReviews([]);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavBar />
      <Text style={styles.heading}>My Reviews</Text>
      {reviews.length === 0 ? (
        <Text style={styles.noReviews}>No reviews available</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.reviewer}>Reviewer: {item.reviewedByName || "Anonymous"}</Text>
              <Text style={styles.rating}>Rating: ⭐ {item.rating}</Text>
              <Text style={styles.comment}>{item.feedback}</Text>
              <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  noReviews: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
  },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 3,
  },
  reviewer: {
    fontWeight: "bold",
  },
  rating: {
    color: "#1294FF",
  },
  comment: {
    marginTop: 5,
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
});

export default ViewRev;
