import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { firebase } from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';

type JobDetails = {
  job_id: string;
  job_type: string;
  location: string;
  address: string;
  date: string;
  salary_range?: number;
  status?: string;
};

const NotificationDetails = () => {
  const route = useRoute();
  const { job_id } = route.params as { job_id: string };
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const db = firebase
          .app()
          .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

        const snapshot = await db.ref(`Jobs/${job_id}`).once('value');
        
        if (snapshot.exists()) {
          setJobDetails(snapshot.val());
        } else {
          console.warn('No job found with this ID');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [job_id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4335A7" />
      </SafeAreaView>
    );
  }

  if (!jobDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No job details found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="work" size={30} color="#4335A7" style={styles.headerIcon} />
          <Text style={styles.title}>Job Details</Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Icon name="work-outline" size={24} color="#555" style={styles.icon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Job Type</Text>
              <Text style={styles.detailValue}>{jobDetails.job_type}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="location-on" size={24} color="#555" style={styles.icon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{jobDetails.location}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="home" size={24} color="#555" style={styles.icon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{jobDetails.address}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="event" size={24} color="#555" style={styles.icon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{jobDetails.date}</Text>
            </View>
          </View>

          {jobDetails.salary_range && (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Icon name="currency-rupee" size={24} color="#555" style={styles.icon} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Salary</Text>
                  <Text style={styles.detailValue}>₹{jobDetails.salary_range}</Text>
                </View>
              </View>
            </>
          )}

          {jobDetails.status && (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Icon name="info" size={24} color="#555" style={styles.icon} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[
                    styles.detailValue,
                    jobDetails.status === 'accepted' ? styles.statusAccepted : styles.statusPending
                  ]}>
                    {jobDetails.status.charAt(0).toUpperCase() + jobDetails.status.slice(1)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  headerIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
  statusAccepted: {
    color: '#28a745',
  },
  statusPending: {
    color: '#ffc107',
  },
  icon: {
    width: 30,
  },
});

export default NotificationDetails;