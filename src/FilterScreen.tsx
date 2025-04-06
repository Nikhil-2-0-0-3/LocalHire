import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import Slider from '@react-native-community/slider';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FilterScreen = () => {
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(0);
  const [skill, setSkill] = useState('');
  const navigation = useNavigation();

  const applyFilters = () => {
    navigation.navigate('AllUser', {
      filters: { 
        location: location.trim(), 
        rating: rating > 0 ? rating : undefined,
        skill: skill || undefined
      },
    });
  };

  const clearFilters = () => {
    setLocation('');
    setRating(0);
    setSkill('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#6C63FF" />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Workers</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Location Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>
            <Icon name="location-on" size={18} color="#6C63FF" /> Location
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city or area"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Rating Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>
            <Icon name="star" size={18} color="#6C63FF" /> Minimum Rating: {rating.toFixed(1)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.5}
            value={rating}
            onValueChange={setRating}
            minimumTrackTintColor="#6C63FF"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#6C63FF"
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabel}>0</Text>
            <Text style={styles.ratingLabel}>5</Text>
          </View>
        </View>

        {/* Skill Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>
            <Icon name="work" size={18} color="#6C63FF" /> Skill
          </Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={setSkill}
              value={skill}
              items={[
                { label: 'Electrician', value: 'electrician' },
                { label: 'Plumber', value: 'plumber' },
                { label: 'Painter', value: 'painter' },
                { label: 'HVAC Technician', value: 'hvac-technician' },
                { label: 'Carpenter', value: 'carpenter' },
                { label: 'Other', value: 'other' },
              ]}
              placeholder={{ 
                label: 'Select a skill...', 
                value: null,
                color: '#999'
              }}
              style={pickerSelectStyles}
              Icon={() => <Icon name="arrow-drop-down" size={24} color="#6C63FF" />}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearFilters}
          >
            <Text style={styles.buttonText}>Clear Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.applyButton]} 
            onPress={applyFilters}
          >
            <Text style={styles.buttonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    color: '#333',
    paddingRight: 30,
    backgroundColor: '#FFF',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    color: '#333',
    paddingRight: 30,
    backgroundColor: '#FFF',
  },
  iconContainer: {
    top: 12,
    right: 12,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#6C63FF',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#6C63FF',
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterScreen;