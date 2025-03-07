import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { firebase } from "@react-native-firebase/database";
import Icon2 from "react-native-vector-icons/EvilIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from "../components/Loading"; // Import the Loading component

// Define TypeScript type for users
type User = {
  id: string;
  name: string;
  location: string;
  job: string[]; // Array of skills
  rating: number;
};

type Filters = {
  location?: string;
  rating?: number;
  skill?: string;
};

const AllUsers = () => {
  const [users, setUsers] = useState<User[]>([]); // Store all users
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Store filtered users
  const [loading, setLoading] = useState(true); // Loading state
  const navigation = useNavigation();
  const route = useRoute();

  // Get filters from route params
  const filters: Filters = route.params?.filters || {};

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const reference = firebase
          .app()
          .database("https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/")
          .ref("users");

        const snapshot = await reference.once("value");
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const userList: User[] = Object.keys(userData).map((key) => ({
            id: key, // Firebase UID
            name: userData[key].name || "N/A",
            location: userData[key].location || "Unknown",
            job: userData[key].skills || [], // Default to empty array if skills are missing
            rating: parseFloat(userData[key].rating) || 0, // Convert rating to number
          }));

          setUsers(userList); // Set all users
          setFilteredUsers(userList); // Initially, display all users
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Stop loading after fetching data
      }
    };

    fetchUsers();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    if (filters.location || filters.rating || filters.skill) {
      const filtered = users.filter((user) => {
        // Ensure location is a string before calling toLowerCase
        const userLocation = user.location?.toLowerCase() ?? '';
        const matchesLocation = filters.location
          ? userLocation.includes(filters.location.toLowerCase())
          : true;

        // Ensure rating is a number
        const userRating = user.rating ?? 0;
        const matchesRating = filters.rating ? userRating >= filters.rating : true;

        // Ensure job is an array and check if it includes the selected skill
        const userJob = Array.isArray(user.job) ? user.job : []; // Ensure job is an array
        const matchesSkill = filters.skill
          ? userJob.some((skill) =>
              skill.toLowerCase().includes(filters.skill.toLowerCase()))
          : true;

        return matchesLocation && matchesRating && matchesSkill;
      });

      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users); // If no filters, display all users
    }
  }, [filters, users]);

  if (loading) {
    return <Loading />; // Use the Loading component
  }

  return (
    <SafeAreaView style={styles.container1}>
      <NavBar />
      <View style={{ height: 45 }}>
        <SearchBar />
      </View>
      <View style={styles.container}>
        <FlatList
          style={{ marginTop: '10%' }}
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
                      : "No skills specified"}
                  </Text>
                  <Text>⭐ {item.rating}</Text>
                </View>
              </View>
              <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.btn} onPress={() => { navigation.navigate('Reviews', { user: item }) }}>
                  <Text style={{ color: 'white' }}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => { handleHire(item.id) }}>
                  <Text style={{ color: 'white' }}>Hire</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
  },
  btn: {
    width: '20%',
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1294FF',
    borderWidth: 0,
    borderColor: '#000000',
    borderRadius: 25,
    margin: 'auto'
  },
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
});

export default AllUsers;