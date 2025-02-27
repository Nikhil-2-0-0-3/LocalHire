import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
const SaveToDb = async (skills: string[]) => {

    console.log(skills)
    const userData = {
        skills:skills
      };
    const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
    
    const uid = await AsyncStorage.getItem('userId'); // Ensure correct retrieval of UID
    if (!uid) {
        console.error("User ID not found");
        return;
    }

    db.ref(`users/${uid}`).update(userData)
        .then(() => {console.log("Skills saved successfully"
        )})
        .catch((error) => console.error("Error saving skills:", error));
};
const Skill = () => {
const navigation = useNavigation();
  
  const [jobType, setJobType] = useState('');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const jobTypes = ['Plumber', 'Mechanic', 'Electrician', 'Carpenter', 'Painter', 'Welder', 'Driver', 'Cook', 'Gardener', 'Cleaner'];

  const handleJobTypeClick = (type) => {
    if (!selectedJobs.includes(type)) {
      setSelectedJobs([...selectedJobs, type]);
    }
    setJobType('');
    setSuggestions([]);
  };

  const handleInputChange = (text) => {
    setJobType(text);
    if (text.length > 0) {
      const filteredSuggestions = jobTypes.filter((job) =>
        job.toLowerCase().includes(text.toLowerCase()) && !selectedJobs.includes(job)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleRemoveJob = (job) => {
    setSelectedJobs(selectedJobs.filter((item) => item !== job));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://placehold.co/40x40' }}
            style={styles.logo}
          />
        </View>
        <Text style={styles.question}>What was the job type?</Text>
        <TextInput
          style={styles.input}
          placeholder="Type message here..."
          value={jobType}
          onChangeText={handleInputChange}
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() => handleJobTypeClick(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        <View style={styles.selectedJobsContainer}>
          {selectedJobs.map((job, index) => (
            <View key={index} style={styles.selectedJob}>
              <Text style={styles.selectedJobText}>{job}</Text>
              <TouchableOpacity onPress={() => handleRemoveJob(job)}>
                <Text style={styles.removeJobText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.buttonContainer}>
          {jobTypes.map((job, index) => (
            <TouchableOpacity key={index} style={styles.button} onPress={() => handleJobTypeClick(job)}>
              <Text style={styles.buttonText}>{job}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={()=>{
            SaveToDb(selectedJobs)
            .then(()=>{navigation.navigate('home1')})
        }}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    maxHeight: 150,
    marginBottom: 20,
  },
  suggestion: {
    padding: 10,
  },
  suggestionText: {
    fontSize: 16,
  },
  selectedJobsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  selectedJob: {
    backgroundColor: '#E0E7FF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    margin: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedJobText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  removeJobText: {
    color: '#FF0000',
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
  },
  buttonText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#E0E7FF',
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#3B82F6',
    fontSize: 16,
  },
});

export default Skill;