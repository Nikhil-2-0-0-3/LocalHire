import React,{ useState } from 'react';
import { View, ImageBackground, StyleSheet, TouchableOpacity, Image,
   Text ,TextInput , ScrollView,SafeAreaView,
   KeyboardAvoidingView,Alert} from 'react-native';

import auth from "@react-native-firebase/auth"







const EmployeePg2 = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'login' | 'signup'>('login');
  const [passwordVisible, setPasswordVisible] = useState(false); // For password visibility toggle
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // For confirm password visibility toggle
  const [password, setPassword] = useState('');
  const [password1, setPassword1] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [email1, setEmail1] = useState('');
  const [email, setEmail] = useState('');


  // Function to handle SignUp and validate password match
  const handleSignUp = async () => {
    if (password1 !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please ensure both passwords are the same.');
      return;
    }
  
  
      console.log('enter')
      auth().createUserWithEmailAndPassword(email1,password1).then(()=>{
        Alert.alert("user created sucessfully");
      })
      .catch((error)=>{
        console.log(error);
      })
    
  };

const handleLogin=()=>{
  auth().signInWithEmailAndPassword(email,password).then(()=>{
    navigation.navigate('home1')
  })
  .catch((error)=>{
    console.log(error);
    Alert.alert(error);
  })
}

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
                      <TextInput placeholder="Name" placeholderTextColor="#808080" style={styles.unitInput} />
                    </View>

                    <View style={styles.unit}>
                      <Text>Phone</Text>
                      <TextInput placeholder="Phone number" placeholderTextColor="#808080" style={styles.unitInput} keyboardType='numeric' />
                    </View>

                    <View style={styles.unit}>
                      <Text>Email</Text>
                      <TextInput placeholder="Email" placeholderTextColor="#808080" style={styles.unitInput} onChangeText={setEmail1}
                      keyboardType='email-address' />
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

export default EmployeePg2;
