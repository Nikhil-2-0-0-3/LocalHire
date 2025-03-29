import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../components/Loading';

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

      // Fetch responses
      const responsesRef = db.ref(`users/${uid}/responses`);
      responsesRef.on('value', async (snapshot) => {
        if (snapshot.exists()) {
          const responsesData = snapshot.val();
          const responsesList = await Promise.all(
            Object.keys(responsesData).map(async (key) => {
              const response = responsesData[key];
              // Fetch sender's name
              const senderSnapshot = await db.ref(`users/${response.senderUid}/name`).once('value');
              const senderName = senderSnapshot.val();
              return {
                id: key,
                ...response,
                message: `${senderName} ${response.status} the job: ${response.job_type}`,
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

      // Update job status to "accepted"
      await db.ref(`Jobs/${jobId}`).update({ status: 'accepted' });

      // Get job data
      const jobSnapshot = await db.ref(`Jobs/${jobId}`).once('value');
      const jobData = jobSnapshot.val();
      
      // For type B, the senderUid is the applier's UID
      const targetUid = type === 'B' ? senderUid : jobData.senderUid;

      // Fetch sender's name
      const senderSnapshot = await db.ref(`users/${targetUid}/name`).once('value');
      const senderName = senderSnapshot.val();

      // Send response to the sender
      await db.ref(`users/${targetUid}/responses/${jobId}`).set({
        jobId,
        status: 'accepted',
        job_type: jobData.job_type,
        senderUid: uid, // Store the current user's UID as the sender
      });

      // Update notification message
      await db.ref(`users/${uid}/notifications/${notificationId}`).update({
        btnActive: false,
        message: type === 'B' ? 
          `You accepted ${senderName}'s application for ${jobData.job_type}` : 
          `You accepted the job: ${jobData.job_type}`,
      });

      // For type B, also update the applier's notification
      if (type === 'B') {
        await db.ref(`users/${senderUid}/notifications/${notificationId}`).update({
          btnActive: false,
          message: `Your application for ${jobData.job_type} was accepted`,
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

      // Fetch sender's name
      const senderSnapshot = await db.ref(`users/${targetUid}/name`).once('value');
      const senderName = senderSnapshot.val();

      // Send response to the sender
      await db.ref(`users/${targetUid}/responses/${jobId}`).set({
        jobId,
        status: 'rejected',
        job_type: jobData.job_type,
        senderUid: uid, // Store the current user's UID as the sender
      });

      // Update notification message
      await db.ref(`users/${uid}/notifications/${notificationId}`).update({
        btnActive: false,
        message: type === 'B' ? 
          `You rejected ${senderName}'s application for ${jobData.job_type}` : 
          `You rejected the job: ${jobData.job_type}`,
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

  // Render notification card
  const renderNotificationCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.jobType}>{item.job_type || 'Job Application'}</Text>
      <Text style={styles.message}>{item.message}</Text>
      
      {item.btnActive && (
        <View style={styles.buttonsContainer}>
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
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationCard}
        ListEmptyComponent={<Text>No notifications found.</Text>}
      />

      <Text style={styles.heading}>Responses</Text>
      <FlatList
        data={responses}
        keyExtractor={(item) => item.id}
        renderItem={renderResponseCard}
        ListEmptyComponent={<Text>No responses found.</Text>}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  jobType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#555',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
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
});

export default NotificationsScreen;