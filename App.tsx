import React,{ useState ,useEffect} from 'react';
import { View, ImageBackground, StyleSheet, TouchableOpacity, Image, Text ,TextInput , ScrollView,SafeAreaView,KeyboardAvoidingView,Alert} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps  } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import UserProfile from './userp.jsx';
import EmployeePg2 from './employeePg2.tsx';
import SearchBar from './components/SearchBar.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopEmployees from './components/TopEmployees.tsx';
import AllUsers from './src/AllUsers.tsx';
import Skill from './src/Skill.tsx';
import JobDetails from './src/JobDetails.tsx';

// Request notification permissions
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
};

// Define the ParamList for the Navigator
type RootStackParamList = {
  Home: undefined;
  Details: undefined;
  Employee:undefined;
  Employeer1:undefined;
  home1:undefined;
  user1:undefined;
  EmployeePg2:undefined;
  AllUser:undefined;
  TopEmployee:undefined;
  Skill:undefined;
  JobDetails:undefined;
};

// Define Props for HomeScreen
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type EmpScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
type pg3ScreenProps = NativeStackScreenProps<RootStackParamList, 'Employee'>;
type pg4ScreenProps = NativeStackScreenProps<RootStackParamList, 'Employeer1'>;
type home1ScreenProps = NativeStackScreenProps<RootStackParamList, 'home1'>;
type AllUsersScreenProps=NativeStackScreenProps<RootStackParamList, 'AllUser'>;
type TopEmployeesProps=NativeStackScreenProps<RootStackParamList, 'TopEmployee'>;



// Local or Remote Image
const backgroundImage = {
  uri: 'https://i.postimg.cc/zBF1bgxP/Android-Compact-5-2.png',
};

//page 1
const HomeScreen = ({ navigation }: HomeScreenProps) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ImageBackground source={backgroundImage} style={styles.imageBackground}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              //navigation to home if the user has already logged in 
              //const userId=AsyncStorage.getItem('userId')
              //userId==null?navigation.navigate('Details') : navigation.navigate('home1');
              navigation.navigate('Details')
            }}
          >
            <Image
              source={{ uri: 'https://i.postimg.cc/1zb41VXz/right-arrow.png' }}
              style={styles.buttonImage}
            />
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
};
//page 2

const DetailsScreen = ({ navigation }: EmpScreenProps) => {
  return (
    <View style={styles.one}>
      <View style={styles.car}>
        <Image
          style={styles.detimg}
          source={{ uri: 'https://i.postimg.cc/pVkKRSJ5/rb-19928-1.png' }}
        />
      </View>
      <View style={styles.bike}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 30,
            left: 30,
            top: 30,
          }}
        >
          Sign Up As
        </Text>
        <TouchableOpacity
          style={styles.leftbtn}
          onPress={() => {
            navigation.navigate('Employee');
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>Employee</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rightbtn}
          onPress={() => {
            navigation.navigate('Employee');
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>Employer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

//page 3
const EmployeePg = ({ navigation }: pg3ScreenProps) => {
  const [selectedTab, setSelectedTab] = useState<'login' | 'signup'>('login');
  const [passwordVisible, setPasswordVisible] = useState(false); // For password visibility toggle
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // For confirm password visibility toggle
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Function to handle SignUp and validate password match
  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please ensure both passwords are the same.');
      return;
    }
    navigation.navigate('home1');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.one}>
            <View style={styles.car}>
              <Image source={{ uri: 'https://i.postimg.cc/nrmw5sWG/rb-1596-1-1.png' }} style={{ height: 170, width: 200, left: 100, top: 70 }} />
            </View>
            <View style={styles.bike1}>
              <TouchableOpacity
                style={[styles.login, selectedTab == 'login' && styles.loginselec]}
                onPress={() => setSelectedTab('login')}
              >
                <Text>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signup, selectedTab == 'signup' && styles.signupselec]}
                onPress={() => setSelectedTab('signup')}
              >
                <Text>Signup</Text>
              </TouchableOpacity>

              {selectedTab === 'login' ? (
                <View style={styles.signupv}>
                <View style={styles.EmployeePgContainer}>
                  

                  

                  <View style={styles.unit}>
                    <Text>Email</Text>
                    <TextInput placeholder="Email" placeholderTextColor="#808080" style={styles.unitInput} />
                  </View>

                  <View style={styles.unit}>
                    <Text>Password</Text>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#808080"
                      style={styles.unitInput}
                      secureTextEntry={!passwordVisible}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                      <Text style={styles.showhide}>{passwordVisible ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>

                  
                </View>
                <TouchableOpacity style={styles.loginbtn} onPress={handleSignUp}>
                  <Text style={{ fontWeight: 'bold' }}>Log In</Text>
                </TouchableOpacity>
              </View>
              ) : (
                <View style={styles.signupv}>
                  <View style={styles.EmployeePgContainer}>
                    <View style={styles.unit}>
                      <Text>Name</Text>
                      <TextInput placeholder="Name" placeholderTextColor="#808080" style={styles.unitInput} />
                    </View>

                    <View style={styles.unit}>
                      <Text>Phone</Text>
                      <TextInput placeholder="Phone number" placeholderTextColor="#808080" style={styles.unitInput} />
                    </View>

                    <View style={styles.unit}>
                      <Text>Email</Text>
                      <TextInput placeholder="Email" placeholderTextColor="#808080" style={styles.unitInput} />
                    </View>

                    <View style={styles.unit}>
                      <Text>Password</Text>
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="#808080"
                        style={styles.unitInput}
                        secureTextEntry={!passwordVisible}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Text style={styles.showhide}>{passwordVisible ? 'Hide' : 'Show'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.unit}>
                      <Text>Confirm Password</Text>
                      <TextInput
                        placeholder="Confirm password"
                        placeholderTextColor="#808080"
                        style={styles.unitInput}
                        secureTextEntry={!confirmPasswordVisible}
                        onChangeText={setConfirmPassword}
                      />
                      <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                        <Text style={styles.showhide}>{confirmPasswordVisible ? 'Hide' : 'Show'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.loginbtn} onPress={handleSignUp}>
                    <Text style={{ fontWeight: 'bold' }}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Employeer = ({ navigation }:pg4ScreenProps) => {
  const [selectedTab, setSelectedTab] = useState<'login' | 'signup'>('login');
  return (
    <View style={styles.one}>
      <View style={styles.car}>
      <Image source={{uri:'https://i.postimg.cc/nrmw5sWG/rb-1596-1-1.png'}} style={{height:170,width:200,left:100,top:70}}></Image>
      </View>
      <View style={styles.bike1}>
        <TouchableOpacity
          style={[styles.login, selectedTab == 'login' && styles.loginselec]}
          onPress={() => setSelectedTab('login')}
        >
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.signup, selectedTab == 'signup' && styles.signupselec]}
          onPress={() => setSelectedTab('signup')}
        >
          <Text>Signup</Text>
        </TouchableOpacity>
        {
          selectedTab==='login'?(
        <View style={styles.pass}>
          <Text style={{left:-131,marginBottom:10,fontWeight:'bold'}}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#808080" // Set placeholder color
            style={[styles.email, styles.textcolor]}
          />
          <Text style={{left:-120,marginBottom:10,fontWeight:'bold'}}>Password</Text>
          <TextInput
            placeholder="Enter the password"
            placeholderTextColor="#808080" // Set placeholder color
            style={[styles.pass1, styles.textcolor]}
            secureTextEntry // Ensure password input is masked
          />
          <TouchableOpacity style={styles.loginbtn} onPress={() => {navigation.navigate('home1')}}><Text>Login</Text></TouchableOpacity>
        </View>): (
          <View style={styles.signupv}>
            <Text style={styles.name}>Name</Text>
            <TextInput style={styles.name1}/>
            <Text style={styles.phone}>Phone</Text>
            <TextInput style={styles.phone1}/>
            <Text style={styles.emaill}>Email</Text>
            <TextInput style={styles.email1}/>
            <Text style={styles.passw}>Password</Text>
            <TextInput style={styles.passw1}/>
            <Text style={styles.cpass}>Confirm Password</Text>
            <TextInput style={styles.cpass1}/>
            <TouchableOpacity style={styles.loginbtn} onPress={() => {navigation.navigate('home1')}}><Text style={{fontWeight:'bold',}}>Sign Up</Text></TouchableOpacity>
                      </View>
        )}
      </View>
    </View>
  );
};
//page 4
const home = ({ navigation }:home1ScreenProps) => {
  return (
    
    <ScrollView style={styles.container1}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>{navigation.navigate('user1')}}>
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      
      <SearchBar/>



      {/* Top Rated Employees */}
      <TopEmployees/>



      {/* Job Listings */}
      {['Job 1', 'Job 2', 'Job 3'].map((job, index) => (
        <View key={index} style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <View style={styles.jobAvatar} />
            <View style={styles.jobDetails}>
              <Text style={styles.jobTitle}>Job Title</Text>
              <Text style={styles.companyName}>Company Name</Text>
              <View style={styles.tagContainer}>
                <Text style={styles.tag}>Fulltime</Text>
                <Text style={styles.tag}>Medium Level</Text>
                <Text style={styles.tag}>Remote</Text>
              </View>
            </View>
            <View style={styles.placeholderIcon} />
          </View>
          <Text style={styles.jobLocation}>Location, State</Text>
          <Text style={styles.jobTime}>X hours ago</Text>
        </View>
      ))}

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <View style={styles.placeholderIcon} />
        <View style={styles.placeholderIcon} />
        <View style={styles.placeholderIcon} />
        <View style={styles.placeholderIcon} />
      </View>
    </ScrollView>
  
  );
};


// Create Native Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Request notification permissions
    requestUserPermission();


    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      const notificationTitle = remoteMessage.notification?.title || 'New Notification';
      const notificationBody = remoteMessage.notification?.body || 'You have a new message';

      Alert.alert(notificationTitle, notificationBody);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });

    // Handle notification opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          // Navigate to a specific screen based on the notification
        }
      });

    // Cleanup function
    return () => {
      if (unsubscribeForeground) {
        unsubscribeForeground(); // Unsubscribe the foreground listener
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Disables the header for all screens
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Employee" component={EmployeePg2} />
        <Stack.Screen name="Skill" component={Skill} />
        <Stack.Screen name="TopEmployee" component={TopEmployees} />
        <Stack.Screen name="JobDetails" component={JobDetails} />
        <Stack.Screen name="AllUser" component={AllUsers} />
        <Stack.Screen name="Employeer1" component={Employeer} />
        <Stack.Screen name="home1" component={home} />
        <Stack.Screen name="user1" component={UserProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  //styles by nikhil
  EmployeePgContainer:{
    padding:10,
  },
  unit:{
    margin:10
  },
  unitInput:{
    marginTop:5,
     borderWidth:0,
     width:"95%",
     height:40,
     borderRadius:25,
     backgroundColor:'#E5E5E5',
     color:'black'

  },
  showhide:{
    color:'#1294FF',
    textAlign:'right',
    marginRight:'5%'
  },
  //style end



  //page 1 and 2
  container: {
    flex: 1, // Ensures the container takes the full screen
  },
  imageBackground: {
    flex: 1, // Ensures the background image fills the container
    resizeMode: 'cover', // Makes the image cover the entire background
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  },
  one:{
    flexDirection:'column',
   
    
  },
  car:{
       backgroundColor:'#1294FF',
       height:300,
       width:1000,
       
       
       
  },
  bike:{
    top:-50,
    borderRadius:25,
    height:1000,
    backgroundColor:'#FFFF',
   
  },
  button: {
    marginTop:'95%',
    width: 70, // Button width
    height: 70, // Button height
    backgroundColor: '#FFFF', // Button background color
    borderRadius: 45, // Makes the button round
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    position: 'absolute', // Places the button relative to the background
    bottom: 50, // Adjust the button position from the bottom
    right: 30, // Adjust the button position from the right
  },
  button2: {
    backgroundColor: '#000000',
  },
  buttonImage: {
    width: 40, // Arrow image width
    height: 40, // Arrow image height
    resizeMode: 'contain', // Ensures the arrow image scales properly
  },
  detimg:{
    top:50,
    left:60,
    height:200,
    width:300,
  },
  rightbtn:{
    left:250,
    top:120,
    width:100,
    height:100,
    borderColor:'#000000',
    borderWidth:2,
    alignItems:'center',
    justifyContent:'center',
  },
  leftbtn:{
    top:220,
    left:50,
    width:100,
    height:100,
    borderColor:'#000000',
    borderWidth:2,
    alignItems:'center',
    justifyContent:'center',
    
    
    
  },
  //page3
  bike1:{
    top:-50,
    borderRadius:25,
    height:1000,
    backgroundColor:'#FFFF',
    
  },
  login:{
    left:2,
    top:50,
    borderColor:'#1294FF',
    borderWidth:2,
    width:200,
    height:50,
    alignItems:'center',
    justifyContent:'center',
    borderTopLeftRadius:10,
    borderBottomLeftRadius:10,
  },
  signup:{
    left:200,
    top:0,
    borderColor:'#1294FF',
    borderWidth:2,
    width:210,
    height:50,
    alignItems:'center',
    justifyContent:'center',
    borderTopRightRadius:10,
    borderBottomRightRadius:10,
   
  },
  loginselec:
  { 
    left:2,
    top:50,
    borderColor:'#1294FF',
    borderWidth:2,
    width:200,
    height:50,
    alignItems:'center',
    justifyContent:'center',
    borderTopLeftRadius:10,
    borderBottomLeftRadius:10,
    backgroundColor:'#1294FF',
  },
  signupselec:{
    left:200,
    top:0,
    borderColor:'#1294FF',
    borderWidth:2,
    width:210,
    height:50,
    alignItems:'center',
    justifyContent:'center',
    borderTopRightRadius:10,
    borderBottomRightRadius:10,
    backgroundColor:'#1294FF',
  },
  pass:{ 
    alignItems:'center',
    justifyContent:'center',
    width:400,
    height:450,
    
  },
  email:{
     borderWidth:2,
     borderColor:'#1294FF',
     width:300,
     height:25,
     marginBottom:20,
     color:'#000000',
     borderRadius:25,
     
  },
  pass1:
  { 
    borderWidth:2,
     borderColor:'#1294FF',
     width:300,
     height:25,
     backgroundColor:'#FFFFFF',
     borderRadius:25,
     marginBottom:40,
     
 
  },
  textcolor:{
    color:'#000000',
  },
  loginbtn:{
   width:300,
   height:40,
   alignItems:'center',
   justifyContent:'center',
   backgroundColor:'#1294FF',
   borderWidth:0,
   borderColor:'#000000',
   borderRadius:25,
   margin:'auto'
  },
  signupv:{
    
  },
  name:{
    top:20,
    marginBottom:20,
    fontWeight:'bold',
    left:-125,
  },
  name1:{
    borderWidth:2,
     borderColor:'#1294FF',
     width:300,
     height:25,
     backgroundColor:'#FFFFFF',
     borderRadius:25,
     marginBottom:40,
    
    
  },
  phone:{fontWeight:'bold',
    left:-125,},
  phone1:{borderWidth:2,
    borderColor:'#1294FF',
    width:300,
    height:25,
    backgroundColor:'#FFFFFF',
    borderRadius:25,
    marginBottom:40,},
  passw:{fontWeight:'bold',
    left:-115,},
  passw1:{borderWidth:2,
    borderColor:'#1294FF',
    width:300,
    height:25,
    backgroundColor:'#FFFFFF',
    borderRadius:25,
    marginBottom:40,},
  cpass:{fontWeight:'bold',
    left:-90,},
  cpass1:{borderWidth:2,
    borderColor:'#1294FF',
    width:300,
    height:25,
    backgroundColor:'#FFFFFF',
    borderRadius:25,
    marginBottom:40,},
  emaill:{fontWeight:'bold',
    left:-125,},
  email1:{borderWidth:2,
    borderColor:'#1294FF',
    width:300,
    height:25,
    backgroundColor:'#FFFFFF',
    borderRadius:25,
    marginBottom:40,},
    container1: {
      flex: 1,
      backgroundColor: '#f9f9f9',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: '#fff',
    },
    headerIcons: {
      flexDirection: 'row',
    },
    placeholderIcon: {
      width: 28,
      height: 28,
      backgroundColor: '#ccc',
      borderRadius: 14,
      marginLeft: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      backgroundColor: '#f1f1f1',
      borderRadius: 8,
      paddingHorizontal: 16,
      height: 40,
    },
    filterButton: {
      marginLeft: 8,
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    filterText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      paddingHorizontal: 16,
      marginVertical: 8,
    },
    card: {
      backgroundColor: '#fff',
      margin: 16,
      padding: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    employeeBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    employeeAvatar: {
      width: 40,
      height: 40,
      backgroundColor: '#e1e1e1',
      borderRadius: 20,
    },
    employeeDetails: {
      flex: 1,
      marginLeft: 16,
    },
    employeeName: {
      fontWeight: 'bold',
    },
    employeeDescription: {
      color: '#777',
    },
    employeeCompany: {
      color: '#aaa',
    },
    ratingText: {
      fontSize: 16,
      color: 'gold',
    },
    seeAllButton: {
      marginTop: 8,
      alignItems: 'center',
    },
    seeAllText: {
      color: '#007bff',
      fontWeight: 'bold',
    },
    jobCard: {
      backgroundColor: '#fff',
      margin: 16,
      padding: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    jobHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    jobAvatar: {
      width: 40,
      height: 40,
      backgroundColor: '#e1e1e1',
      borderRadius: 20,
    },
    jobDetails: {
      flex: 1,
      marginLeft: 16,
    },
    jobTitle: {
      fontWeight: 'bold',
    },
    companyName: {
      color: '#777',
    },
    tagContainer: {
      flexDirection: 'row',
      marginTop: 4,
    },
    tag: {
      backgroundColor: '#f1f1f1',
      color: '#333',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginRight: 4,
      fontSize: 12,
    },
    jobLocation: {
      marginTop: 8,
      color: '#555',
    },
    jobTime: {
      marginTop: 4,
      color: '#aaa',
    },
    bottomNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      backgroundColor: '#fff',
    },
  
});