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
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginTop: 5 },
  slider: { width: '100%', height: 40 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, marginTop: 20, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default FilterScreen;