import { StyleSheet, Text, View,TouchableOpacity } from 'react-native'
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from "@react-navigation/native";


export default function Profile_btn() {
  const navigation = useNavigation();
  return (
    <View>
      <TouchableOpacity>
        <Icon name="bell-slash" size={20} color="#1294FF" />
      </TouchableOpacity>

      <TouchableOpacity>
        <Icon name="user-circle-o" size={20} color="#1294FF" />
      </TouchableOpacity>

      
    </View>
    
  )
}

const styles = StyleSheet.create({})