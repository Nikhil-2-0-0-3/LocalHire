import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AcceptedJobsScreen = ({ navigation }) => {
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState([]);

  useEffect(() => {
    const fetchAcceptedJobs = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        if (!uid) return;

        const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
        const snapshot = await db.ref(`users/${uid}/acceptedJobs`).once('value');
        
        if (snapshot.exists()) {
          const jobIds = snapshot.val();
          setAcceptedJobs(jobIds);
          
          // Fetch details for each job
          const jobs = await Promise.all(
            jobIds.map(async jobId => {
              const jobSnapshot = await db.ref(`Jobs/${jobId}`).once('value');
              return { id: jobId, ...jobSnapshot.val() };
            })
          );
          setJobDetails(jobs);
        }
      } catch (error) {
        console.error('Error fetching accepted jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedJobs();
  }, []);

  const renderJobItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('NotificationDetails', { job_id: item.id })}
    >
      <View style={styles.jobHeader}>
        <Icon name="work" size={24} color="#4335A7" />
        <Text style={styles.jobTitle}>{item.job_type}</Text>
      </View>
      <View style={styles.jobDetail}>
        <Icon name="location-on" size={20} color="#777" />
        <Text style={styles.jobText}>{item.location}</Text>
      </View>
      {item.date && (
        <View style={styles.jobDetail}>
          <Icon name="event" size={20} color="#777" />
          <Text style={styles.jobText}>{item.date}</Text>
        </View>
      )}
      <View style={styles.jobFooter}>
        <Text style={styles.statusText}>Status: Accepted</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4335A7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#4335A7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accepted Jobs</Text>
        <View style={{ width: 24 }} /> {/* For alignment */}
      </View>

      {jobDetails.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="work-off" size={50} color="#777" />
          <Text style={styles.emptyText}>No accepted jobs yet</Text>
        </View>
      ) : (
        <FlatList
          data={jobDetails}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4335A7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  jobText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  jobFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
  },
});

export default AcceptedJobsScreen;