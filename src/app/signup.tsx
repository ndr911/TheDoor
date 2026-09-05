import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
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
    if (!name || !email || !password || !confirmPassword) {
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

    const { error } = await supabase.auth.signUp({
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

    Alert.alert("Welcome to The Door", "Your account has been created.", [
      {
        text: "CONTINUE",
        onPress: () => router.replace("/home"),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹ BACK</Text>
          </Pressable>

          <Text style={styles.brand}>THE DOOR</Text>

          <View style={styles.line} />

          <Text style={styles.title}>Join us.</Text>

          <Text style={styles.subtitle}>Create your account to enter.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>NAME</Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#77727C"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>EMAIL</Text>

          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor="#77727C"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>PASSWORD</Text>

          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#77727C"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>CONFIRM PASSWORD</Text>

          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#77727C"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <View>
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginText}>
              ALREADY HAVE AN ACCOUNT? SIGN IN
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 25,
    justifyContent: "space-between",
  },

  back: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 28,
  },

  brand: {
    color: "#C9A45C",
    fontSize: 12,
    letterSpacing: 3,
  },

  line: {
    width: 45,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 14,
    marginBottom: 25,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 34,
    fontWeight: "600",
  },

  subtitle: {
    color: "#96919B",
    fontSize: 15,
    marginTop: 10,
  },

  form: {
    marginTop: 20,
  },

  label: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    height: 48,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    paddingHorizontal: 16,
    color: "#F5F1E8",
    fontSize: 15,
  },

  button: {
    height: 54,
    backgroundColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#0B0A0F",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
  },

  loginText: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 18,
  },
});
