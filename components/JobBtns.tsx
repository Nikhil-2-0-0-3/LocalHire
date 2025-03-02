import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation stack types
type RootStackParamList = {
  JobDetails2: undefined; // Define the route and its parameters (if any)
  // Add other routes here
};

type JobDetails2ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobDetails2'>;

export default function JobBtns() {
  const navigation = useNavigation<JobDetails2ScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btns}
        onPress={() => navigation.navigate('JobDetails2')}
      >
        <Text style={styles.txt}>List Job</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btns}>
        <Text style={styles.txt}>See More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btns: {
    backgroundColor: '#1294FF',
    borderRadius: 25,
  },
  txt: {
    color: 'white',
    padding: 10,
  },
});