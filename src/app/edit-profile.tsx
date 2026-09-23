import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

export default function EditProfileScreen() {
  const [name, setName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.log("Error loading user:", userError.message);
        return;
      }

      if (!user) {
        console.log("No authenticated user found.");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, zip_code")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.log("Error loading profile:", error.message);
        return;
      }

      if (data) {
        setName(data.name ?? "");
        setZipCode(data.zip_code ?? "");

        if (data.email) {
          setEmail(data.email);
        }
      }
    } catch (error) {
      console.log("Profile loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedZip = zipCode.trim();

    if (!trimmedName) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    if (trimmedZip && !/^\d{5}$/.test(trimmedZip)) {
      Alert.alert("Invalid ZIP code", "Please enter a valid 5-digit ZIP code.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "We couldn't find your account.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: trimmedName,
          zip_code: trimmedZip || null,
        })
        .eq("id", user.id);

      if (error) {
        console.log("Error updating profile:", error.message);

        Alert.alert("Couldn't save profile", error.message);
        return;
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: trimmedName,
        },
      });

      if (metadataError) {
        console.log(
          "Profile saved, but metadata could not be updated:",
          metadataError.message,
        );
      }

      Alert.alert("Profile updated", "Your profile has been saved.", [
        {
          text: "DONE",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Profile save error:", error);

      Alert.alert(
        "Couldn't save profile",
        "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const firstLetter = name.trim().charAt(0).toUpperCase() || "U";

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#C9A45C" />

          <Text style={styles.loadingText}>OPENING THE DOOR...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* BACK */}

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ BACK</Text>
          </Pressable>

          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>THE DOOR</Text>

            <Text style={styles.title}>EDIT PROFILE</Text>

            <View style={styles.goldLine} />
          </View>

          {/* AVATAR */}

          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>

            <Text style={styles.avatarHint}>YOUR PROFILE</Text>
          </View>

          {/* FORM */}

          <View style={styles.form}>
            {/* NAME */}

            <View style={styles.field}>
              <Text style={styles.label}>YOUR NAME</Text>

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#77727C"
                autoCapitalize="words"
                returnKeyType="next"
                maxLength={50}
              />
            </View>

            {/* EMAIL */}

            <View style={styles.field}>
              <Text style={styles.label}>EMAIL</Text>

              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText} numberOfLines={1}>
                  {email || "No email available"}
                </Text>
              </View>

              <Text style={styles.helperText}>
                Email is managed through your account.
              </Text>
            </View>

            {/* ZIP */}

            <View style={styles.field}>
              <Text style={styles.label}>ZIP CODE</Text>

              <TextInput
                style={styles.input}
                value={zipCode}
                onChangeText={(text) =>
                  setZipCode(text.replace(/\D/g, "").slice(0, 5))
                }
                placeholder="10028"
                placeholderTextColor="#77727C"
                keyboardType="number-pad"
                maxLength={5}
                returnKeyType="done"
              />

              <Text style={styles.helperText}>
                Used to personalize venues near you.
              </Text>
            </View>
          </View>

          {/* SAVE */}

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              saving && styles.saveButtonDisabled,
              pressed && !saving && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#0B0A0F" />
            ) : (
              <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
            )}
          </Pressable>

          {/* CANCEL */}

          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </Pressable>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A0F",
  },

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 50,
  },

  /* BACK */

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 15,
    marginBottom: 18,
  },

  backText: {
    color: "#C9A45C",
    fontSize: 11,
    letterSpacing: 2.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* HEADER */

  header: {
    marginBottom: 30,
  },

  eyebrow: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 12,
  },

  title: {
    color: "#F5F1E8",
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_500Medium",
  },

  goldLine: {
    width: 48,
    height: 1,
    backgroundColor: "#C9A45C",
    marginTop: 13,
  },

  /* AVATAR */

  avatarSection: {
    alignItems: "center",
    marginBottom: 34,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#D9B65E",
    fontSize: 37,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  avatarHint: {
    color: "#77727C",
    fontSize: 9,
    letterSpacing: 2.5,
    marginTop: 9,
  },

  /* FORM */

  form: {
    gap: 25,
  },

  field: {
    width: "100%",
  },

  label: {
    color: "#C9A45C",
    fontSize: 10,
    letterSpacing: 2.5,
    marginBottom: 9,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  input: {
    height: 54,
    backgroundColor: "#17141C",
    borderWidth: 1,
    borderColor: "#29242F",
    borderRadius: 2,
    paddingHorizontal: 16,
    color: "#F5F1E8",
    fontSize: 17,
    fontFamily: "CormorantGaramond_500Medium",
  },

  disabledInput: {
    height: 54,
    backgroundColor: "#121117",
    borderWidth: 1,
    borderColor: "#29242F",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  disabledInputText: {
    color: "#77727C",
    fontSize: 17,
    fontFamily: "CormorantGaramond_500Medium",
  },

  helperText: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 0.7,
    marginTop: 7,
    fontFamily: "CormorantGaramond_500Medium",
  },

  /* SAVE */

  saveButton: {
    height: 56,
    backgroundColor: "#C9A45C",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34,
    borderRadius: 2,
  },

  saveButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: "#0B0A0F",
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* CANCEL */

  cancelButton: {
    alignItems: "center",
    paddingVertical: 18,
  },

  cancelText: {
    color: "#77727C",
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "CormorantGaramond_600SemiBold",
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B0A0F",
  },

  loadingText: {
    color: "#D9B65E",
    fontSize: 20,
    letterSpacing: 4,
    marginTop: 12,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
});
