import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type JobCardProps = {
  jobId: string;
  title: string;
  location: string;
  date: string;
  time: string;
};

const JobCard: React.FC<JobCardProps> = ({ jobId, title, location, date, time }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>📍 {location}</Text>
      <Text style={styles.detail}>📅 {date}</Text>
      <Text style={styles.detail}>⏰ {time}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ViewJobDetails', { jobId })}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1294FF',
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  button: {
    backgroundColor: '#1294FF',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default JobCard;