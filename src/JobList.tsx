import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, SafeAreaView } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../components/Loading';
import NavBar from '../components/NavBar';
import Search2 from '../components/Search2';
import { useRoute } from '@react-navigation/native';
import JobCard from '../components/JobCard';

type Job = {
  job_id: string;
  title: string;
  location: string;
  date?: string;
  time: string;
  type: string;
  job_type: string;
};

type Filters = {
  date?: string;
  job_type?: string;
};

const FilteredJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  
  // Get filters from route params
  const filters: Filters = route.params?.filters || {};

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
        const db = firebase
          .app()
          .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/')
          .ref('Jobs');

        const snapshot = await db.once('value');
        if (!snapshot.exists()) {
          setJobs([]);
          setFilteredJobs([]);
          return;
        }

        const jobsData = snapshot.val();
        const currentDate = getCurrentDate();

        const jobsList: Job[] = Object.keys(jobsData)
          .map((key) => ({
            job_id: key,
            title: jobsData[key].title || 'No Title',
            location: jobsData[key].location || 'No Location',
            date: jobsData[key].date,
            time: jobsData[key].time || 'No Time',
            type: jobsData[key].type || 'No Type',
            job_type: jobsData[key].job_type || 'No Job Type',
          }))
          .filter((job) => {
            // Only process type B jobs
            if (job.type !== 'B') return false;
            
            // Filter by date (only future dates)
            const jobDate = parseDate(job.date);
            if (!jobDate) return false;
            return jobDate >= currentDate;
          });

        setJobs(jobsList);
        setFilteredJobs(jobsList); // Initially show all jobs
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    if (filters.date || filters.job_type) {
      const filtered = jobs.filter((job) => {
        // Clean and trim filter values
        const filterDate = filters.date ? filters.date.trim().toLowerCase() : '';
        const filterJobType = filters.job_type ? filters.job_type.trim().toLowerCase() : '';
        
        // Ensure job data is valid
        const jobDate = job.date?.trim().toLowerCase() ?? '';
        const jobType = job.job_type?.trim().toLowerCase() ?? '';
        
        // Apply filters
        const matchesDate = filterDate ? jobDate.includes(filterDate) : true;
        const matchesJobType = filterJobType ? jobType.includes(filterJobType) : true;
        
        return matchesDate && matchesJobType;
      });
      
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs); // If no filters, display all jobs
    }
  }, [filters, jobs]);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <Text style={styles.heading}>Jobs Available</Text>
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.job_id}
        renderItem={({ item }) => (
          <JobCard
            jobId={item.job_id}
            title={item.job_type}
            location={item.location}
            date={item.date || 'No Date'}
            time={item.time}
          />
        )}
        ListEmptyComponent={<Text style={styles.noJobs}>No jobs found matching your criteria.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noJobs: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default FilteredJobs;