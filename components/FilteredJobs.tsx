import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JobCard from '../components/JobCard'; // Import the JobCard component

type Job = {
  job_id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  type: string;
};

const FilteredJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        if (!uid) {
          console.error('User ID not found');
          return;
        }

        const db = firebase
          .app()
          .database(
            'https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/'
          );
        const jobsRef = db.ref('Jobs');

        const snapshot = await jobsRef.once('value');
        if (snapshot.exists()) {
          const jobsData = snapshot.val();
          const jobsList: Job[] = Object.keys(jobsData)
            .map((key) => ({
              job_id: key,
              title: jobsData[key].title,
              location: jobsData[key].location,
              date: jobsData[key].date,
              time: jobsData[key].time,
              type: jobsData[key].type,
            }))
            .filter((job) => job.type === 'B') // Filter jobs where job_type is 'B'
            .slice(0, 3); // Limit to only 3 jobs

          setJobs(jobsList);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <Text style={styles.heading}>Jobs Available</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.job_id}
        renderItem={({ item }) => (
          <JobCard
            jobId={item.job_id}
            title={item.title}
            location={item.location}
            date={item.date}
            time={item.time}
          />
        )}
        ListEmptyComponent={<Text>No jobs found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default FilteredJobs;
