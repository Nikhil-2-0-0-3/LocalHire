import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import Loading from '../components/Loading';

type JobDetails = {
  job_id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  budget: number;
  duration: string;
  contact_info: string;
  job_type:string;
};

const ViewJobDetails = ({ route }:any) => {
  const { jobId } = route.params;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
        const jobRef = db.ref(`Jobs/${jobId}`);

        const snapshot = await jobRef.once('value');
        if (snapshot.exists()) {
          const jobData = snapshot.val();
          setJob(jobData);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading/>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <Text>Job not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.job_type}</Text>
      <Text style={styles.detail}>📍 {job.location}</Text>
      <Text style={styles.detail}>📅 {job.date}</Text>
      <Text style={styles.detail}>⏰ {job.time}</Text>
      <Text style={styles.detail}>💰 Budget: ${job.budget}</Text>
      <Text style={styles.detail}>⏳ Duration: {job.duration}</Text>
      <Text style={styles.detail}>📞 Contact: {job.contact_info}</Text>
      
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1294FF',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
});

export default ViewJobDetails;