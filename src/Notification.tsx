import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;

      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
      const notificationsRef = db.ref(`users/${uid}/notifications`);

      notificationsRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
          const notificationsData = snapshot.val();
          const notificationsList = Object.keys(notificationsData).map((key) => ({
            id: key,
            ...notificationsData[key],
          }));
          setNotifications(notificationsList);
        } else {
          setNotifications([]);
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAcceptJob = async (jobId, notificationId) => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

      await db.ref(`Jobs/${jobId}`).update({ status: 'accepted' });

      const jobSnapshot = await db.ref(`Jobs/${jobId}`).once('value');
      const jobData = jobSnapshot.val();
      const senderUid = jobData.senderUid;

      await db.ref(`Users/${senderUid}/responses/${jobId}`).set({
        jobId,
        status: 'accepted',
      });

      await db.ref(`users/${uid}/notifications/${notificationId}`).update({ btnActive: false });

      Alert.alert('Job Accepted', 'You have accepted the job.');
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const handleRejectJob = async (jobId, notificationId) => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

      await db.ref(`Jobs/${jobId}`).update({ status: 'rejected' });

      const jobSnapshot = await db.ref(`Jobs/${jobId}`).once('value');
      const jobData = jobSnapshot.val();
      const senderUid = jobData.senderUid;

      await db.ref(`Users/${senderUid}/responses/${jobId}`).set({
        jobId,
        status: 'rejected',
      });

      await db.ref(`users/${uid}/notifications/${notificationId}`).update({ btnActive: false });

      Alert.alert('Job Rejected', 'You have rejected the job.');
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  const renderNotificationCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.jobType}>{item.job_type}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      {item.type === 'A' && item.btnActive && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAcceptJob(item.job_id, item.id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleRejectJob(item.job_id, item.id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationCard}
        ListEmptyComponent={<Text>No notifications found.</Text>}
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
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
  },
});

export default NotificationsScreen;