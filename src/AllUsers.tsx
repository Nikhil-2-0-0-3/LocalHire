import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image 
} from "react-native";
import { firebase } from "@react-native-firebase/database";
import Icon2 from "react-native-vector-icons/EvilIcons";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from "../components/Loading";
import SearchBar from "../components/SearchBar";
import NavBar from "../components/NavBar";

type User = {
  id: string;
  name: string;
  location: string;
  job: string[];
  rating: number;
  profileImage?: string;
};

type Filters = {
  location?: string;
  rating?: number;
  skill?: string;
};

const AllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const filters: Filters = route.params?.filters || {};

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const uid = await AsyncStorage.getItem("userId");
      setCurrentUserId(uid);
    };
    fetchCurrentUser();
  }, []);

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
            id: key,
            name: userData[key].name || "N/A",
            location: userData[key].location || "Unknown",
            job: userData[key].skills || [],
            rating: parseFloat(userData[key].averageRating) || 0,
            profileImage: userData[key].profileImage || null,
          }));

          setUsers(userList);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && currentUserId) {
      let filtered = users.filter(user => {
        // Filter out current user and users with empty skills
        if (user.id === currentUserId || user.job.length === 0) {
          return false;
        }

        // Apply additional filters if they exist
        const filterLocation = filters.location ? filters.location.trim().toLowerCase() : '';
        const filterSkill = filters.skill ? filters.skill.trim().toLowerCase() : '';
        const filterRating = filters.rating ?? 0;

        const userLocation = user.location?.trim().toLowerCase() ?? '';
        const userRating = user.rating ?? 0;
        const userSkills = user.job.map(skill => skill.trim().toLowerCase());

        const matchesLocation = filterLocation ? userLocation.includes(filterLocation) : true;
        const matchesSkill = filterSkill ? userSkills.some(skill => skill.includes(filterSkill)) : true;
        const matchesRating = filterRating > 0 ? userRating >= filterRating : true;

        return matchesLocation && matchesSkill && matchesRating;
      });

      setFilteredUsers(filtered);
    }
  }, [users, currentUserId, filters]);

  const handleHire = async (id: string) => {
    try {
      if (id) {
        await AsyncStorage.setItem("receiver_id", id);
        navigation.navigate("JobDetails");
      }
    } catch (error) {
      console.error("Error saving receiver_id:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavBar />
      
      {/* Header Section */}
      
      
      <View style={styles.searchContainer}>
        <SearchBar />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              {item.profileImage ? (
                <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Icon name="user" size={24} color="#6C63FF" />
                </View>
              )}
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={styles.locationContainer}>
                  <Icon2 name="location" size={16} color="#6C63FF" />
                  <Text style={styles.userLocation}>{item.location}</Text>
                </View>
                <Text style={styles.skills}>
                  {item.job.join(", ")}
                </Text>
              </View>
              
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.profileButton]}
                onPress={() => {
                  AsyncStorage.setItem('rid', item.id);
                  AsyncStorage.setItem('userName', item.name);
                  navigation.navigate('Reviews', { user: item });
                }}
              >
                <Text style={styles.buttonText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.hireButton]}
                onPress={() => handleHire(item.id)}
              >
                <Text style={styles.buttonText}>Hire</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="users" size={40} color="#CCCCCC" />
            <Text style={styles.emptyText}>No workers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  skills: {
    fontSize: 14,
    color: '#495057',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: '#E9ECEF',
    marginRight: 8,
  },
  hireButton: {
    backgroundColor: '#6C63FF',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default AllUsers;