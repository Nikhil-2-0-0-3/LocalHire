import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { firebase } from "@react-native-firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/EvilIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  JobDetails: undefined;
  AllUser:undefined; // Define the route and its parameters (if any)
  // Add other routes here
};
type JobDetails2ScreenNavigationProp = StackNavigationProp<RootStackParamList, "JobDetails">;
type AllUserScreenNavigationProp = StackNavigationProp<RootStackParamList, "AllUser">;

// Define TypeScript type for users
type User = {
  id: string;
  name: string;
  location: string;
  job: string;
  rating: number;
};

const TopEmployees = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]); // Apply type here
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const navigation = useNavigation<JobDetails2ScreenNavigationProp | AllUserScreenNavigationProp>();

  useEffect(() => {
    const fetchUsers = async () => {
      const reference = firebase
        .app()
        .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/")
        .ref("users");

      reference.once("value").then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const userList: User[] = Object.keys(userData).map((key) => ({
            id: key, // Firebase UID
            name: userData[key].name || "N/A",
            location: userData[key].location || "Unknown",
            job: userData[key].skills || "Not specified",
            rating: parseFloat(userData[key].rating) || 0, // Convert rating to number
          }));

          // Sort users by rating in descending order and get top 3
          const sortedUsers = userList.sort((a, b) => b.rating - a.rating).slice(0, 3);
          setTopUsers(sortedUsers);
        }
      });
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = topUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHire = async (id: string) => {
    try {
      if (id) {
        await AsyncStorage.setItem("receiver_id", id);
        console.log("reciever_id:", id);
      } else {
        console.warn("No id available");
      }
      navigation.navigate("JobDetails"); // Navigate after storing token
    } catch (error) {
      console.error("Error saving FCM Token:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container1}>
      
      <View style={styles.container}>
        <Text style={styles.heading}>Top Rated Employees</Text>
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <Icon name="user-circle" size={30} color="#1294FF" style={styles.icon} />
                <View style={styles.c2}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.loc}>
                    <Icon2 name="location" size={20} color="#1294FF" />
                    <Text> {item.location}</Text>
                  </View>
                </View>
                <View style={styles.c3}>
                  <Text style={styles.skills}>
                    Skills:{" "}
                    {Array.isArray(item.job)
                      ? item.job.join(", ")
                      : String(item.job).replace(/\s*,\s*/g, ", ")}
                  </Text>
                  <Text>⭐ {item.rating}</Text>
                </View>
              </View>
              <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.btn}>
                  <Text style={{ color: 'white' }}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => handleHire(item.id)}>
                  <Text style={{ color: 'white' }}>Hire</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        <TouchableOpacity
          style={styles.seeMoreBtn}
          onPress={() => navigation.navigate("AllUser")}
        >
          <Text style={styles.seeMoreTxt}>See More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardContainer: {
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
    elevation: 5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 4,
    padding: 15,
  },
  icon: {
    marginRight: 10,
  },
  c2: {
    flex: 1,
    justifyContent: "center",
  },
  c3: {
    width: "40%", // Fixed width to prevent sliding
    justifyContent: "center",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loc: {
    flexDirection: "row",
    alignItems: "center",
  },
  skills: {
    flexWrap: "wrap",
    flexShrink: 1, // Allows text to wrap properly
  },
  btnContainer: {
    flex: 1,
    flexDirection: "row",
    height: 40,
  },
  btn: {
    width: "20%",
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1294FF",
    borderWidth: 0,
    borderColor: "#000000",
    borderRadius: 25,
    margin: "auto",
  },
  seeMoreBtn: {
    width: "30%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1294FF",
    borderRadius: 25,
    margin: "auto",
    marginTop: 20,
  },
  seeMoreTxt: {
    color: "white",
  },
});

export default TopEmployees;