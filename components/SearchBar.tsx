//Dependencies
//npm i @types/react-native-vector-icons
//npm install --save-dev @types/react-native-vector-icons
//npm i @react-native-voice/voice --save
//npm i axios

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity,Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';



const SearchBar = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [searchText,setSearchText]=useState('');
  const API_KEY = 'AIzaSyBpE4SoC4ostrQ8wL68-mYQc-5uhz10QQg';

  const PerformNER = async (inputPrompt: string) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;


    const data = {
      contents: [{
        parts: [{
          text: inputPrompt,
        }],
      }],
    };

    try {
      // Make the API request with a 10-second timeout
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // Timeout after 10 seconds
      });

      console.log(response.data); // Log the entire response

      // Set the response data
      const responseText = response.data?.candidates[0]?.content?.parts[0]?.text || 'No content in response';
      setResponse(responseText);
      setError(''); // Clear any previous errors

    } catch (error: any) {
      // Handle errors
      if (error.response) {
        // Server responded with an error status
        setError('Error');
      } else if (error.request) {
        // Request was made but no response received
        setError('Network Error: No response received from the server');
      } else {
        // General error
        setError('error');
      }

      setResponse('');
    }
  };



  const [recording, setRecording] = useState(false);
  const [dots, setDots] = useState('...');

  useEffect(() => {
    let interval:any;
    if (recording) {
      interval = setInterval(() => {
        setDots(prev => (prev === 'speak...' ? 'speak..' : prev === 'speak..' ? 'speak.' : prev === 'speak.' ? 'speak....' : 'speak...'));
      }, 500);
    } else {
      setDots('speak...');
    }

    return () => clearInterval(interval);
  }, [recording]);





  return (
    <View style={styles.searchBar}>
  {/* Search Icon */}
  <TouchableOpacity onPress={async () => {
    await PerformNER(searchText); // Call the PerformNER function
    Alert.alert(response); 
    // Alert the response
  }}>
    <Icon name="search" size={20} color="#1294FF" />
  </TouchableOpacity>

  {recording ? (
    <Text style={styles.recordingText}>{dots}</Text>
  ) : (
    <TextInput
      placeholder="Search Job here..."
      placeholderTextColor="#A3A3A3"
      style={styles.searchInput}
      onChangeText={(text)=>{setSearchText(text)}}
      onSubmitEditing={async () => {
        
        await PerformNER('Text:{'+searchText+'} Task:Extarct named entities with the following tags location,job,min salary,min rating  output format:tag:entity include tags that are available ignore other tags');
        console.log(response) // Call the PerformNER function
        Alert.alert(response); // Alert the response
        
      }}
      returnKeyType="search" // Changes the return key to say "Search" on iOS
    />
  )}
</View>
  );
};



const styles=StyleSheet.create({
  searchBar:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    width:'90%',
    backgroundColor:'#E5E5E5',
    borderRadius:4,
    margin:'auto',
    paddingVertical:0,
    paddingHorizontal:10,
    height:45

  },
  searchInput:{
    width:'90%',
    borderWidth:0,
    color:'black'

  },
  recordingText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1294FF',
  }
})
export default SearchBar