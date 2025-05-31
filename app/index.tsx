import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function OnboardScreen() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1);
  }, []);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: 100 - (rotation.value % 100),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100">
          <AnimatedCircle
            cx="50"
            cy="50"
            r="45"
            stroke="white"
            strokeWidth="4"
            strokeDasharray="100"
            animatedProps={animatedProps}
            fill="none"
          />
        </Svg>

        <View style={styles.circleCard}>
          <Image
            source={{
              uri: "https://static.vecteezy.com/system/resources/previews/020/526/643/non_2x/red-blood-icon-on-white-background-free-vector.jpg",
            }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>Medi Link</Text>
        </View>
      </View>

      <TouchableOpacity onPress={()=>router.push('/Auth')} style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <Text style={styles.tagline}>Connecting Lives, One Drop at a Time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  circleWrapper: {
    width: 220,
    height: 220,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  circleCard: {
    backgroundColor: "#fff",
    borderRadius: 110,
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  image: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "red",
    textAlign: "center",
    letterSpacing: 1.5,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "red",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "500",
    color: "white",
    fontSize: 18,
  },
});
