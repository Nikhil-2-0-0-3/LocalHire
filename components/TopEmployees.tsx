import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { firebase } from "@react-native-firebase/database";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/EvilIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  JobDetails: undefined;
  AllUser: undefined;
  Reviews: { user: User };
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
  profileImage?: string; // New field for profile image
};

const TopEmployees = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
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
            id: key,
            name: userData[key].name || "N/A",
            location: userData[key].location || "Unknown",
            job: userData[key].skills || "Not specified",
            rating: parseFloat(userData[key].rating) || 0,
            profileImage: userData[key].profileImage || null, // Fetch profile image if available
          }));

          const sortedUsers = userList.sort((a, b) => b.rating - a.rating).slice(0, 3);
          setTopUsers(sortedUsers);
        }
      });
    };

    fetchUsers();
  }, []);

  const handleHire = async (id: string) => {
    try {
      if (id) {
        await AsyncStorage.setItem("receiver_id", id);
      }
      navigation.navigate("JobDetails");
    } catch (error) {
      console.error("Error saving FCM Token:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container1}>
      <View style={styles.container}>
        <Text style={styles.heading}>Top Rated Employees</Text>
        <FlatList
          data={topUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                {item.profileImage ? (
                  <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
                ) : (
                  <Icon name="user-circle" size={40} color="#FF7F3E" style={styles.icon} />
                )}
                <View style={styles.c2}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.loc}>
                    <Icon2 name="location" size={20} color="#4335A7" />
                    <Text> {item.location}</Text>
                  </View>
                </View>
                <View style={styles.c3}>
                  <Text style={styles.skills}>
                    Skills: {Array.isArray(item.job) ? item.job.join(", ") : String(item.job)}
                  </Text>
                  <Text>⭐ {item.rating}</Text>
                </View>
              </View>
              <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Reviews', { user: item })}>
                  <Text style={{ color: 'white' }}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => handleHire(item.id)}>
                  <Text style={{ color: 'white' }}>Hire</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        <TouchableOpacity style={styles.seeMoreBtn} onPress={() => navigation.navigate("AllUser")}>
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
    borderRadius: 10,
    overflow: "hidden",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },
  c2: {
    flex: 1,
    justifyContent: "center",
  },
  c3: {
    width: "40%",
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
    flexShrink: 1,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1294FF",
    borderRadius: 20,
  },
  seeMoreBtn: {
    alignSelf: "center",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1294FF",
    borderRadius: 20,
  },
  seeMoreTxt: {
    color: "white",
    fontWeight: "bold",
  },
});

export default TopEmployees;
