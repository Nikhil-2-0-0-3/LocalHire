import React,{ useState } from 'react';
import { View, ImageBackground, StyleSheet, TouchableOpacity, Image,
   Text ,TextInput , ScrollView,SafeAreaView,
   KeyboardAvoidingView,Alert,PermissionsAndroid} from 'react-native';

import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';


import messaging from '@react-native-firebase/messaging';

//import { getDatabase, ref, set } from '@react-native-firebase/database';
import { firebase } from '@react-native-firebase/database';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);



const EmployeePg2 = ({ navigation }) => {

  const [selectedTab, setSelectedTab] = useState<'login' | 'signup'>('login');
  const [passwordVisible, setPasswordVisible] = useState(false); // For password visibility toggle
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // For confirm password visibility toggle
  const [password, setPassword] = useState('');
  const [password1, setPassword1] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [email1, setEmail1] = useState('');
  const [email, setEmail] = useState('');
  const [dob ,setDob]=useState(new Date());
  const [location,setLocation]=useState('');
  const[name,setName]=useState('');
  const[phone,setPhone]=useState('');
  const [show, setShow] = useState(false);
  const [gender, setGender] = useState('');
  const [date,setDate]=useState()

  // Function to handle SignUp and validate password match
  const handleSignUp = async () => {
    if (password1 !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please ensure both passwords are the same.');
      return;
    }
    try{
      const UserCredential=await auth().createUserWithEmailAndPassword(email1,password1)
      const user=UserCredential.user;
      const fcmToken = await messaging().getToken();
      //const database=getDatabase();

      const userData = {
        uid: user.uid,
        name: name,
        email: email1,
        fcmToken: fcmToken,
        phone:phone,
        dob:dob,
        location:location,
        gender:gender,
        password:password1,
      };
      console.log(userData);

      //await database().ref(`users/${user.uid}`).set(userData);

      //const userRef = ref(database, `users/${user.uid}`);
      //await set(userRef, userData);

      const reference = firebase
     .app()
     .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/')
     .ref(`users/${user.uid}`)
     .set(userData)

      console.log('user created sucessfully')
      Alert.alert('user created sucessfully')
    }catch(error){
      console.log(error);
    }


  
  /*
      console.log('enter')
      auth().createUserWithEmailAndPassword(email1,password1).then(()=>{
        Alert.alert("user created sucessfully");
      })
      .catch((error)=>{
        console.log(error);
      })*/
    
  };

  const handleLogin = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      // Get the user ID
      const userId = userCredential.user.uid;
  
      // Save user ID to AsyncStorage
      await AsyncStorage.setItem('userId', userId);
  
      // Navigate to home screen
      navigation.navigate('home1');
    } catch (error) {
      console.log(error);
      Alert.alert(error.message);
    }
  };


  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
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



              {//login
              selectedTab === 'login' ? (
                <View style={styles.signupv}>
                <View style={styles.EmployeePgContainer}>
                  

                  

                  <View style={styles.unit}>
                    <Text>Email</Text>
                    <TextInput placeholder="Email" placeholderTextColor="#808080" style={styles.unitInput}
                    onChangeText={setEmail} keyboardType='email-address'/>
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
                <TouchableOpacity style={styles.loginbtn} onPress={handleLogin}>
                  <Text style={{ fontWeight: 'bold' }}>Log In</Text>
                </TouchableOpacity>
              </View>
              ) : (
                <View style={styles.signupv}>
                  <View style={styles.EmployeePgContainer}>
                    <View style={styles.unit}>
                      <Text>Name</Text>
                      <TextInput placeholder="Name" placeholderTextColor="#808080" style={styles.unitInput} onChangeText={setName} />
                    </View>

                    <View style={styles.unit}>
                      <Text>Phone</Text>
                      <TextInput placeholder="Phone number" onChangeText={setPhone} placeholderTextColor="#808080" style={styles.unitInput} keyboardType='numeric' />
                    </View>


                    




                    <View style={styles.unit}>
                      <Text>Email</Text>
                      <TextInput placeholder="Email" placeholderTextColor="#808080" style={styles.unitInput} onChangeText={setEmail1}
                      keyboardType='email-address' />
                    </View>


      <View style={styles.unit}>
      <Text>DOB</Text>
      <TextInput
        placeholder="Select Date"
        value={dob.toLocaleDateString('en-GB')} // Display selected date
        placeholderTextColor="#808080"
        style={styles.unitInput}
        onFocus={() => setShow(true)} // Show picker when focused
      />
      {show && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="spinner"
          onChange={onChange}
        />
      )}
    </View>

    <View style={styles.unit}>
      <Text>Gender</Text>
      <Picker
      selectedValue={gender}
      onValueChange={(itemValue, itemIndex) =>
      setGender(itemValue)
  }>
  <Picker.Item label="Male" value="male" />
  <Picker.Item label="Female" value="female" />
  <Picker.Item label="Other" value="other" />
</Picker>
    </View>

    <View style={styles.unit}>
          <Text>Location</Text>
              <TextInput placeholder="Location" placeholderTextColor="#808080" style={styles.unitInput} onChangeText={setLocation} />
    </View>



                    

                    <View style={styles.unit}>
                      <Text>Password</Text>
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="#808080"
                        style={styles.unitInput}
                        secureTextEntry={!passwordVisible}
                        onChangeText={setPassword1}
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
 
  one:{
    flexDirection:'column',
   
    
  },
  car:{
       backgroundColor:'#1294FF',
       height:300,
       width:1000,
       
       
       
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
    
   
   
  
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    color: 'black',
    marginTop: 5,
  },
  inputAndroid: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    color: 'black',
    marginTop: 5,
  },
});

export default EmployeePg2;
