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
    title: string;
    description: string;
    location: string;
    date: Date | null;
    time: string;
    budget: number;
    duration: string;
    skills_required: string;
    materials: string;
    contact_info: string;
    additional_notes: string;
    senderUid: string;
    status: string;
    created_at: number;
  }
  
  const generateJobId = async () => {
    const uid = await AsyncStorage.getItem('userId'); // Get the user's UID
    const timestamp = Date.now(); // Get current timestamp
    const randomString = uuid.v4().split('-')[0]; // Generate a short unique string
    return `${uid}_${timestamp}_${randomString}`; // Concatenated unique job ID
  };
  
  // Function to format date as "dd/mm/yyyy"
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Save to database
  const SaveToDb = async (values:FormValues) => {
    try {
      const receiverUid = await AsyncStorage.getItem('receiver_id');
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) {
        console.error("User ID not found");
        return;
      }
  
      const jobId = values.job_id;
  
      // Convert the Date object to a string
      const formattedDate = values.date ? formatDate(values.date) : null;
  
      const userData = {
        job_id: jobId,
        job_type: values.job_type,
        title: values.title,
        description: values.description,
        location: values.location,
        date: formattedDate,
        time: values.time,
        budget: values.budget,
        duration: values.duration,
        skills_required: values.skills_required,
        materials: values.materials,
        contact_info: values.contact_info,
        additional_notes: values.additional_notes,
        senderUid: uid,
        status: 'open',
        created_at: values.created_at,
      };
  
      const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
  
      // Save job details in Jobs node
      await db.ref(`Jobs/${jobId}`).set(userData);
  
      // Save job ID in sender's JobsPosted node
      await db.ref(`users/${uid}/JobsPosted/${jobId}`).set(true);
  
      // Save notification in receiver's notifications node
      await db.ref(`users/${receiverUid}/notifications/${jobId}`).set({
        ...userData,
        accepted: true,
        btnActive: true,
        type: 'B', // Set notification type to 'B'
      });
  
      // Fetch the receiver's FCM token
      const receiverRef = db.ref(`users/${receiverUid}/fcmToken`);
      const receiverSnapshot = await receiverRef.once('value');
      const receiverFcmToken = receiverSnapshot.val();
  
      if (receiverFcmToken) {
        // Send notification to the receiver
        await sendNotification(receiverFcmToken, userData);
        Alert.alert('Notification sent');
      } else {
        console.error("Receiver FCM token not found");
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };
  
  // Function to send a notification
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
  


export default function JobDetails2() {
    const [showDatePicker, setShowDatePicker] = useState(false);
  
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
            <Formik<FormValues>
  initialValues={{
    job_id: '',
    job_type: '',
    title: '',
    description: '',
    location: '',
    date: null,
    time: '',
    budget: 0,
    duration: '',
    skills_required: '',
    materials: '',
    contact_info: '',
    additional_notes: '',
    senderUid: '',
    status: 'open',
    created_at: Date.now(),
  }}
  validate={(values) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.job_type) errors.job_type = 'Job type is required';
    if (!values.title) errors.title = 'Title is required';
    if (!values.description) errors.description = 'Description is required';
    if (!values.location) errors.location = 'Location is required';
    if (!values.date) errors.date = 'Date is required';
    if (!values.time) errors.time = 'Time is required';
    if (!values.budget || values.budget <= 0) errors.budget = 'Valid budget is required';
    if (!values.duration) errors.duration = 'Duration is required';
    if (!values.skills_required) errors.skills_required = 'Skills required is required';
    if (!values.contact_info) errors.contact_info = 'Contact info is required';

    return errors;
  }}
onSubmit={async (values, { resetForm }) => {
    values.job_id = await generateJobId();
    values.senderUid = await AsyncStorage.getItem('userId');
    values.created_at = Date.now();
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

      {/* Job Title Input */}
      <View style={styles.unit}>
        <Text>Job Title:</Text>
        <TextInput
          style={styles.input}
          placeholder="Job Title"
          placeholderTextColor="#888"
          onChangeText={handleChange('title')}
          onBlur={handleBlur('title')}
          value={values.title}
        />
        {errors.title && touched.title && <Text style={styles.error}>{errors.title}</Text>}
      </View>

      {/* Job Type Input */}
      <View style={styles.unit}>
        <Text>Job Type:</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. Plumbing, Electrical..."
          placeholderTextColor="#888"
          onChangeText={handleChange('job_type')}
          onBlur={handleBlur('job_type')}
          value={values.job_type}
        />
        {errors.job_type && touched.job_type && <Text style={styles.error}>{errors.job_type}</Text>}
      </View>

      {/* Job Description Input */}
      <View style={styles.unit}>
        <Text>Job Description:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Describe the job..."
          placeholderTextColor="#888"
          multiline
          onChangeText={handleChange('description')}
          onBlur={handleBlur('description')}
          value={values.description}
        />
        {errors.description && touched.description && <Text style={styles.error}>{errors.description}</Text>}
      </View>

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

      {/* Date Input */}
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

      {/* Time Input */}
      <View style={styles.unit}>
        <Text>Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. 10:00 AM - 2:00 PM"
          placeholderTextColor="#888"
          onChangeText={handleChange('time')}
          onBlur={handleBlur('time')}
          value={values.time}
        />
        {errors.time && touched.time && <Text style={styles.error}>{errors.time}</Text>}
      </View>

      {/* Budget Input */}
      <View style={styles.unit}>
        <Text>Budget:</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. $50 - $100"
          placeholderTextColor="#888"
          onChangeText={(text) => {
            const budget = parseFloat(text);
            setFieldValue('budget', isNaN(budget) ? 0 : budget);
          }}
          onBlur={handleBlur('budget')}
          value={values.budget.toString()}
          keyboardType="numeric"
        />
        {errors.budget && touched.budget && <Text style={styles.error}>{errors.budget}</Text>}
      </View>

      {/* Duration Input */}
      <View style={styles.unit}>
        <Text>Duration:</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. 1-2 hours"
          placeholderTextColor="#888"
          onChangeText={handleChange('duration')}
          onBlur={handleBlur('duration')}
          value={values.duration}
        />
        {errors.duration && touched.duration && <Text style={styles.error}>{errors.duration}</Text>}
      </View>

      {/* Skills Required Input */}
      <View style={styles.unit}>
        <Text>Skills Required:</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. Licensed plumber"
          placeholderTextColor="#888"
          onChangeText={handleChange('skills_required')}
          onBlur={handleBlur('skills_required')}
          value={values.skills_required}
        />
        {errors.skills_required && touched.skills_required && <Text style={styles.error}>{errors.skills_required}</Text>}
      </View>

      {/* Materials Input */}
      <View style={styles.unit}>
        <Text>Materials:</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. Bring your own tools"
          placeholderTextColor="#888"
          onChangeText={handleChange('materials')}
          onBlur={handleBlur('materials')}
          value={values.materials}
        />
        {errors.materials && touched.materials && <Text style={styles.error}>{errors.materials}</Text>}
      </View>

      {/* Contact Info Input */}
      <View style={styles.unit}>
        <Text>Contact Info:</Text>
        <TextInput
          style={styles.input}
          placeholder="Eg. 555-1234 or john.doe@example.com"
          placeholderTextColor="#888"
          onChangeText={handleChange('contact_info')}
          onBlur={handleBlur('contact_info')}
          value={values.contact_info}
        />
        {errors.contact_info && touched.contact_info && <Text style={styles.error}>{errors.contact_info}</Text>}
      </View>

      {/* Additional Notes Input */}
      <View style={styles.unit}>
        <Text>Additional Notes:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Eg. Parking available in the garage"
          placeholderTextColor="#888"
          multiline
          onChangeText={handleChange('additional_notes')}
          onBlur={handleBlur('additional_notes')}
          value={values.additional_notes}
        />
        {errors.additional_notes && touched.additional_notes && <Text style={styles.error}>{errors.additional_notes}</Text>}
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