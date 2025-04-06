import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  PermissionsAndroid, 
  Platform,
  Animated,
  Easing
} from 'react-native';
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
  const API_KEY = 'AIzaSyBpE4SoC4ostrQ8wL68-mYQc-5uhz10QQg';
  const SPEECH_API_KEY = 'AIzaSyBLUa9rx-mv7aJiUTiJH9d3OkFjt0irNlw';
  const pulseAnim = new Animated.Value(1);

  // Audio configuration
  const audioConfig = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    audioSource: 6,
    wavFile: 'test.wav'
  };

  useEffect(() => {
    AudioRecord.init(audioConfig);
    AudioRecord.on('data', (data) => {});
    
    return () => {
      AudioRecord.stop();
    };
  }, []);

  useEffect(() => {
    if (recording) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recording]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const verifyAudioFile = async (filePath: string) => {
    try {
      const fileInfo = await RNFS.stat(filePath);
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

  const stopRecording = async () => {
    try {
      setRecording(false);
      const audioFile = await AudioRecord.stop();
      const isValid = await verifyAudioFile(audioFile);
      if (isValid) {
        const audioData = await RNFS.readFile(audioFile, 'base64');
        const speechText = await recognizeSpeech(audioData);
        if (speechText) setSearchText(speechText);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

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
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
  
      if (response.data.results?.[0]) {
        return response.data.results[0].alternatives[0].transcript;
      }
      return null;
    } catch (error) {
      console.error('Speech recognition error:', error);
      Alert.alert('Error', 'Failed to recognize speech');
      return null;
    }
  };

  const toggleRecording = async () => {
    if (recording) await stopRecording();
    else await startRecording();
  };

  const performNER = async (inputText: string) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Text: {${inputText}} Task: Extract named entities with the following tags: location, job, min salary, min rating. Output format: tag: entity. Include only available tags.`
            }]
          }]
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      const responseText = response.data?.candidates[0]?.content?.parts[0]?.text || '';
      const extractEntity = (text: string, tag: string) => {
        const match = text.match(new RegExp(`${tag}:\\s*([^\\n]+)`, 'i'));
        return match ? match[1].trim() : '';
      };

      const location = extractEntity(responseText, 'location');
      const skill = extractEntity(responseText, 'job');
      const rating = parseFloat(extractEntity(responseText, 'min rating')) || undefined;

      if (location || skill || rating) {
        navigation.navigate('AllUser', { filters: { location, skill, rating } });
      } else {
        Alert.alert('No Filters', 'Could not extract any filters from the search text');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', error.message || 'Failed to process search');
    }
  };

  useEffect(() => {
    let interval: any;
    if (recording) {
      interval = setInterval(() => {
        setDots(prev => prev === 'Listening...' ? 'Listening..' : prev === 'Listening..' ? 'Listening.' : 'Listening...');
      }, 500);
    } else {
      setDots('Search Job here...');
    }
    return () => clearInterval(interval);
  }, [recording]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#6C63FF" style={styles.searchIcon} />
          
          {recording ? (
            <View style={styles.recordingIndicator}>
              <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.recordingText}>{dots}</Text>
            </View>
          ) : (
            <TextInput
              style={styles.searchInput}
              placeholder={dots}
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => searchText.trim() && performNER(searchText)}
              returnKeyType="search"
            />
          )}

          <TouchableOpacity onPress={toggleRecording} style={styles.micButton}>
            <Icon 
              name="microphone" 
              size={20} 
              color={recording ? '#FF4757' : '#6C63FF'} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => navigation.navigate('FilterScreen')}
        >
          <Icon name="sliders" size={20} color="#6C63FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4757',
    marginRight: 8,
  },
  recordingText: {
    color: '#FF4757',
    fontSize: 16,
  },
  micButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SearchBar;