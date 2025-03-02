import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
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

    let allActive = true; // Assume all notifications are active initially

    snapshot.forEach((childSnap) => {
        const notificationData = childSnap.val(); // Get the notification data
        if (notificationData.btnActive === false) {
            allActive = false; // Set to false if any notification has btnActive: false
        }
    });

    return allActive; // Return true only if all notifications have btnActive: true
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
            <Text style={styles.title}>LocalHire</Text>

            {/* Icons on the far right with a gap */}
            <View style={styles.iconsContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
                    <Icon
                        name={hasNotification ? 'bell' : 'bell-slash'}
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
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space between title and icons
        alignItems: 'center', // Vertically center items
        marginVertical: 20,
        marginHorizontal: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFA500', // Optional: Add color to the title
    },
    iconsContainer: {
        flexDirection: 'row',
        gap: 20, // Gap between the two icons
    },
});