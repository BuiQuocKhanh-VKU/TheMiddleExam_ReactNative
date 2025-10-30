import { auth } from "@/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
   ActivityIndicator,
   Alert,
   Keyboard,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   TouchableWithoutFeedback,
   View,
} from "react-native";

const ADMIN_EMAILS = new Set(["admin1@gmail.com", "admin2@gmail.com"]);
const ADMIN_PASSWORD = "123456";
const isAdmin = (email: string, password: string) =>
   ADMIN_EMAILS.has(email.trim().toLowerCase()) && password === ADMIN_PASSWORD;

export default function LoginScreen({ navigation }: any) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);

   const handleLogin = async () => {
      const emailNorm = email.trim().toLowerCase();
      if (!emailNorm || !password) {
         Alert.alert("Thiếu thông tin", "Nhập email và mật khẩu");
         return;
      }
      try {
         setLoading(true);

         await signInWithEmailAndPassword(auth, emailNorm, password);

         if (isAdmin(emailNorm, password)) {
            navigation.replace("Admin");
         } else {
            navigation.replace("Client");
         }
      } catch (e: any) {
         Alert.alert("Lỗi", e?.message ?? "Đăng nhập thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
         <View style={styles.container}>      
               <Text style={styles.title}>Đăng nhập</Text>            
            <TextInput
               style={styles.input}
               placeholder="Email"
               autoCapitalize="none"
               keyboardType="email-address"
               value={email}
               onChangeText={setEmail}
            />
            <TextInput
               style={styles.input}
               placeholder="Mật khẩu"
               secureTextEntry
               value={password}
               onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
               {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
               <Text style={{ textAlign: "center", marginTop: 16 }}>Chưa có tài khoản? Đăng ký</Text>
            </TouchableOpacity>
         </View>
      </TouchableWithoutFeedback>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#fff" },
   title: { fontSize: 30, fontWeight: "700", textAlign: "center", marginBottom: 60 },
   input: { borderWidth: 1, borderColor: "#b0b9baff", borderRadius: 10, padding: 12, marginVertical: 6 },
   button: { backgroundColor: "#0a7ea4", marginHorizontal: 80 , marginTop: 20, padding: 14, borderRadius: 10, alignItems: "center" },
   buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
