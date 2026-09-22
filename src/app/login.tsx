import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
  });

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password.",
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    router.replace("/home");
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* =========================
              HEADER
          ========================== */}

          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>

            <Text style={styles.brand}>THE DOOR</Text>

            <View style={styles.divider} />
          </View>

          {/* =========================
              WELCOME
          ========================== */}

          <View style={styles.welcome}>
            <Text style={styles.title}>
              Welcome{"\n"}
              <Text style={styles.titleGold}>back.</Text>
            </Text>

            <Text style={styles.subtitle}>Enter your details to continue.</Text>
          </View>

          {/* =========================
              DOOR ATMOSPHERE
          ========================== */}

          <View style={styles.doorArea}>
            <View style={styles.doorGlow} />

            <View style={styles.door}>
              <View style={styles.doorLight} />

              <View style={styles.openDoor}>
                <View style={styles.doorEdge} />
                <View style={styles.doorKnob} />
              </View>

              <View style={styles.frameLeft} />
              <View style={styles.frameRight} />
            </View>

            <View style={styles.floorGlow} />
          </View>

          {/* =========================
              FORM
          ========================== */}

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor="#77727C"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={[styles.label, styles.passwordLabel]}>PASSWORD</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#77727C"
                secureTextEntry={!showPassword}
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "HIDE" : "SHOW"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                // Password reset can be added here.
              }}
              hitSlop={10}
            >
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* =========================
              ENTER
          ========================== */}

          <View style={styles.actions}>
            <Pressable
              disabled={loading}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.buttonWrapper,
                pressed && !loading && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={["#A97832", "#D7AD5A", "#F0CC7A", "#C69A48", "#A97832"]}
                locations={[0, 0.32, 0.5, 0.72, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {loading ? "ENTERING..." : "ENTER"}
                </Text>

                {!loading && <Text style={styles.arrow}>→</Text>}
              </LinearGradient>
            </Pressable>

            {/* =========================
                DIVIDER
            ========================== */}

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* =========================
                SIGN UP
            ========================== */}

            <Pressable
              style={({ pressed }) => [
                styles.signupBox,
                pressed && styles.signupPressed,
              ]}
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.accountText}>Don't have an account?</Text>

              <Text style={styles.signupText}>CREATE AN ACCOUNT</Text>
            </Pressable>

            <Text style={styles.footer}>YOUR NIGHT STARTS HERE</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* =========================
     SCREEN
  ========================== */

  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 30,
  },

  /* =========================
     HEADER
  ========================== */

  header: {
    alignItems: "center",
  },

  backArrow: {
    position: "absolute",
    left: -4,
    top: -5,
    color: "#77727C",
    fontSize: 32,
    fontWeight: "200",
  },

  brand: {
    color: "#D6AA58",
    fontSize: 32,
    letterSpacing: 7,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  divider: {
    width: 58,
    height: 1.5,
    backgroundColor: "#C9A45C",
    marginTop: 9,
  },

  /* =========================
     WELCOME
  ========================== */

  welcome: {
    marginTop: 38,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 42,
    lineHeight: 43,
    fontFamily: "CormorantGaramond_500Medium",
  },

  titleGold: {
    color: "#D5A853",
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  subtitle: {
    color: "#96919B",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  /* =========================
     DOOR
  ========================== */

  doorArea: {
    height: 95,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },

  doorGlow: {
    position: "absolute",
    width: 110,
    height: 90,
    borderRadius: 60,
    backgroundColor: "#C8943F",
    opacity: 0.12,
    shadowColor: "#D9A84E",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 25,
  },

  door: {
    width: 68,
    height: 88,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#D4A64F",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: "#08070A",
  },

  doorLight: {
    position: "absolute",
    right: 8,
    bottom: 0,
    width: 27,
    height: 78,
    backgroundColor: "#FFD978",
    opacity: 0.8,
    shadowColor: "#FFD978",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 15,
  },

  openDoor: {
    position: "absolute",
    left: 13,
    bottom: 0,
    width: 38,
    height: 76,
    backgroundColor: "#09080C",
    borderWidth: 1,
    borderColor: "#C99A47",
    transform: [
      {
        perspective: 500,
      },
      {
        rotateY: "-15deg",
      },
    ],
  },

  doorEdge: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 1.5,
    height: "100%",
    backgroundColor: "#E2B85E",
  },

  doorKnob: {
    position: "absolute",
    right: 4,
    top: "50%",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E0B45A",
  },

  frameLeft: {
    position: "absolute",
    left: 7,
    bottom: 0,
    width: 1.5,
    height: 74,
    backgroundColor: "#D4A64F",
  },

  frameRight: {
    position: "absolute",
    right: 7,
    bottom: 0,
    width: 1.5,
    height: 74,
    backgroundColor: "#D4A64F",
  },

  floorGlow: {
    position: "absolute",
    bottom: -2,
    width: 55,
    height: 10,
    borderRadius: 50,
    backgroundColor: "#E5B95E",
    opacity: 0.25,
    shadowColor: "#E5B95E",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },

  /* =========================
     FORM
  ========================== */

  form: {
    marginTop: 18,
  },

  label: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2.5,
    marginBottom: 8,
  },

  passwordLabel: {
    marginTop: 19,
  },

  inputWrapper: {
    height: 54,
    backgroundColor: "#15131A",
    borderWidth: 1,
    borderColor: "#302B36",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#F5F1E8",
    fontSize: 15,
    paddingVertical: 0,
  },

  showPassword: {
    color: "#C9A45C",
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: "600",
  },

  forgot: {
    color: "#C9A45C",
    fontSize: 11,
    marginTop: 10,
    textAlign: "right",
  },

  /* =========================
     BUTTON
  ========================== */

  actions: {
    marginTop: 28,
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
    borderRadius: 10,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: "#0B0A0F",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
  },

  arrow: {
    position: "absolute",
    right: 18,
    color: "#0B0A0F",
    fontSize: 23,
    fontWeight: "300",
  },

  /* =========================
     OR
  ========================== */

  orContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#302B36",
  },

  orText: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2,
    marginHorizontal: 13,
  },

  /* =========================
     SIGN UP
  ========================== */

  signupBox: {
    width: "100%",
    minHeight: 68,
    borderWidth: 1,
    borderColor: "#403A45",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  signupPressed: {
    backgroundColor: "#121016",
  },

  accountText: {
    color: "#77727C",
    fontSize: 11,
  },

  signupText: {
    color: "#D5A853",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
    marginTop: 7,
  },

  /* =========================
     FOOTER
  ========================== */

  footer: {
    color: "#77727C",
    fontSize: 8,
    letterSpacing: 2.5,
    marginTop: 16,
  },
});
