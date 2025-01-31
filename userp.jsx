import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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

      <View style={{ padding: 15 }}>
  {/* Personal Profile */}
  <View style={styles.menuItem}>
    <Image source={require('./assets/Vector.png')} style={styles.icon} />
    <Text style={styles.menuText}>Personal Profile</Text>
    <TouchableOpacity>
      <Image source={require('./assets/chevron-right.png')} style={styles.chevron} />
    </TouchableOpacity>
  </View>

  {/* Change Password */}
  <View style={styles.menuItem}>
    <Image source={require('./assets/Frame.png')} style={styles.icon} />
    <Text style={styles.menuText}>Change Password</Text>
    <TouchableOpacity>
      <Image source={require('./assets/chevron-right.png')} style={styles.chevron} />
    </TouchableOpacity>
  </View>

  {/* Job Applied */}
  <View style={styles.menuItem}>
    <Image source={require('./assets/job.png')} style={styles.icon} />
    <Text style={styles.menuText}>Job Applied</Text>
    <TouchableOpacity>
      <Image source={require('./assets/chevron-right.png')} style={styles.chevron} />
    </TouchableOpacity>
  </View>

  {/* Favorite Job */}
  <View style={styles.menuItem}>
    <Image source={require('./assets/love.png')} style={styles.icon} />
    <Text style={styles.menuText}>Favorite Job</Text>
    <TouchableOpacity>
      <Image source={require('./assets/chevron-right.png')} style={styles.chevron} />
    </TouchableOpacity>
  </View>

  

  {/* Settings */}
  <View style={styles.menuItem}>
    <Image source={require('./assets/settings.png')} style={styles.icon} />
    <Text style={styles.menuText}>Settings</Text>
    <TouchableOpacity>
      <Image source={require('./assets/chevron-right.png')} style={styles.chevron} />
    </TouchableOpacity>
  </View>
</View>
<View style={styles.logout}>
<View style={styles.menuItem}>
    <Image source={require('./assets/logout.png')} style={styles.icon} />
    <Text style={styles.logoutt}>Logout</Text>
    <TouchableOpacity>
      <Image source={require('./assets/chevron-right.png')} style={styles.logouti} />
    </TouchableOpacity>
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
    paddingBottom:50,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  chevron: {
    width: 20,
    height: 20,
    
  },
  logout:{
    height: 50, // Increased height for better spacing
    backgroundColor: '#E5020B',
    borderRadius: 25,
    flexDirection: 'row',
    marginBottom: 30, // Add space below the profile section
    paddingHorizontal: 15, // Ensure text and image don't touch the edges
    alignItems: 'center',
    top:50, // Vertically align the items
  },
  logoutt:{
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  logouti:{
    width: 20,
    height: 20,
    tintColor:'#FFFFFF',
  }
});

export default UserProfile;