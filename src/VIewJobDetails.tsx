import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  SafeAreaView,
  Alert
} from 'react-native';
import { firebase } from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewJobDetails = ({ route }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const db = firebase
          .app()
          .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

        const snapshot = await db.ref(`Jobs/${jobId}`).once('value');
        
        if (snapshot.exists()) {
          setJob(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [jobId]);

  const handleApply = async () => {
    if (!job || !job.senderUid) return;
    setApplying(true);
    
    try {
      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
      const notificationRef = db.ref(`users/${job.senderUid}/notifications`).push();
      const uid = await AsyncStorage.getItem('userId') || 'none';
      
      await notificationRef.set({ 
        jobId, 
        type: 'B', 
        btnActive: true, 
        senderUid: uid,
        job_type: job.job_type
      });
      
      Alert.alert('Success', 'Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      Alert.alert('Error', 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading job details...</Text>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Job details not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.stripeBackground} />
        
        <View style={styles.card}>
          <Icon 
            name="work-outline" 
            size={40} 
            color="#4335A7" 
            style={styles.headerIcon} 
          />
          <Text style={styles.title}>{job.job_type}</Text>
          
          <View style={styles.detailsContainer}>
            {/* Location */}
            <Text style={styles.detailLabel}>Location</Text>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={24} color="#4335A7" />
              <Text style={styles.detailText}>{job.location}</Text>
            </View>
            
            {/* Address */}
            {job.address && (
              <>
                <Text style={styles.detailLabel}>Address</Text>
                <View style={styles.detailRow}>
                  <Icon name="home" size={24} color="#4335A7" />
                  <Text style={styles.detailText}>{job.address}</Text>
                </View>
              </>
            )}
            
            {/* Date */}
            <Text style={styles.detailLabel}>Date</Text>
            <View style={styles.detailRow}>
              <Icon name="event" size={24} color="#4335A7" />
              <Text style={styles.detailText}>{job.date}</Text>
            </View>
            
            {/* Time */}
            {job.time && (
              <>
                <Text style={styles.detailLabel}>Time</Text>
                <View style={styles.detailRow}>
                  <Icon name="access-time" size={24} color="#4335A7" />
                  <Text style={styles.detailText}>{job.time}</Text>
                </View>
              </>
            )}
            
            {/* Budget */}
            {job.budget && (
              <>
                <Text style={styles.detailLabel}>Budget</Text>
                <View style={styles.detailRow}>
                  <Icon name="currency-rupee" size={24} color="#4335A7" />
                  <Text style={styles.detailText}>₹{job.budget}</Text>
                </View>
              </>
            )}
            
            {/* Duration */}
            {job.duration && (
              <>
                <Text style={styles.detailLabel}>Duration</Text>
                <View style={styles.detailRow}>
                  <Icon name="hourglass-full" size={24} color="#4335A7" />
                  <Text style={styles.detailText}>{job.duration}</Text>
                </View>
              </>
            )}
            
            {/* Contact Info */}
            {job.contact_info && (
              <>
                <Text style={styles.detailLabel}>Contact Information</Text>
                <View style={styles.detailRow}>
                  <Icon name="contact-phone" size={24} color="#4335A7" />
                  <Text style={styles.detailText}>{job.contact_info}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, applying && styles.buttonDisabled]} 
          onPress={handleApply}
          disabled={applying}
        >
          <Icon 
            name={applying ? "hourglass-top" : "send"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {applying ? 'Applying...' : 'Apply for Job'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stripeBackground: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    backgroundColor: '#4335A7',
    transform: [{ rotate: '45deg' }],
    opacity: 0.1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    width: '90%',
    borderWidth: 0,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailsContainer: {
    width: '100%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 15,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4335A7',
    padding: 12,
    borderRadius: 5,
    elevation: 3,
    width: '90%',
  },
  buttonDisabled: {
    backgroundColor: '#7c6fcf',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
});

export default ViewJobDetails;