import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Feather';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const checkNotification = async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) return false;

    const reference = firebase
        .app()
        .database('https://localhire-cb5a2-default-rtdb.asia-southeast1.firebasedatabase.app/')
        .ref(`users/${uid}/notifications/`);

    const snapshot = await reference.once('value');
    if (!snapshot.exists()) return false;

    let hasActiveNotification = false;
    snapshot.forEach((childSnap) => {
        const notificationData = childSnap.val();
        if (notificationData.btnActive === true) {
            hasActiveNotification = true;
            return true;
        }
        return undefined;
    });
    return hasActiveNotification;
};

export default function NavBar() {
    const navigation = useNavigation();
    const [hasNotification, setHasNotification] = useState(false);
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        const fetchNotifications = async () => {
            const result = await checkNotification();
            setHasNotification(result);
            if (result) {
                startPulseAnimation();
            }
        };
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 500,
                    easing: Easing.ease,
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.ease,
                    useNativeDriver: true
                })
            ])
        ).start();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Logo with gradient text effect */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoTextPrimary}>Local</Text>
                    <Text style={styles.logoTextAccent}>Hire</Text>
                </View>

                {/* Navigation Icons */}
                <View style={styles.navIcons}>
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('home1')}
                    >
                        <Icon2 name="home" size={22} color="#6C63FF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Notification')}
                    >
                        <View style={styles.notificationContainer}>
                            <Icon 
                                name="bell" 
                                size={22} 
                                color="#6C63FF" 
                            />
                            {hasNotification && (
                                <Animated.View 
                                    style={[
                                        styles.notificationBadge,
                                        { transform: [{ scale: pulseAnim }] }
                                    ]}
                                />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('user1')}
                    >
                        <Icon name="user" size={22} color="#6C63FF" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 0,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoTextPrimary: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333333',
    },
    logoTextAccent: {
        fontSize: 24,
        fontWeight: '900',
        color: '#6C63FF',
        marginLeft: 2,
    },
    navIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 25,
    },
    iconButton: {
        padding: 8,
    },
    notificationContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF4757',
    },
});