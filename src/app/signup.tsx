import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Please make sure both passwords are the same.",
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password too short",
        "Your password must be at least 6 characters.",
      );
      return;
    }

    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Sign up failed", error.message);
      return;
    }

    // Confirm Email is currently OFF in Supabase,
    // so a successful signup should give us a session.
    if (!session) {
      Alert.alert(
        "Account created",
        "Your account was created, but no active session was returned. Please try logging in.",
      );
      return;
    }

    // User is authenticated — take them directly to Home.
    router.replace("/home");
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <Text style={styles.brand}>THE DOOR</Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* Intro */}
          <View style={styles.intro}>
            <Text style={styles.title}>Create your account.</Text>

            <Text style={styles.subtitle}>
              Step inside and discover what&apos;s
              {"\n"}
              behind the door.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>NAME</Text>

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#66616B"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>EMAIL</Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#66616B"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#66616B"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>

              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#66616B"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>
          </View>

          {/* Bottom */}
          <View style={styles.bottom}>
            <Pressable
              style={[
                styles.createButton,
                loading && styles.createButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </Text>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>ALREADY A MEMBER?</Text>

              <Pressable onPress={() => router.replace("/login")}>
                <Text style={styles.loginLink}>SIGN IN</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 28,
  },

  // =========================
  // HEADER
  // =========================

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  backText: {
    color: "#D6AA58",
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 40,
  },

  brand: {
    color: "#D6AA58",
    fontSize: 24,
    letterSpacing: 6,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  headerSpacer: {
    width: 40,
  },

  // =========================
  // INTRO
  // =========================

  intro: {
    marginTop: 38,
    alignItems: "center",
  },

  title: {
    color: "#F5F1E8",
    fontSize: 38,
    lineHeight: 42,
    textAlign: "center",
    fontFamily: "CormorantGaramond_500Medium",
  },

  subtitle: {
    color: "#96919B",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },

  // =========================
  // FORM
  // =========================

  form: {
    marginTop: 30,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    color: "#AFA7B0",
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    height: 52,

    backgroundColor: "#131117",

    borderWidth: 1,
    borderColor: "#29252D",

    color: "#F5F1E8",

    paddingHorizontal: 16,

    fontSize: 15,

    borderRadius: 2,
  },

  // =========================
  // BOTTOM
  // =========================

  bottom: {
    marginTop: "auto",
  },

  createButton: {
    height: 58,

    backgroundColor: "#D2A653",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E5C06D",

    shadowColor: "#C9A45C",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,

    elevation: 5,
  },

  createButtonDisabled: {
    opacity: 0.55,
  },

  createButtonText: {
    color: "#0B0A0F",

    fontSize: 12,

    fontWeight: "600",

    letterSpacing: 2.5,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 20,
  },

  loginPrompt: {
    color: "#77727C",

    fontSize: 9,

    letterSpacing: 1.8,

    marginRight: 7,
  },

  loginLink: {
    color: "#D6AA58",

    fontSize: 9,

    letterSpacing: 1.8,

    fontWeight: "600",
  },
});
