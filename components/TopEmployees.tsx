import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet ,TouchableOpacity} from "react-native";
import { firebase } from "@react-native-firebase/database";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';


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

      reference.once("value").then(snapshot => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const userList: User[] = Object.keys(userData).map(key => ({
            id: key, // Firebase UID
            name: userData[key].name || "N/A",
            location: userData[key].location || "Unknown",
            job: userData[key].job || "Not specified",
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
        renderItem={({ item, index }) => (
          
          <View style={styles.card}>
            <Icon name="user-circle" size={30} color="#1294FF" style={styles.icon}/>
            <View style={styles.c2}>
              <Text style={styles.name}>{item.name}</Text>
              <Text> {item.location}</Text>
            </View>
            <View>
            <Text>💼 {item.job}</Text>
            <Text>⭐ {item.rating}</Text>
            </View>
          </View>
          
        )}
      />
      <TouchableOpacity style={styles.btn} onPress={()=>{
        navigation.navigate('AllUser');
      }}>
        <Text style={styles.txt}>See More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  btn:{
   width:'30%',
   height:40,
   alignItems:'center',
   justifyContent:'center',
   backgroundColor:'#1294FF',
   borderWidth:0,
   borderColor:'#000000',
   borderRadius:25,
   margin:'auto'
    
  },
  txt:{
    
    color:'white'
  },
  icon:{
    marginRight:'-30%',
  },
  c2:{
    
  },
  c3:{
    marginRight:'10%'
  },
  container: {
    flex: 1,
    padding: 20,
    width:'100%',
    justifyContent:'center'
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'95%',
    backgroundColor:'#f8f8f8',
    borderRadius:4,
    margin:'auto',
    padding:15,
    elevation:5,
    marginBottom:10,
    
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "blue",
  },
});




export default TopEmployees;