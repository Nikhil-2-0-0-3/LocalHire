import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';

const SearchBar = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [recording, setRecording] = useState(false);
  const [dots, setDots] = useState('...');
  const API_KEY = 'AIzaSyBpE4SoC4ostrQ8wL68-mYQc-5uhz10QQg'; // Gemini API key
  const SPEECH_API_KEY = 'AIzaSyBLUa9rx-mv7aJiUTiJH9d3OkFjt0irNlw'; // Replace with your actual key

  // Audio configuration
  const audioConfig = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    audioSource: 6,
    wavFile: 'test.wav'
  };

  const verifyAudioFile = async (filePath: string) => {
    try {
      const fileInfo = await RNFS.stat(filePath);
      console.log('Audio file info:', {
        size: fileInfo.size,
        path: fileInfo.path,
        lastModified: new Date(fileInfo.lastModified).toISOString()
      });
      
      if (fileInfo.size === 0) {
        Alert.alert('Error', 'Audio file is empty!');
        return false;
      }
      return true;
    } catch (error) {
      console.error('File verification failed:', error);
      return false;
    }
  };

  // Initialize audio recording
  useEffect(() => {
    AudioRecord.init(audioConfig);
    
    AudioRecord.on('data', (data) => {
      // You can handle real-time data here if needed
    });

    return () => {
      AudioRecord.stop();
    };
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone for speech recognition',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission denied', 'Microphone permission is required');
        return;
      }

      setRecording(true);
      await AudioRecord.start();
    } catch (err) {
      console.error('Failed to start recording', err);
      setRecording(false);
    }
  };

  // Stop recording and send to Google Speech-to-Text
  const stopRecording = async () => {
    try {
      setRecording(false);
      const audioFile = await AudioRecord.stop();
      const isValid = await verifyAudioFile(audioFile);
      console.log(isValid, 'Audio file path:');
      
      const audioData = await RNFS.readFile(audioFile, 'base64');
      const speechText = await recognizeSpeech(audioData);
      
      if (speechText) {
        setSearchText(speechText);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Recognize speech using Google Cloud Speech-to-Text
  const recognizeSpeech = async (audioData: string) => {
    try {
      const payload = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        audio: {
          content: audioData
        }
      };
  
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${SPEECH_API_KEY}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );
  
      if (response.data.results && response.data.results[0]) {
        return response.data.results[0].alternatives[0].transcript;
      }
      return null;
    } catch (error) {
      console.error('Speech recognition error:', error);
      Alert.alert('Error', 'Failed to recognize speech');
      return null;
    }
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // Perform NER using Gemini API
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
        timeout: 10000,
      });
  
      const responseText = response.data?.candidates[0]?.content?.parts[0]?.text || 'No content in response';
      console.log('API Response:', responseText);

      // Improved entity extraction
      const extractEntity = (text: string, tag: string) => {
        const regex = new RegExp(`${tag}:\\s*([^\\n]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      const location = extractEntity(responseText, 'location');
      const skill = extractEntity(responseText, 'job');
      const salaryMatch = responseText.match(/min salary:\s*([\d,]+)/i);
      const ratingMatch = responseText.match(/min rating:\s*([\d.]+)/i);

      const salary = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, ''), 10) : 0;
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;

      console.log('Extracted Filters:', { location, skill, salary, rating });

      // Navigate with filters only if we have at least one valid filter
      if (location || skill || salary || rating) {
        navigation.navigate('AllUser', {
          filters: { 
            location: location || undefined,
            skill: skill || undefined,
            rating: rating || undefined
          },
        });
      } else {
        Alert.alert('No Filters', 'Could not extract any filters from the search text');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      Alert.alert('Error', error.message || 'Failed to process search');
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
            returnKeyType="search"
          />
        )}
        
        <TouchableOpacity onPress={toggleRecording}>
          <Icon name='microphone' size={20} color={recording ? 'red' : '#4335A7'} />
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  filterContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
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