import React, { useState } from "react";
import { Alert } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const auth = getAuth();

  const handleSignInPress = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      navigation.navigate("Booked Time Slots");
    } catch (error) {
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-email" ||
        error.code === "auth/user-not-found"
      ) {
        Alert.alert("Authentication Failed", "Invalid email or password.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  const handleSignUpPress = () => {
    setEmail("");
    setPassword("");
    navigation.navigate("SignUp");
  };

  const handleForgotPasswordPress = () => {
    navigation.navigate("Reset Password");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center" }}
        behavior="padding"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Sign in to{" "}
              <Text style={styles.highlight}>Seminar Hall Booking</Text>
            </Text>
            <Text style={styles.subtitle}>Book earlier for easy access</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Email Address"
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={styles.input}
            />
            <TextInput
              autoCorrect={false}
              placeholder="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleSignInPress}
              style={styles.signInButton}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPasswordPress}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.signUpOption}>
              <Text style={styles.signUpOptionText}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={handleSignUpPress}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
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
    backgroundColor: "#e8ecf4",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#1d1d1d",
    textAlign: "center",
  },
  highlight: {
    color: "#075eec",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  signInButton: {
    backgroundColor: "#075eec",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  signInText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  forgotPasswordText: {
    textAlign: "center",
    marginTop: 8,
    color: "#075eec",
    fontWeight: "600",
  },
  signUpOption: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signUpOptionText: {
    marginRight: 6,
    color: "#222",
    fontWeight: "600",
  },
  signUpText: {
    color: "#075eec",
    fontWeight: "600",
  },
});
