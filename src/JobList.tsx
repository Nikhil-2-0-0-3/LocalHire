import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';

type Job = {
  job_id: string;
  title: string;
  location: string;
  date?: string; // Make date optional since it might be undefined
  time: string;
  type: string;
};

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe date parsing with validation
  const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    
    try {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      
      const [day, month, year] = parts.map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      
      return new Date(year, month - 1, day);
    } catch (e) {
      console.warn('Failed to parse date:', dateString);
      return null;
    }
  };

  const getCurrentDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    return today;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        if (!uid) {
          setError('User ID not found');
          return;
        }

        const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
        const jobsRef = db.ref('Jobs');

        const snapshot = await jobsRef.once('value');
        if (!snapshot.exists()) {
          setJobs([]);
          return;
        }

        const jobsData = snapshot.val();
        const currentDate = getCurrentDate();

        const jobsList: Job[] = Object.keys(jobsData)
          .map((key) => ({
            job_id: key,
            title: jobsData[key].title || 'No Title',
            location: jobsData[key].location || 'No Location',
            date: jobsData[key].date, // Might be undefined
            time: jobsData[key].time || 'No Time',
            type: jobsData[key].type || 'No Type',
          }))
          .filter((job) => {
            // Only process type B jobs
            if (job.type !== 'B') return false;
            
            // Skip if no date
            if (!job.date) return false;
            
            const jobDate = parseDate(job.date);
            if (!jobDate) return false;
            
            return jobDate >= currentDate;
          });

        setJobs(jobsList);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.job_id}
        renderItem={({ item }) => (
          <JobCard
            jobId={item.job_id}
            title={item.title}
            location={item.location}
            date={item.date || 'No Date'}
            time={item.time}
          />
        )}
        ListEmptyComponent={<Text>No upcoming jobs found.</Text>}
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default JobList;