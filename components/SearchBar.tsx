import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SearchBar = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [dots, setDots] = useState('...');
  const API_KEY = 'AIzaSyBpE4SoC4ostrQ8wL68-mYQc-5uhz10QQg'; // Replace with your actual API key

  // Function to validate the response format
  const isValidResponseFormat = (responseText: string) => {
    // Check if the response follows the format "tag:word"
    const regex = /^\s*(\w+:\s*\w+\s*)+$/;
    return regex.test(responseText);
  };

  // Function to perform NER using the API
  const performNER = async (inputText: string) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
    const data = {
      contents: [
        {
          parts: [
            {
              text: `Text: {${inputText}} Task: Extract named entities with the following tags: location, job, min salary, min rating. Output format: tag: entity. Include only available tags.`,
            },
          ],
        },
      ],
    };
  
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10-second timeout
      });
  
      // Extract the response text
      const responseText = response.data?.candidates[0]?.content?.parts[0]?.text || 'No content in response';
      setResponse(responseText);
  
      // Log the raw response for debugging
      console.log('API Response:', responseText);
  
      // Extract location, skill, salary, and rating from the response
      //const locationMatch = responseText.match(/location:\s*([\w\s\-.,]+)/i);
      const locationMatch = responseText.match(/location:\s*([\w\s\-.,]+?)(?=\s*job:|$)/i);
      const jobMatch = responseText.match(/job:\s*([\w\s\-.,]+)/i);
      const salaryMatch = responseText.match(/min salary:\s*([\d,]+)/i);
      const ratingMatch = responseText.match(/min rating:\s*([\d.]+)/i);
  
      const location = locationMatch ? locationMatch[1].trim() : '';
      const skill = jobMatch ? jobMatch[1].trim() : '';
      const salary = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, ''), 10) : 0; // Remove commas from salary
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
  
      // Log the extracted filters for debugging
      console.log('Extracted Filters:', { location, skill, salary, rating });
  
      setError(''); // Clear any previous errors
  
      // Validate the extracted filters
      if (location || skill || salary || rating) {
        // Pass the extracted filters to the AllUsers screen
        navigation.navigate('AllUser', {
          filters: { location, skill, rating },
        });
      } else {
        Alert.alert('Error', 'No valid filters extracted from the response.');
      }
    } catch (error: any) {
      // Handle errors
      if (error.response) {
        setError('Server Error: ' + error.response.data.error.message);
      } else if (error.request) {
        setError('Network Error: No response received from the server');
      } else {
        setError('Error: ' + error.message);
      }
  
      setResponse('');
      Alert.alert('Error', error.message || 'An error occurred while processing the request.');
    }
  };

  // Effect for recording animation
  useEffect(() => {
    let interval: any;
    if (recording) {
      interval = setInterval(() => {
        setDots((prev) =>
          prev === 'speak...' ? 'speak..' : prev === 'speak..' ? 'speak.' : 'speak...'
        );
      }, 500);
    } else {
      setDots('speak...');
    }

    return () => clearInterval(interval);
  }, [recording]);

  return (
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', width: '90%', margin: 'auto' }}>
      <View style={styles.searchBar}>
        {/* Search Icon */}
        <TouchableOpacity
          onPress={async () => {
            if (searchText.trim()) {
              await performNER(searchText);
            } else {
              Alert.alert('Error', 'Please enter some text to search.');
            }
          }}
        >
          <Icon name="search" size={20} color="#4335A7" />
        </TouchableOpacity>

        {/* Search Input */}
        {recording ? (
          <Text style={styles.recordingText}>{dots}</Text>
        ) : (
          <TextInput
            placeholder="Search Job here..."
            placeholderTextColor="#A3A3A3"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={async () => {
              if (searchText.trim()) {
                await performNER(searchText);
              } else {
                Alert.alert('Error', 'Please enter some text to search.');
              }
            }}
            returnKeyType="search" // Changes the return key to say "Search" on iOS
          />
        )}
      </View>
      <TouchableOpacity style={styles.filterContainer} onPress={() => navigation.navigate('FilterScreen')}>
        <View style={styles.filterBtn}>
          <Icon name="sliders" size={25} color="#4335A7" />
          <Text>Filter</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  filterContainer: {
    justifyContent: "center", // Centers vertically
    alignItems: "flex-end", // Moves all items to the right
    paddingLeft: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    paddingVertical: 0,
    paddingHorizontal: 10,
    height: 45,
  },
  searchInput: {
    width: '90%',
    borderWidth: 0,
    color: 'black',
  },
  recordingText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1294FF',
  },
  filterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;