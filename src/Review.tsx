import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  FlatList, 
  Image,
  ScrollView,
  SafeAreaView
} from "react-native";
import StarRating from "react-native-star-rating-widget";
import { firebase } from "@react-native-firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

const SaveToDb = async (rating: number, feedback: string, userId: string, userName: string) => {
  try {
    const uid = await AsyncStorage.getItem("userId");
    //const reviewerName = await AsyncStorage.getItem("userName");
    
    if (!uid ) {
      console.error("User ID or name not found");
      return;
    }

    const db = firebase
      .app()
      .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/");

    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();
    
    const currentAvg = userData.averageRating || 0;
    const reviewCount = userData.reviewCount || 0;

    const newAvg = Math.floor((currentAvg * reviewCount + rating) / (reviewCount + 1));

    const nameref = await db.ref(`users/${uid}/name`).once("value");
    let reviewerName = "";
    if (nameref.exists()) {
      reviewerName = nameref.val();
    } else {
      console.error("Reviewer name not found");
      return;
    }
    


    const reviewData = {
      rating,
      feedback,
      reviewedBy: uid,
      reviewedByName: reviewerName,
      reviewedUserName: userName,
      timestamp: Date.now(),
    };

    const revID = `${uid}_${reviewData.timestamp}`;

    const updates = {
      [`users/${userId}/reviews/${revID}`]: reviewData,
      [`users/${userId}/averageRating`]: newAvg,
      [`users/${userId}/reviewCount`]: reviewCount + 1
    };

    await db.ref().update(updates);
    console.log("Review and average rating updated successfully");

  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
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

  const handleSubmit = async () => {
    if (!rating || feedback.trim() === "") {
      Alert.alert("Error", "Please provide a rating and feedback.");
      return;
    }

    try {
      await SaveToDb(rating, feedback, user.id, user.name);
      Alert.alert("Success", "Thank you for your feedback!");
      setRating(0);
      setFeedback("");
      fetchUserReviews(user.id);
      fetchAverageRating(user.id);
    } catch (error) {
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  if (!user || !user.id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Icon name="exclamation-circle" size={30} color="#ff4444" />
          <Text style={styles.errorText}>No user data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>User Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Icon name="user" size={40} color="#6C63FF" />
            </View>
          )}
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.locationContainer}>
              <Icon name="map-marker" size={16} color="#6C63FF" />
              <Text style={styles.userLocation}>{user.location}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <StarRating 
                rating={rating} 
                onChange={() => {}} 
                starSize={20} 
                color="#FFD700"
                enableHalfStar
                disabled
              />
              <Text style={styles.ratingText}>{averageRating}</Text>
            </View>
          </View>
        </View>

        {/* Skills Section */}
        {userSkills.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {userSkills.map((skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Review Form */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          
          <Text style={styles.label}>Your Rating</Text>
          <StarRating 
            rating={rating} 
            onChange={setRating} 
            starSize={30} 
            color="#FFD700"
            enableHalfStar
          />

          <Text style={styles.label}>Your Feedback</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Share your experience..."
            placeholderTextColor="#999"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>User Reviews</Text>
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <Text style={styles.sortButtonText}>
                {sortOrder === "asc" ? "Lowest First" : "Highest First"}
              </Text>
              <Icon 
                name={sortOrder === "asc" ? "sort-amount-asc" : "sort-amount-desc"} 
                size={16} 
                color="#6C63FF" 
              />
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <View style={styles.noReviewsContainer}>
              <Icon name="comment-o" size={40} color="#CCCCCC" />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            </View>
          ) : (
            <FlatList
              data={reviews}
              scrollEnabled={false}
              keyExtractor={(item, index) => (item.timestamp ? item.timestamp.toString() : index.toString())}
              renderItem={({ item }) => (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{item.reviewedByName}</Text>
                    <StarRating 
                      rating={item.rating} 
                      starSize={16} 
                      color="#FFD700"
                      enableHalfStar
                      disabled
                    />
                  </View>
                  <Text style={styles.reviewText}>{item.feedback}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    marginTop: 10,
    textAlign: 'center',
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillPill: {
    backgroundColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#495057',
  },
  label: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 10,
    fontWeight: '500',
  },
  feedbackInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  noReviewsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default Reviews;