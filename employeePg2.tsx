import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, TextInput, ScrollView, SafeAreaView,
  KeyboardAvoidingView, Alert, PermissionsAndroid,Image
} from 'react-native';
import { Formik } from 'formik';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import messaging from '@react-native-firebase/messaging';
import { firebase } from '@react-native-firebase/database';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';


PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

const EmployeePg2 = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'login' | 'signup'>('login');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickImageFromGallery = async (setFieldValue) => {
    const options = { mediaType: 'photo', quality: 1 };
  
    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        
        try {
          const reference = storage().ref(`profileImages/${filename}`);
          await reference.putFile(imageUri);
          const downloadURL = await reference.getDownloadURL();
  
          setFieldValue("profileImage", downloadURL); // Store the URL in the form
        } catch (error) {
          console.error("Image upload failed:", error);
          Alert.alert("Upload Error", "Failed to upload image. Please try again.");
        }
      }
    });
  };
  
  // Handle SignUp with Formik
  const handleSignUp = async (values) => {
    const { email, password, confirmPassword, name, phone, dob, location, gender, profileImage } = values;
  
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please ensure both passwords are the same.');
      return;
    }
  
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const fcmToken = await messaging().getToken();
  
      const userData = {
        uid: user.uid,
        name,
        email,
        fcmToken,
        phone,
        dob: dob.toISOString(), 
        location,
        gender,
        profileImage, // Now stores the Firebase Storage URL
      };
  
      await firebase
        .app()
        .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/')
        .ref(`users/${user.uid}`)
        .set(userData);
  
      await AsyncStorage.setItem('userId', user.uid);
      const role = await AsyncStorage.getItem('role');
      role == 'employee' ? navigation.replace('Skill') : navigation.replace('home1');
  
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
    }
  };
  

  // Handle Login with Formik
  const handleLogin = async (values) => {
    const { email, password } = values;

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;
      await AsyncStorage.setItem('userId', userId);
      navigation.replace('home1');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Invalid email or password.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.one}>
            <View style={styles.car}>
              <Image source={{ uri: 'https://i.postimg.cc/nrmw5sWG/rb-1596-1-1.png' }} style={{ height: 170, width: 200, left: 100, top: 70 }} />
            </View>
            <View style={styles.bike1}>
              <TouchableOpacity
                style={[styles.login, selectedTab === 'login' && styles.loginselec]}
                onPress={() => setSelectedTab('login')}
              >
                <Text>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signup, selectedTab === 'signup' && styles.signupselec]}
                onPress={() => setSelectedTab('signup')}
              >
                <Text>Signup</Text>
              </TouchableOpacity>

              {selectedTab === 'login' ? (
                <Formik
                  initialValues={{ email: '', password: '' }}
                  
                  onSubmit={handleLogin}
                >
                  {({ handleChange, handleBlur, handleSubmit, values }) => (
                    <View style={styles.signupv}>
                      <View style={styles.EmployeePgContainer}>
                        <View style={styles.unit}>
                          <Text>Email</Text>
                          <TextInput
                            placeholder="Email"
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            keyboardType="email-address"
                          />
                        </View>

                        <View style={styles.unit}>
                          <Text>Password</Text>
                          <TextInput
                            placeholder="Password"
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            secureTextEntry={!passwordVisible}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                          />
                          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                            <Text style={styles.showhide}>{passwordVisible ? 'Hide' : 'Show'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.loginbtn} onPress={handleSubmit}>
                        <Text style={{ fontWeight: 'bold' }}>Log In</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              ) : (
                <Formik
                  initialValues={{
                    name: '',
                    phone: '',
                    email: '',
                    dob: new Date(),
                    gender: '',
                    location: '',
                    password: '',
                    confirmPassword: '',
                    profileImage: '',
                  }}
                  onSubmit={handleSignUp}
                >
                  {({ handleChange, handleBlur, handleSubmit, setFieldValue, values }) => (
                    <View style={styles.signupv}>
                      <View style={styles.EmployeePgContainer}>
                        <View style={styles.unit}>
                          <Text>Name</Text>
                          <TextInput
                            placeholder="Name"
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            value={values.name}
                          />
                        </View>

                        <View style={styles.unit}>
                          <Text>Phone</Text>
                          <TextInput
                            placeholder="Phone number"
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            onChangeText={handleChange('phone')}
                            onBlur={handleBlur('phone')}
                            value={values.phone}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.unit}>
                          <Text>Profile Image</Text>
                          <TouchableOpacity
                            style={styles.imagePicker}
                            onPress={() => pickImageFromGallery(setFieldValue)}
                          >
                            <Text>Select Image from Gallery</Text>
                          </TouchableOpacity>
                          {values.profileImage ? (
                            <Image 
                            source={{ uri: values.profileImage }} 
                            style={[styles.profileImage, { maxHeight: 150 }]} 
                          />
                          
                          ) : null}
                        </View>

                        <View style={styles.unit}>
                          <Text>Email</Text>
                          <TextInput
                            placeholder="Email"
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            keyboardType="email-address"
                          />
                        </View>

                        <View style={styles.unit}>
                          <Text>DOB</Text>
                          <TextInput
                            placeholder="Select Date"
                            value={values.dob ? values.dob.toLocaleDateString('en-GB') : ""}
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            onFocus={() => setShowDatePicker(true)}
                          />
                          {showDatePicker && (
                            <DateTimePicker
                              value={values.dob || new Date()}
                              mode="date"
                              display="spinner"
                              onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                  setFieldValue('dob', selectedDate);
                                }
                              }}
                            />
                          )}
                        </View>

                        <View style={styles.unit}>
                          <Text>Gender</Text>
                          <Picker
                            style={styles.picker}
                            selectedValue={values.gender}
                            onValueChange={(itemValue) => setFieldValue('gender', itemValue)}
                          >
                            <Picker.Item label="Male" value="male" />
                            <Picker.Item label="Female" value="female" />
                            <Picker.Item label="Other" value="other" />
                          </Picker>
                        </View>

                        <View style={styles.unit}>
                          <Text>Location</Text>
                          <TextInput
                            placeholder="Location"
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            onChangeText={handleChange('location')}
                            onBlur={handleBlur('location')}
                            value={values.location}
                          />
                        </View>

                        <View style={styles.unit}>
                          <Text>Password</Text>
                          <TextInput
                            placeholder="Password"
                            placeholderTextColor="#808080"
                            style={styles.unitInput}
                            secureTextEntry={!passwordVisible}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
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
                            onChangeText={handleChange('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                            value={values.confirmPassword}
                          />
                          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                            <Text style={styles.showhide}>{confirmPasswordVisible ? 'Hide' : 'Show'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.loginbtn} onPress={handleSubmit}>
                        <Text style={{ fontWeight: 'bold' }}>Sign Up</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
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
  unit: { margin: 10 },
  unitInput: {
    marginTop: 5, borderWidth: 0, width: "95%", height: 45,
    backgroundColor: '#E5E5E5', color: 'grey', fontSize: 14,
  },
  imagePicker: {
    padding: 10, backgroundColor: "#ddd",
    alignItems: "center", borderRadius: 5, marginTop: 10,
  },
  profileImage: {
    width: 50, height: 50, marginTop:10,
    borderRadius: 20, alignSelf: "center",
  },
  EmployeePgContainer:{
    padding:10,
  },
  unit:{
    margin:5,
  },
  unitInput:{
    marginTop:5,
     borderWidth:0,
     width:"95%",
     height:45,
     
     backgroundColor:'#E5E5E5',
     color:'grey',
     fontSize:14,

  },
  picker:{
    marginTop:5,
     borderWidth:0,
     width:"95%",
     height:50,
     borderRadius:25,
     backgroundColor:'#E5E5E5',
     color:'grey',
     fontSize:0,
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
    width: 300,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1294FF',
    borderRadius: 25,
    marginTop: 20,  // Ensure spacing after inputs
    marginBottom: 40,
    left:50, // Prevent button from getting hidden
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