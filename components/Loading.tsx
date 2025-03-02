import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

type LoadingProps = {
  size?: number; // Optional size for the loading animation
  colors?: string[]; // Optional colors for the loading animation
  thickness?: number; // Optional thickness of the loading animation
  duration?: number; // Optional duration of the animation
  text?: string; // Optional text to display below the animation
};

const Loading: React.FC<LoadingProps> = ({
  size = 100,
  colors = ["#1294FF", "#FF8C42"],
  thickness = 5,
  duration = 800,
  text = "Loading...",
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
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: "#1294FF",
  },
});

export default Loading;