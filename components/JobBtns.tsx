import { StyleSheet, Text, View,TouchableOpacity } from 'react-native'
import React from 'react'

export default function JobBtns() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btns}>
        <Text style={styles.txt}>See More</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btns}>
        <Text>List Job</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({ 
    container:{
      flex:1,
      flexDirection:'row',
      justifyContent:'space-between',


    },
    btns:{

    },
    txt:{
      
    }
})