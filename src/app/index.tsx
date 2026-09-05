import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
  });

  const glowOpacity = useRef(new Animated.Value(0.45)).current;
  const shinePosition = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // Soft pulsing glow behind the door
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.45,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Button shine animation
    Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(shinePosition, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2200),
        Animated.timing(shinePosition, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const shineTranslate = shinePosition.interpolate({
    inputRange: [-1, 1],
    outputRange: [-260, 260],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* =========================
            LOGO / DOOR
        ========================== */}
        <View style={styles.logoSection}>
          <View style={styles.doorArea}>
            {/* Large atmospheric golden glow */}
            <Animated.View
              style={[
                styles.doorGlow,
                {
                  opacity: glowOpacity,
                },
              ]}
            />

            {/* Soft rays of light escaping the doorway */}
            <View style={styles.lightBeam} />
            <View style={styles.lightBeamWide} />

            {/* Main arched doorway */}
            <View style={styles.arch}>
              {/* Bright interior light */}
              <View style={styles.lightOpening}>
                <View style={styles.innerLight} />
              </View>

              {/* Open door */}
              <View style={styles.openDoor}>
                <View style={styles.doorPanel}>
                  <View style={styles.doorEdge} />
                  <View style={styles.doorKnob} />
                </View>
              </View>

              {/* Architectural gold frame */}
              <View style={styles.frameLeft} />
              <View style={styles.frameRight} />

              {/* Golden light hitting the floor */}
              <View style={styles.floorGlow} />
            </View>
          </View>

          {/* App name */}
          <Text style={styles.brand}>THE DOOR</Text>

          {/* Divider */}
          <View style={styles.divider} />
        </View>

        {/* =========================
            CENTER COPY
        ========================== */}
        <View style={styles.center}>
          <Text style={styles.title}>Discover what&apos;s</Text>

          <Text style={styles.titleGold}>behind the door.</Text>

          <Text style={styles.description}>
            An invitation to the city&apos;s hidden
            {"\n"}
            cocktail rooms, intimate bars, and
            {"\n"}
            unforgettable nights.
          </Text>
        </View>

        {/* =========================
            BUTTON / FOOTER
        ========================== */}
        <View style={styles.bottom}>
          <Pressable
            style={styles.buttonWrapper}
            onPress={() => router.push("/login")}
          >
            <LinearGradient
              colors={["#A97832", "#D7AD5A", "#F0CC7A", "#C69A48", "#A97832"]}
              locations={[0, 0.32, 0.5, 0.72, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              {/* Button shine — unchanged */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.buttonShine,
                  {
                    transform: [
                      {
                        translateX: shineTranslate,
                      },
                    ],
                  },
                ]}
              />

              <Text style={styles.buttonText}>ENTER THE DOOR</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.footer}>YOUR NIGHT STARTS HERE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // =========================
  // SCREEN
  // =========================

  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 28,
    justifyContent: "space-between",
  },

  // =========================
  // LOGO
  // =========================

  logoSection: {
    alignItems: "center",
  },

  doorArea: {
    width: 180,
    height: 205,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },

  // =========================
  // ATMOSPHERIC GLOW
  // =========================

  doorGlow: {
    position: "absolute",

    width: 170,
    height: 185,

    borderRadius: 90,

    backgroundColor: "#C8943F",

    shadowColor: "#D9A84E",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 35,

    transform: [{ scaleX: 0.9 }, { scaleY: 1.05 }],
  },

  // =========================
  // ARCH
  // =========================

  arch: {
    width: 138,
    height: 178,

    position: "relative",

    overflow: "hidden",

    borderWidth: 2,
    borderColor: "#D4A64F",

    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,

    backgroundColor: "#08070A",
  },

  // =========================
  // INTERIOR LIGHT
  // =========================

  lightOpening: {
    position: "absolute",

    right: 18,
    bottom: 0,

    width: 55,
    height: 155,

    backgroundColor: "#FFD978",

    opacity: 0.9,

    shadowColor: "#FFD978",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 25,
  },

  innerLight: {
    position: "absolute",

    right: 4,
    top: 0,

    width: 24,
    height: "100%",

    backgroundColor: "#FFF1C2",

    opacity: 0.9,
  },

  // =========================
  // OPEN DOOR
  // =========================

  openDoor: {
    position: "absolute",

    left: 28,
    bottom: 0,

    width: 74,
    height: 153,

    transform: [
      {
        perspective: 700,
      },
      {
        rotateY: "-15deg",
      },
    ],
  },

  doorPanel: {
    flex: 1,

    backgroundColor: "#09080C",

    borderWidth: 1.5,
    borderColor: "#C99A47",

    position: "relative",

    shadowColor: "#000",
    shadowOffset: {
      width: 8,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },

  doorEdge: {
    position: "absolute",

    right: 0,
    top: 0,

    width: 2,
    height: "100%",

    backgroundColor: "#E2B85E",

    opacity: 0.7,
  },

  doorKnob: {
    position: "absolute",

    right: 7,
    top: "50%",

    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: "#E0B45A",

    shadowColor: "#FFD978",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },

  // =========================
  // GOLD DOOR FRAME
  // =========================

  frameLeft: {
    position: "absolute",

    left: 17,
    bottom: 0,

    width: 2,
    height: 150,

    backgroundColor: "#D4A64F",
  },

  frameRight: {
    position: "absolute",

    right: 17,
    bottom: 0,

    width: 2,
    height: 150,

    backgroundColor: "#D4A64F",
  },

  // =========================
  // FLOOR LIGHT
  // =========================

  floorGlow: {
    position: "absolute",

    bottom: -3,
    left: 25,

    width: 90,
    height: 28,

    backgroundColor: "#E5B95E",

    opacity: 0.35,

    borderRadius: 50,

    shadowColor: "#E5B95E",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },

  // =========================
  // LIGHT RAYS
  // =========================

  lightBeam: {
    position: "absolute",

    bottom: 4,
    right: 38,

    width: 5,
    height: 125,

    backgroundColor: "#FFD978",

    opacity: 0.18,

    transform: [
      {
        rotate: "-18deg",
      },
    ],
  },

  lightBeamWide: {
    position: "absolute",

    bottom: 0,
    right: 50,

    width: 45,
    height: 100,

    backgroundColor: "#E8B95D",

    opacity: 0.08,

    transform: [
      {
        rotate: "-18deg",
      },
    ],
  },

  // =========================
  // APP NAME
  // =========================

  brand: {
    color: "#D6AA58",

    fontSize: 38,

    letterSpacing: 8,

    marginTop: 12,

    fontFamily: "CormorantGaramond_600SemiBold",
  },

  divider: {
    width: 58,
    height: 1.5,

    backgroundColor: "#C9A45C",

    marginTop: 10,
  },

  // =========================
  // CENTER TEXT
  // =========================

  center: {
    alignItems: "center",

    paddingHorizontal: 4,

    marginTop: -10,
  },

  title: {
    color: "#F5F1E8",

    fontSize: 43,
    lineHeight: 46,

    textAlign: "center",

    fontFamily: "CormorantGaramond_500Medium",
  },

  titleGold: {
    color: "#D5A853",

    fontSize: 45,
    lineHeight: 47,

    textAlign: "center",

    fontFamily: "CormorantGaramond_600SemiBold",
  },

  description: {
    color: "#96919B",

    fontSize: 14,
    lineHeight: 22,

    textAlign: "center",

    marginTop: 22,
  },

  // =========================
  // BUTTON
  // =========================

  bottom: {
    alignItems: "center",
  },

  buttonWrapper: {
    width: "100%",
    height: 58,

    shadowColor: "#C9A45C",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.3,

    shadowRadius: 14,

    elevation: 6,
  },

  button: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#E5C06D",
  },

  buttonShine: {
    position: "absolute",

    width: 70,
    height: 100,

    backgroundColor: "rgba(255,255,255,0.25)",

    transform: [
      {
        skewX: "-20deg",
      },
    ],
  },

  buttonText: {
    color: "#0B0A0F",

    fontSize: 12,

    fontWeight: "600",

    letterSpacing: 3,
  },

  // =========================
  // FOOTER
  // =========================

  footer: {
    color: "#77727C",

    fontSize: 9,

    letterSpacing: 2.5,

    marginTop: 18,
  },
});
