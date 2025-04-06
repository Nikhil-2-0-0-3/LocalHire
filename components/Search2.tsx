import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Search2 = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const API_KEY = 'AIzaSyBpE4SoC4ostrQ8wL68-mYQc-5uhz10QQg'; // Replace with your actual key

  // Perform NER using Gemini API to extract date and job_type
  const performNER = async (inputText: string) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
    const data = {
      contents: [
        {
          parts: [
            {
              text: `Text: {${inputText}} Task: Extract entities with the following tags: date, job_type. Output format: tag: entity. Include only available tags.`,
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
        timeout: 10000,
      });
  
      const responseText = response.data?.candidates[0]?.content?.parts[0]?.text || 'No content in response';
      console.log('API Response:', responseText);

      // Extract entities from response
      const extractEntity = (text: string, tag: string) => {
        const regex = new RegExp(`${tag}:\\s*([^\\n]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      const date = extractEntity(responseText, 'date');
      const jobType = extractEntity(responseText, 'job_type');

      console.log('Extracted Filters:', { date, jobType });

      // Navigate with filters only if we have at least one valid filter
      if (date || jobType) {
        navigation.navigate('FilteredJobs', {
          filters: { 
            date: date || undefined,
            job_type: jobType || undefined
          },
        });
      } else {
        Alert.alert('No Filters', 'Could not extract date or job type from the search text');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      Alert.alert('Error', error.message || 'Failed to process search');
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', width: '90%', margin: 'auto' }}>
      <View style={styles.searchBar}>
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

        <TextInput
          placeholder="Search jobs by type or date..."
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
          returnKeyType="search"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default Search2;