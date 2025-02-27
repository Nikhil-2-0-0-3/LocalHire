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
import { v4 as uuidv4 } from 'uuid'; // Import UUID package

import messaging from '@react-native-firebase/messaging';


interface FormValues {
  job_id:string;
  job_type: string;
  location: string;
  date: Date | null;
  salary_range: number; // Salary is a number
}



// Function to send a notification
// Function to send a notification


const generateJobId = async () => {
  const uid = await AsyncStorage.getItem('userId'); // Get the user's UID
  const timestamp = Date.now(); // Get current timestamp
  const randomString = uuidv4().split('-')[0]; // Generate a short unique string
  return `${uid}_${timestamp}_${randomString}`; // Concatenated unique job ID
};

// Function to format date as "dd/mm/yyyy"
const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};


//save to database
const SaveToDb = async (values) => {
  try {
    const receiverUid=await AsyncStorage.getItem('reciver_id')
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) {
      console.error("User ID not found");
      return;
    }

    const jobId = await generateJobId();
    const userData = {
      job_id: jobId,
      job_type: values.job_type,
      location: values.location,
      date: values.date,
      salary_range: values.salary_range,
      completed: false,
      senderUid: uid, // Include sender's UID
    };

    const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');

    // Save job details in Jobs node
    await db.ref(`Jobs/${jobId}`).set(userData);

    // Save job ID in sender's JobsPosted node
    await db.ref(`Users/${uid}/JobsPosted/${jobId}`).set(true);

    // Save notification in receiver's notifications node
    await db.ref(`Users/${receiverUid}/notifications/${jobId}`).set({
      ...userData,
      accepted: true, // Initially set to true
    });

    // Fetch the receiver's FCM token
    const receiverRef = db.ref(`Users/${receiverUid}/fcmToken`);
    const receiverSnapshot = await receiverRef.once('value');
    const receiverFcmToken = receiverSnapshot.val();

    if (receiverFcmToken) {
      // Send notification to the receiver
      await sendNotification(receiverFcmToken, userData);
    } else {
      console.error("Receiver FCM token not found");
    }
  } catch (error) {
    console.error("Error saving job:", error);
  }
};


// Function to send a notification
const sendNotification = async (receiverFcmToken:string, jobDetails) => {
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
    },
    fcmOptions: {
      // Add FCM options here (optional)
      analyticsLabel: 'job_assignment', // Example analytics label
    },
  };

  try {
    
    await messaging().sendMessage(message);
    console.log('Notification sent successfully:');
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
              initialValues={{ location: '', job_type: '', date: null, salary_range: 0 ,job_id:''}}
              validate={(values) => {
                const errors: Partial<Record<keyof FormValues, string>> = {};

                if (!values.job_type) errors.job_type = 'Job type is required';
                if (!values.date) errors.date = 'Date is required';
                if (!values.location) errors.location = 'Location is required';
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
                    <Text>Location:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Location"
                      placeholderTextColor="#888"
                      onChangeText={handleChange('location')}
                      onBlur={handleBlur('location')}
                      value={values.location}
                    />
                    {errors.location && touched.location && <Text style={styles.error}>{errors.location}</Text>}
                  </View>

                  {/* Job Type Input */}
                  <View style={styles.unit}>
                    <Text>Job type:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Eg. Carpenter..."
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
                      placeholder="Salary"
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
    justifyContent: 'center', // Center the content vertically
  },
  container: {
    padding: 20,
  },
  unit: {
    marginBottom: 10,
  },
  head: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    color: 'black',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  btn: {
    backgroundColor: '#1294FF',
    width: '80%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 20,
  },
});