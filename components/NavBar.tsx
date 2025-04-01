import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Feather';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const checkNotification = async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) return false; // Handle case where userId is null

    const reference = firebase
        .app()
        .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/')
        .ref(`users/${uid}/notifications/`);

    const snapshot = await reference.once('value');

    if (!snapshot.exists()) return false; // No notifications found

    let hasActiveNotification = false; // Assume no active notifications initially

    snapshot.forEach((childSnap) => {
        const notificationData = childSnap.val(); // Get the notification data
        console.log(notificationData.btnActive);
        if (notificationData.btnActive === true) {
            console.log('Active notification found:', notificationData);
            hasActiveNotification = true; // Set to true if any notification has btnActive: true
            return true; // Exit the loop early
        }
        return undefined; // Explicitly return undefined
    });
    console.log(hasActiveNotification)

    return hasActiveNotification; // Return true if at least one notification has btnActive: true
};

export default function NavBar() {
    const navigation = useNavigation();
    const [hasNotification, setHasNotification] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const result = await checkNotification();
            setHasNotification(result);
        };
        fetchNotifications();
    }, []);

    return (
        <View style={styles.container}>
            {/* LocalHire Text on the far left */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Local</Text>
                <Text style={styles.title2}>Hire</Text>

            </View>
           {/* <Text style={styles.title}>LocalHire</Text> */}

            {/* Icons on the far right with a gap */}
            <View style={styles.iconsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('home1')}>
                    <Icon2 name="home" size={20} color="#1294FF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
                    <Icon
                        name={ hasNotification? 'bell' : 'bell-slash'}
                        size={20}
                        color="#1294FF"
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('user1')}>
                    <Icon name="user-o" size={20} color="#1294FF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer:{
        flex:1,
        flexDirection:'row',
        alignItems:'center'
    },
    
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space between title and icons
        alignItems: 'center', // Vertically center items
        marginVertical:10,
        padding:10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1294FF', // Optional: Add color to the title
    },
    title2: {
        fontSize: 25,
        fontWeight:'900',
        color: '#1294FF', // Optional: Add color to the title
    },
    iconsContainer: {
        flexDirection: 'row',
        gap: 20, // Gap between the two icons
    },
});