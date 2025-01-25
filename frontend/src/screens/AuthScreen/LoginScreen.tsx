import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://172.20.10.4:5000/api/auth/login", {
        email,
        password,
      });

      const result = response.data;

      if (response.status === 200 && result.success) {
        await AsyncStorage.setItem("authToken", result.token);
        await AsyncStorage.setItem("userId", result.userId);

        Alert.alert("Success", "Login successful", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Main"),
          },
        ]);
      } else {
        Alert.alert("Error", result.message || "Invalid credentials.");
      }
    } catch (error: any) {
      console.error("Login Error:", error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/bg3.png")}
      style={styles.background}
      resizeMode="contain"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login and start transferring</Text>

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Enter Your Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye" : "eye-off"}
              size={24}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity>
          <Text
            style={styles.createAccount}
            onPress={() => navigation.navigate("Register")}
          >
            Create new account
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
    marginTop: -150,
    marginBottom: 50,
  },
  label: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 25,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 25,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#670035",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  createAccount: {
    color: "#670035",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
  },
});

export default LoginScreen;
