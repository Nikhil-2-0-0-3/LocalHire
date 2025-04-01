import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../components/Loading';

const PostedJobsScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPostedJobs = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;

      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
      
      // Get the object of job IDs posted by the user
      const jobsPostedRef = db.ref(`users/${uid}/JobsPosted`);
      const jobsPostedSnapshot = await jobsPostedRef.once('value');

      
      if (!jobsPostedSnapshot.exists()) {
        setJobs([]);
        setLoading(false);
        return;
      }

      // Convert the object to an array of job IDs
      const jobsPostedObject = jobsPostedSnapshot.val();
      //const jobIds = Object.keys(jobsPostedObject);
      const jobIds=jobsPostedSnapshot.val();
      console.log('Job IDs:', jobIds);
      
      // Fetch details for each job
      const jobsPromises = jobIds.map(async (jobId) => {
        const jobSnapshot = await db.ref(`Jobs/${jobId}`).once('value');
        return {
          id: jobId,
          ...jobSnapshot.val()
        };
      });

      const jobsList = await Promise.all(jobsPromises);
      setJobs(jobsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
      Alert.alert('Error', 'Failed to load posted jobs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostedJobs();
  }, []);

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('ViewJobDetails', { jobId: item.id })}
    >
      <Text style={styles.jobTitle}>{item.job_type || 'Untitled Job'}</Text>
      <Text style={styles.jobInfo}>Location: {item.location || 'Not specified'}</Text>
      <Text style={styles.jobInfo}>Date: {item.date || 'Not specified'}</Text>
      <Text style={styles.jobInfo}>Available Positions: {item.no_of_users || 0}</Text>
      <Text style={styles.jobInfo}>Hired Workers: {item.users_hired || 0}</Text>
      <Text style={styles.jobStatus}>Status: {item.status || 'open'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Posted Jobs</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You haven't posted any jobs yet.</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4335A7',
  },
  jobCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4335A7',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  jobInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  jobStatus: {
    fontSize: 14,
    color: '#4335A7',
    fontWeight: 'bold',
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
});

export default PostedJobsScreen;