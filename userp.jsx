import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserProfile = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.account}>Accounts & Settings</Text>
      </View>

      <View style={styles.profile}>
        <View style={styles.roundWhiteView}>
          <Image
            source={require('./assets/image.png')}
            style={styles.image}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>johndoe@example.com</Text>
        </View>
      </View>

      <View style={styles.accept}>
        <View style={styles.column}>
          <Text style={styles.statusText}>Applied</Text>
          <Text style={styles.numberText}>0</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.statusText}>Reviewed</Text>
          <Text style={styles.numberText}>0</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.statusText}>Accepted</Text>
          <Text style={styles.numberText}>0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20, // Add horizontal padding to the container for some breathing room
  },
  account: {
    fontWeight: '800',
    fontSize: 25,
    marginTop: 30, // Adjusted for spacing
    marginBottom: 20, // Spacing below the header
    textAlign: 'center', // Center the text
  },
  profile: {
    height: 120, // Increased height for better spacing
    backgroundColor: '#0057FF',
    borderRadius: 25,
    flexDirection: 'row',
    marginBottom: 30, // Add space below the profile section
    paddingHorizontal: 15, // Ensure text and image don't touch the edges
    alignItems: 'center', // Vertically align the items
  },
  roundWhiteView: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginLeft: 20,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 14,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  image: {
    width: 50,
    top:5,
    left:3,
    height: 120,
    borderRadius: 25, // Make the image circular
  },
  accept: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Evenly distribute the columns
    marginTop: 30,
    width: '100%',
  },
  column: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  numberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0057FF', // Blue color for the number
  },
});

export default UserProfile;
