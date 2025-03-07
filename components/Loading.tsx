import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

type LoadingProps = {
  size?: number; 
  colors?: string[]; 
  thickness?: number; 
  duration?: number; 
  text?: string; 
};

const Loading: React.FC<LoadingProps> = ({
  size = 50,
  colors = ["#ffff"],
  thickness = 4,
  duration = 800,
  text = "LOADING...",
}) => {
  return (
    <View style={styles.container}>
      {/* Semi-circle loading animation */}
      <Progress.CircleSnail
        size={size}
        color={colors}
        thickness={thickness}
        duration={duration}
      />
      {/* Optional text below the animation */}
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1294FF"
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: "#ffff",
  },
});

export default Loading;