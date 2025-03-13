import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';

const FilterScreen = () => {
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(0);
  const [skill, setSkill] = useState('');
  const navigation = useNavigation();

  const applyFilters = () => {
    // Pass filter values to AllUsers screen
    navigation.navigate('AllUser', {
      filters: { location, rating, skill },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city or area"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Minimum Rating: {rating}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={5}
        step={0.5}
        value={rating}
        onValueChange={setRating}
      />

      <Text style={styles.label}>Skill</Text>
      <RNPickerSelect
        onValueChange={setSkill}
        items={[
          { label: 'Electrician', value: 'electrician' },
          { label: 'Plumber', value: 'plumber' },
          { label: 'Painter', value: 'painter' },
          { label: 'HVAC Technician', value: 'hvac-technician' },
          { label: 'Other', value: 'other' },
        ]}
        placeholder={{ label: 'Select Skill', value: '' }}
      />

      <TouchableOpacity style={styles.button} onPress={applyFilters}>
        <Text style={styles.buttonText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f1f3f4' 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#343a40',
  },
  label: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginTop: 20,
    color: '#495057',
  },
  input: { 
    borderWidth: 1, 
    padding: 12, 
    borderRadius: 12, 
    marginTop: 8, 
    borderColor: '#ced4da',
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  slider: { 
    width: '100%', 
    height: 40, 
    marginTop: 10 
  },
  button: { 
    backgroundColor: '#007bff', 
    padding: 18, 
    borderRadius: 12, 
    marginTop: 30, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  clearButton: { 
    backgroundColor: '#6c757d', 
    padding: 18, 
    borderRadius: 12, 
    marginTop: 20, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 18,
  }
});

export default FilterScreen;