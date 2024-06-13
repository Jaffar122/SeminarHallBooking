import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const auth = getAuth();

    const handleResetPassword = async () => {
      if (!email) {
        Alert.alert(
          "Error",
          "Please enter your email before resetting the password."
        );
        return;
      }

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        "Password Reset Email Sent",
          "Check your email for instructions to reset your password.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TouchableOpacity onPress={handleResetPassword}>
          <View style={styles.btn}>
            <Text style={styles.btnText}>Reset Password</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8ecf4",
    justifyContent: "center",
    padding: 24,
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 44,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#075eec",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;
