import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList ,Image 
} from "react-native";
import StarRating from "react-native-star-rating-widget";
import { firebase } from "@react-native-firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

const SaveToDb = async (rating: number, feedback: string, userId: string, userName: string) => {
  try {
    const uid = await AsyncStorage.getItem("userId");
    const reviewerName = await AsyncStorage.getItem("userName");
    
    if (!uid || !reviewerName) {
      console.error("User ID or name not found");
      return;
    }

    const db = firebase
      .app()
      .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");

    // 1. Get current average rating and review count
    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    
    const currentAvg = userData.averageRating || 0;
    const reviewCount = userData.reviewCount || 0;

    // 2. Calculate new average rating
    const newAvg = (currentAvg * reviewCount + rating) / (reviewCount + 1);

    // 3. Prepare review data
    const reviewData = {
      rating,
      feedback,
      reviewedBy: uid,
      reviewedByName: reviewerName,
      reviewedUserName: userName,
      timestamp: Date.now(),
    };

    const revID = `${uid}_${reviewData.timestamp}`;

    // 4. Update all data in a single transaction
    const updates = {
      [`users/${userId}/reviews/${revID}`]: reviewData,
      [`users/${userId}/averageRating`]: newAvg,
      [`users/${userId}/reviewCount`]: reviewCount + 1
    };

    await db.ref().update(updates);
    console.log("Review and average rating updated successfully");

  } catch (error) {
    console.error("Error saving review:", error);
    throw error; // Consider throwing the error for the caller to handle
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

    await db.ref(`users/${userId}/averageRating`).set(avgRating.toFixed(1));
  } catch (error) {
    console.error("Error updating average rating:", error);
  }
};

const Reviews = ({ route }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const user = route?.params?.user;

  useEffect(() => {
    if (user?.id) {
      fetchAverageRating(user.id);
      fetchUserReviews(user.id);
      fetchUserSkills(user.id);
      console.log('entered')
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

  const fetchUserSkills = async (userId: string) => {
    try {
      const db = firebase
        .app()
        .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");

      const snapshot = await db.ref(`users/${userId}/skills`).once("value");

      if (snapshot.exists()) {
        const skills = snapshot.val();
        // Convert to array if it's not already one
        setUserSkills(Array.isArray(skills) ? skills : [skills].filter(Boolean));
      } else {
        setUserSkills([]);
      }
    } catch (error) {
      console.error("Error fetching user skills:", error);
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
      <Text style={styles.header}>User Profile</Text>

      <View style={styles.card}>
      {user.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        ) : (
          <Icon name="user" size={50} color="#4335A7" style={{ marginBottom: 10 }} />
        )}
        <Text style={styles.info}>Name: {user.name}</Text>
        <Text style={styles.info}>Location: {user.location}</Text>
        
        {/* Display user skills */}
        {userSkills.length > 0 && (
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsTitle}>Skills:</Text>
            <View style={styles.skillsList}>
              {userSkills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  {skill}
                  {index < userSkills.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          </View>
        )}
        
        <Text style={styles.avgRating}>Average Rating: {averageRating}</Text>
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
  card: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20, 
    elevation: 3 
  },
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
  skillsContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    fontSize: 14,
    color: "#555",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
});

export default Reviews;