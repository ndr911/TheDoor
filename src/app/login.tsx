import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.brand}>THE DOOR</Text>

          <View style={styles.line} />

          <Text style={styles.title}>Welcome back.</Text>

          <Text style={styles.subtitle}>Enter your details to continue.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>

          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor="#77727C"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>PASSWORD</Text>

          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#77727C"
            secureTextEntry
          />

          <Pressable>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>
        </View>

        <View>
          <Pressable style={styles.button} onPress={() => router.push("/home")}>
            <Text style={styles.buttonText}>ENTER</Text>
          </Pressable>

          <Text style={styles.accountText}>Don't have an account?</Text>

          <Pressable>
            <Text style={styles.signup}>CREATE AN ACCOUNT</Text>
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
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: "space-between",
  },

  brand: {
    color: "#C9A45C",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 4,
  },

  line: {
    width: 45,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 20,
    marginBottom: 25,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 36,
    fontWeight: "400",
  },

  subtitle: {
    color: "#96919B",
    fontSize: 16,
    marginTop: 12,
  },

  form: {
    gap: 10,
  },

  label: {
    color: "#C9A45C",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 12,
  },

  input: {
    height: 56,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#F5F1E8",
    fontSize: 16,
  },

  forgot: {
    color: "#C9A45C",
    textAlign: "right",
    marginTop: 5,
    fontSize: 13,
  },

  button: {
    backgroundColor: "#C9A45C",
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#0B0A0F",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
  },

  accountText: {
    color: "#96919B",
    textAlign: "center",
    marginTop: 22,
  },

  signup: {
    color: "#C9A45C",
    textAlign: "center",
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
