import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loading from '../components/Loading';
import { useFocusEffect } from '@react-navigation/native';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications and responses
  const fetchData = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;

      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

      // Fetch notifications
      const notificationsRef = db.ref(`users/${uid}/notifications`);
      notificationsRef.on('value', async (snapshot) => {
        if (snapshot.exists()) {
          const notificationsData = snapshot.val();
          const notificationsList = await Promise.all(
            Object.keys(notificationsData).map(async (key) => {
              const notification = notificationsData[key];
              let message = notification.message;
              
              // For type B notifications, get applier's name
              if (notification.type === 'B' && notification.senderUid) {
                const applierSnapshot = await db.ref(`users/${notification.senderUid}/name`).once('value');
                const applierName = applierSnapshot.val();
                const jobSnapshot = await db.ref(`Jobs/${notification.jobId}`).once('value');
                const jobData = jobSnapshot.val();
                message = `${applierName} has applied for the ${jobData.job_type}`;
              }
              
              return {
                id: key,
                ...notification,
                message: message
              };
            })
          );
          setNotifications(notificationsList);
        } else {
          setNotifications([]);
        }
        setLoading(false);
      });

      // Fetch responses with more descriptive messages
      const responsesRef = db.ref(`users/${uid}/responses`);
      responsesRef.on('value', async (snapshot) => {
        if (snapshot.exists()) {
          const responsesData = snapshot.val();
          const responsesList = await Promise.all(
            Object.keys(responsesData).map(async (key) => {
              const response = responsesData[key];
              
              // Create different messages based on response type
              let message = '';
              
              if (response.type === 'A') {
                // For type A responses (job offers)
                message = `${response.senderName} ${response.status} the job for ${response.job_type}${response.status === 'accepted' ? ` and will appear for work on ${response.date}` : ''}`;
              } else {
                // For type B responses (job applications)
                message = response.status === 'accepted' 
                  ? `Your application for ${response.job_type} has been accepted. View details on the Accepted Jobs page.`
                  : `Your application for ${response.job_type} was rejected`;
              }
              
              return {
                id: key,
                ...response,
                message: message,
              };
            })
          );
          setResponses(responsesList);
        } else {
          setResponses([]);
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle job acceptance
  const handleAcceptJob = async (jobId, notificationId, type, senderUid) => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
    
      // First get current job data
      const jobSnapshot = await db.ref(`Jobs/${jobId}`).once('value');
      const jobData = jobSnapshot.val();
      
      // Check if there are available positions
      if (jobData.no_of_users <= 0) {
        Alert.alert('Error', 'No available positions for this job');
        return;
      }
  
      // Update job counts
      await db.ref(`Jobs/${jobId}`).update({
        status: 'accepted',
        no_of_users: jobData.no_of_users - 1,
        users_hired: (jobData.users_hired || 0) + 1
      });
  
      // Rest of your existing acceptance logic...
      const targetUid = type === 'B' ? senderUid : jobData.senderUid;
    
      const acceptedJobsRef = db.ref(`users/${targetUid}/acceptedJobs`);
      const snapshot = await acceptedJobsRef.once('value');
      const currentJobs = snapshot.exists() ? snapshot.val() : [];
      const updatedJobs = [...currentJobs, jobId];
      await acceptedJobsRef.set(updatedJobs);
  
      const senderSnapshot = await db.ref(`users/${targetUid}/name`).once('value');
      const senderName = senderSnapshot.val();
      const currentUserSnapshot = await db.ref(`users/${uid}/name`).once('value');
      const currentUserName = currentUserSnapshot.val();
  
      const responseData = {
        jobId,
        status: 'accepted',
        job_type: jobData.job_type,
        senderUid: uid,
        date: jobData.date,
        type: type,
        senderName: currentUserName,
      };
    
      await db.ref(`users/${targetUid}/responses/${jobId}`).set(responseData);
    
      await db.ref(`users/${uid}/notifications/${notificationId}`).update({
        btnActive: false,
        message: type === 'B' 
          ? `You accepted ${senderName}'s application for ${jobData.job_type}` 
          : `You accepted the job: ${jobData.job_type}`,
      });
    
      if (type === 'B') {
        await db.ref(`users/${senderUid}/notifications/${notificationId}`).update({
          btnActive: false,
          message: `Your application for ${jobData.job_type} has been accepted. View details on the Accepted Jobs page.`,
        });
      }
    
      Alert.alert('Job Accepted', 'You have accepted the job.');
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  // Handle job rejection
  const handleRejectJob = async (jobId, notificationId, type, senderUid) => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

      // Update job status to "rejected"
      await db.ref(`Jobs/${jobId}`).update({ status: 'rejected' });

      // Get job data
      const jobSnapshot = await db.ref(`Jobs/${jobId}`).once('value');
      const jobData = jobSnapshot.val();
      
      // For type B, the senderUid is the applier's UID
      const targetUid = type === 'B' ? senderUid : jobData.senderUid;

      // Get names for response messages
      const senderSnapshot = await db.ref(`users/${targetUid}/name`).once('value');
      const senderName = senderSnapshot.val();
      const currentUserSnapshot = await db.ref(`users/${uid}/name`).once('value');
      const currentUserName = currentUserSnapshot.val();

      // Create response data with more details
      const responseData = {
        jobId,
        status: 'rejected',
        job_type: jobData.job_type,
        senderUid: uid,
        date: jobData.date,
        type: type,
        senderName: currentUserName,
      };

      // Send response to the sender
      await db.ref(`users/${targetUid}/responses/${jobId}`).set(responseData);

      // Update notification message
      await db.ref(`users/${uid}/notifications/${notificationId}`).update({
        btnActive: false,
        message: type === 'B' 
          ? `You rejected ${senderName}'s application for ${jobData.job_type}` 
          : `You rejected the job: ${jobData.job_type}`,
      });

      // For type B, also update the applier's notification
      if (type === 'B') {
        await db.ref(`users/${senderUid}/notifications/${notificationId}`).update({
          btnActive: false,
          message: `Your application for ${jobData.job_type} was rejected`,
        });
      }

      Alert.alert('Job Rejected', 'You have rejected the job.');
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;

      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
      await db.ref(`users/${uid}/notifications/${notificationId}`).remove();
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to remove notification');
    }
  };

  // Delete response
  const handleDeleteResponse = async (responseId) => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;

      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
      await db.ref(`users/${uid}/responses/${responseId}`).remove();
    } catch (error) {
      console.error('Error deleting response:', error);
      Alert.alert('Error', 'Failed to remove response');
    }
  };

  // Render notification card
  const renderNotificationCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={styles.jobType}>{item.job_type || 'Job Application'}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Icon name="times" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
      
      {item.btnActive && (
        <View style={styles.buttonsContainer}>
          {/* For type A notifications - View Details button */}
          {item.type === 'A' && (
            <TouchableOpacity
              style={[styles.button, styles.viewButton]}
              onPress={() => navigation.navigate('NotificationDetails', { job_id: item.jobId || item.job_id })}
            >
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          )}
          
          {/* For type B notifications - View Profile button */}
          {item.type === 'B' && item.senderUid && (
            <TouchableOpacity
              style={[styles.button, styles.viewButton]}
              onPress={() => {
                console.log('uid',item.senderUid)
                const item1={id:item.senderUid};
                navigation.navigate('Reviews', { user: item1 })}}
            >
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>
          )}
          
          {/* Accept and Reject buttons */}
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAcceptJob(item.jobId || item.job_id, item.id, item.type, item.senderUid)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleRejectJob(item.jobId || item.job_id, item.id, item.type, item.senderUid)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render response card
  const renderResponseCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.message}>{item.message}</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteResponse(item.id)}
        >
          <Icon name="times" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View >
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Notifications</Text>
        <TouchableOpacity 
          style={styles.acceptedJobsButton}
          onPress={() => navigation.navigate('AcceptedJobsScreen')}
        >
          <Text style={styles.acceptedJobsButtonText}>Accepted Jobs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
  style={styles.postedJobsButton}
  onPress={() => navigation.navigate('PostedJobs')}
>
  <Text style={styles.postedJobsButtonText}>Posted Jobs</Text>
</TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationCard}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications found.</Text>}
      />

      <Text style={styles.heading}>Responses</Text>
      <FlatList
        data={responses}
        keyExtractor={(item) => item.id}
        renderItem={renderResponseCard}
        ListEmptyComponent={<Text style={styles.emptyText}>No responses found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  postedJobsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postedJobsButton: {
    backgroundColor: '#4335A7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  acceptedJobsButton: {
    backgroundColor: '#4335A7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  acceptedJobsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    width: '99%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  jobType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
    marginVertical: 5,
  },
  viewButton: {
    backgroundColor: '#1294FF',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default NotificationsScreen;