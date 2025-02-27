import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { firebase } from "@react-native-firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

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
  const navigation = useNavigation();

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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Top Rated Employees</Text>
      <FlatList
        data={topUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Icon name="user-circle" size={30} color="#1294FF" style={styles.icon} />
              <View style={styles.c2}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.loc}>
                  <Icon name="map-marker" size={16} color="#1294FF" />
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
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          navigation.navigate("AllUser"); // Ensure the screen name matches your navigation setup
        }}
      >
        <Text style={styles.txt}>See More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    justifyContent: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardContainer: {
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 4,
    padding: 15,
    elevation: 5,
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
  btn: {
    width: "30%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1294FF",
    borderRadius: 25,
    margin: "auto",
  },
  txt: {
    color: "white",
  },
});

export default TopEmployees;