import {
  StyleSheet, Text, View, KeyboardAvoidingView, ScrollView, Alert, TextInput,
  TouchableOpacity, Platform
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import uuid from 'react-native-uuid';

interface FormValues {
  job_id: string;
  job_type: string;
  location: string;
  address: string; // New address field
  date: Date | null;
  salary_range: number;
}

const generateJobId = async () => {
  const uid = await AsyncStorage.getItem('userId');
  const timestamp = Date.now();
  const randomString = uuid.v4().split('-')[0];
  return `${uid}_${timestamp}_${randomString}`;
};

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const SaveToDb = async (values) => {
  try {
    const receiverUid = await AsyncStorage.getItem('receiver_id');
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) {
      console.error("User ID not found");
      return;
    }

    const jobId = await generateJobId();
    const formattedDate = values.date ? formatDate(values.date) : null;

    const userData = {
      job_id: jobId,
      job_type: values.job_type,
      location: values.location,
      address: values.address,
      date: formattedDate,
      salary_range: values.salary_range,
      completed: false,
      senderUid: uid,
      no_of_users: values.no_of_users || 1,
      created_at: Date.now()
    };

    const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

    // Save job details in Jobs node
    await db.ref(`Jobs/${jobId}`).set(userData);

    // Update JobsPosted - handle both array and object formats
    const jobsPostedRef = db.ref(`users/${uid}/JobsPosted`);
    const snapshot = await jobsPostedRef.once('value');
    
    let updatedJobs;
    if (snapshot.exists()) {
      const currentJobs = snapshot.val();
      
      // Check if currentJobs is an array
      if (Array.isArray(currentJobs)) {
        updatedJobs = [...currentJobs, jobId];
      } 
      // Check if currentJobs is an object (key-value pairs)
      else if (typeof currentJobs === 'object' && currentJobs !== null) {
        // Convert object to array of keys and add new jobId
        updatedJobs = [...Object.keys(currentJobs), jobId];
      }
      // If neither array nor object, create new array
      else {
        updatedJobs = [jobId];
      }
    } else {
      updatedJobs = [jobId];
    }

    await jobsPostedRef.set(updatedJobs);

    // Send notification to receiver
    await db.ref(`users/${receiverUid}/notifications/${jobId}`).set({
      ...userData,
      accepted: true,
      btnActive: true,
      type: 'A',
    });

    // Send push notification if receiver has FCM token
    const receiverRef = db.ref(`users/${receiverUid}/fcmToken`);
    const receiverSnapshot = await receiverRef.once('value');
    const receiverFcmToken = receiverSnapshot.val();

    if (receiverFcmToken) {
      await sendNotification(receiverFcmToken, userData);
      Alert.alert('Job Posted', 'Job details have been saved and notification sent');
    } else {
      console.error("Receiver FCM token not found");
    }
  } catch (error) {
    console.error("Error saving job:", error);
    Alert.alert('Error', 'Failed to save job details');
  }
};

const sendNotification = async (receiverFcmToken: string, jobDetails) => {
  const message = {
    token: receiverFcmToken,
    notification: {
      title: 'New Job Assigned!',
      body: `You have been assigned a new job: ${jobDetails.job_type}`,
    },
    data: {
      jobId: jobDetails.job_id,
      jobType: jobDetails.job_type,
      location: jobDetails.location,
      address: jobDetails.address, // Include address in notification
    },
  };

  try {
    await messaging().sendMessage(message);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export default function JobDetails() {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            <Formik<FormValues>
              initialValues={{
                location: '',
                address: '', // Initialize address field
                job_type: '',
                date: null,
                salary_range: 0,
                job_id: ''
              }}
              validate={(values) => {
                const errors: Partial<Record<keyof FormValues, string>> = {};

                if (!values.job_type) errors.job_type = 'Job type is required';
                if (!values.date) errors.date = 'Date is required';
                if (!values.location) errors.location = 'Location is required';
                if (!values.address) errors.address = 'Address is required'; // Address validation
                if (!values.salary_range || values.salary_range <= 0) errors.salary_range = 'Valid salary is required';

                return errors;
              }}
              onSubmit={async (values, { resetForm }) => {
                await SaveToDb(values);
                resetForm();
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
              }) => (
                <View>
                  <Text style={styles.head}>Job Details</Text>

                  {/* Location Input */}
                  <View style={styles.unit}>
                    <Text>Location (Area/City):</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Eg: Downtown, Manhattan"
                      placeholderTextColor="#888"
                      onChangeText={handleChange('location')}
                      onBlur={handleBlur('location')}
                      value={values.location}
                    />
                    {errors.location && touched.location && <Text style={styles.error}>{errors.location}</Text>}
                  </View>

                  {/* Address Input */}
                  <View style={styles.unit}>
                    <Text>Full Address:</Text>
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                      placeholder="Full address with street, building, etc."
                      placeholderTextColor="#888"
                      onChangeText={handleChange('address')}
                      onBlur={handleBlur('address')}
                      value={values.address}
                      multiline={true}
                      numberOfLines={4}
                    />
                    {errors.address && touched.address && <Text style={styles.error}>{errors.address}</Text>}
                  </View>

                  {/* Job Type Input */}
                  <View style={styles.unit}>
                    <Text>Job type:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Eg. Carpenter, Electrician..."
                      placeholderTextColor="#888"
                      onChangeText={handleChange('job_type')}
                      onBlur={handleBlur('job_type')}
                      value={values.job_type}
                    />
                    {errors.job_type && touched.job_type && <Text style={styles.error}>{errors.job_type}</Text>}
                  </View>

                  {/* Salary Input */}
                  <View style={styles.unit}>
                    <Text>Salary offered:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount in USD"
                      placeholderTextColor="#888"
                      onChangeText={(text) => {
                        const salary = parseFloat(text);
                        setFieldValue('salary_range', isNaN(salary) ? 0 : salary);
                      }}
                      onBlur={handleBlur('salary_range')}
                      value={values.salary_range.toString()}
                      keyboardType="numeric"
                    />
                    {errors.salary_range && touched.salary_range && <Text style={styles.error}>{errors.salary_range}</Text>}
                  </View>

                  {/* Date Picker */}
                  <View style={styles.unit}>
                    <Text>Date:</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={{ color: values.date ? 'black' : '#888' }}>
                        {values.date ? formatDate(values.date) : 'Select a date'}
                      </Text>
                    </TouchableOpacity>
                    {errors.date && touched.date && <Text style={styles.error}>{errors.date}</Text>}
                  </View>

                  {/* Date Picker Modal */}
                  {showDatePicker && (
                    <DateTimePicker
                      value={values.date || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setFieldValue('date', selectedDate);
                      }}
                    />
                  )}

                  {/* Submit Button */}
                  <TouchableOpacity onPress={handleSubmit as any} style={styles.btn}>
                    <Text style={{ color: 'white' }}>Submit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
  },
  unit: {
    marginBottom: 15, // Increased margin for better spacing
  },
  head: {
    color: 'black',
    fontSize: 22, // Slightly larger
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    color: 'black',
    borderWidth: 1,
    borderColor: '#ddd', // Lighter border
    borderRadius: 8,
    padding: 12, // More padding
    marginTop: 8,
    backgroundColor: '#f9f9f9', // Light background
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  btn: {
    backgroundColor: '#1294FF',
    width: '100%', // Full width
    height: 50, // Taller button
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 25,
    paddingVertical: 12,
  },
});