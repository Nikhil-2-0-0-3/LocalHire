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
import uuid from 'react-native-uuid';

interface FormValues {
  job_id: string;
  job_type: string;
  address: string;
  location: string;
  date: Date | null;
  time: string;
  budget: number;
  no_of_users: number | string; // Allow string for empty input
  senderUid: string;
  status: string;
  created_at: number;
  users_hired:number;
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

const SaveToDb = async (values: FormValues) => {
  try {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) {
      console.error("User ID not found");
      return;
    }

    // Ensure no_of_users is a number
    const noOfUsers = typeof values.no_of_users === 'string' ? 1 : values.no_of_users;

    const jobId = await generateJobId();
    const formattedDate = values.date ? formatDate(values.date) : null;

    const userData = {
      job_id: jobId,
      job_type: values.job_type,
      address: values.address,
      location: values.location,
      date: formattedDate,
      time: values.time,
      budget: values.budget,
      no_of_users: noOfUsers,
      senderUid: uid,
      status: 'open',
      created_at: Date.now(),
      type: 'B',
      users_hired:0,
    };

    const db = firebase.app().database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/');
    await db.ref(`Jobs/${jobId}`).set(userData);
    await db.ref(`users/${uid}/JobsPosted/${jobId}`).set(true);

    Alert.alert('Success', 'Job posted successfully!');
  } catch (error) {
    console.error("Error saving job:", error);
    Alert.alert('Error', 'Failed to post job');
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
                address: '',
                location: '',
                date: null,
                time: '',
                budget: 0,
                no_of_users: 1,
                senderUid: '',
                status: 'open',
                created_at: Date.now(),
              }}
              validate={(values) => {
                const errors: Partial<Record<keyof FormValues, string>> = {};

                if (!values.job_type) errors.job_type = 'Job type is required';
                if (!values.address) errors.address = 'Address is required';
                if (!values.location) errors.location = 'Location is required';
                if (!values.date) errors.date = 'Date is required';
                if (!values.time) errors.time = 'Time is required';
                if (!values.budget || values.budget <= 0) errors.budget = 'Valid budget is required';

                return errors;
              }}
              onSubmit={async (values, { resetForm }) => {
                // Convert no_of_users to number if it's a string
                const submissionValues = {
                  ...values,
                  no_of_users: typeof values.no_of_users === 'string' ? 1 : values.no_of_users
                };
                await SaveToDb(submissionValues);
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

                  {/* Address Input */}
                  <View style={styles.unit}>
                    <Text>Address:</Text>
                    <TextInput
                      style={[styles.input, { height: 80 }]}
                      placeholder="Full address of the job location"
                      placeholderTextColor="#888"
                      multiline
                      onChangeText={handleChange('address')}
                      onBlur={handleBlur('address')}
                      value={values.address}
                    />
                    {errors.address && touched.address && <Text style={styles.error}>{errors.address}</Text>}
                  </View>

                  {/* Location (Area) Input */}
                  <View style={styles.unit}>
                    <Text>Area/Location:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Eg. Downtown, Suburb name"
                      placeholderTextColor="#888"
                      onChangeText={handleChange('location')}
                      onBlur={handleBlur('location')}
                      value={values.location}
                    />
                    {errors.location && touched.location && <Text style={styles.error}>{errors.location}</Text>}
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
                      placeholder="Amount in dollars"
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

                  {/* Number of Users Input - Fixed Version */}
                  <View style={styles.unit}>
                    <Text>Number of Workers Needed:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter number"
                      placeholderTextColor="#888"
                      value={typeof values.no_of_users === 'string' ? values.no_of_users : values.no_of_users.toString()}
                      onChangeText={(text) => {
                        if (text === '') {
                          setFieldValue('no_of_users', '');
                        } else {
                          const num = parseInt(text);
                          if (!isNaN(num)) {
                            setFieldValue('no_of_users', num);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (values.no_of_users === '') {
                          setFieldValue('no_of_users', 1);
                        }
                      }}
                      keyboardType="numeric"
                    />
                  </View>

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
    marginBottom: 15,
  },
  head: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    color: 'black',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  btn: {
    backgroundColor: '#4335A7',
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 20,
    padding: 10,
  },
});