//Dependencies
//npm i @types/react-native-vector-icons
//npm install --save-dev @types/react-native-vector-icons
//npm i @react-native-voice/voice --save

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Voice from '@react-native-voice/voice'


const SearchBar = () => {
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
      <Icon name="search" size={20} color="#1294FF" />

      {recording ? (
        <Text style={styles.recordingText}>{dots}</Text>
      ) : (
        <TextInput
          placeholder='Search Job here...'
          placeholderTextColor={'#A3A3A3'}
          style={styles.searchInput}
        />
      )}

      <TouchableOpacity
        onPressIn={() => setRecording(true)}
        onPressOut={() => setRecording(false)}
      >
        <Icon name="microphone" size={20} color="#1294FF" />
      </TouchableOpacity>
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
    width:'85%',
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