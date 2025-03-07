import { StyleSheet, Text, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';


type RootStackParamList = {
  JobDetails2: undefined; // Define the route and its parameters (if any)
  // Add other routes here
  home1: undefined;
};
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'home1'>;

export default function Welcome() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const fadeAnimLocal = useRef(new Animated.Value(0)).current; // Initial value for opacity of "Local": 0
  const fadeAnimHire = useRef(new Animated.Value(0)).current; // Initial value for opacity of "Hire": 0

  useEffect(() => {
    // First animation: Fade in "Local"
    Animated.timing(fadeAnimLocal, {
      toValue: 1,
      duration: 1000, // 1 second
      useNativeDriver: true,
    }).start(() => {
      // After "Local" fades in, fade in "Hire"
      Animated.timing(fadeAnimHire, {
        toValue: 1,
        duration: 1000, // 1 second
        useNativeDriver: true,
      }).start(() => {
        // After both animations, navigate to home1 after a delay
        setTimeout(() => {
          const userId=AsyncStorage.getItem('userId')
          userId==null?navigation.replace('Details') : navigation.replace('home1');
        }, 1000); // 1 second delay before navigation
      });
    });
  }, [fadeAnimLocal, fadeAnimHire, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headingContainer}>
        <Animated.Text style={[styles.text1, { opacity: fadeAnimLocal }]}>Local</Animated.Text>
        <Animated.Text style={[styles.text2, { opacity: fadeAnimHire }]}>Hire</Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#1294FF'
  },
  headingContainer: {
    alignItems: 'center',
    flex:1,
    flexDirection:'row',
    justifyContent:'center',
    
  },
  text1: {
    fontSize: 40,
    fontWeight: 'bold',
    color:'#ffff'
  },
  text2: {
    fontSize: 50,
    fontWeight:'condensed',
    color:'#ffff'

    
  },
});