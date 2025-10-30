import { auth, db } from "@/firebase-config";
import * as ImagePicker from "expo-image-picker";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
   ActivityIndicator,
   Alert,
   Image,
   Keyboard,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   TouchableWithoutFeedback,
   View,
} from "react-native";

export default function RegisterScreen({ navigation }: any) {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [imageBase64, setImageBase64] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);

   const pickImage = async () => {
      const res = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [1, 1],
         quality: 0.5,
         base64: true,
      });
      if (!res.canceled && res.assets?.[0]?.base64) {
         setImageBase64(res.assets[0].base64);
      }
   };

   const handleRegister = async () => {
      if (!username || !email || !password) {
         Alert.alert("Thiếu thông tin", "Nhập đủ username, email, password");
         return;
      }
      try {
         setLoading(true);
         const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
         await updateProfile(cred.user, { displayName: username });

         await setDoc(doc(db, "users", cred.user.uid), {
            username,
            email,
            password,
            image: imageBase64 ?? null,
         });

         Alert.alert("Thành công", "Tạo tài khoản và lưu Firestore xong!");
         navigation.replace("Login");
      } catch (e: any) {
         Alert.alert("Lỗi", e?.message ?? "Đăng ký thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
         <View style={styles.container}>
            <Text style={styles.title}>Đăng ký</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
               {imageBase64 ? (
                  <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} style={styles.preview} />
               ) : (
                  <Text style={{ color: "#666" }}>Chọn ảnh đại diện</Text>
               )}
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
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

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
               {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Tạo tài khoản</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
               <Text style={{ textAlign: "center", marginTop: 16 }}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
         </View>
      </TouchableWithoutFeedback>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, padding: 16, justifyContent: "center", backgroundColor: "#fff" },
   title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 20 },
   input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginVertical: 6 },
   button: { backgroundColor: "#0a7ea4", padding: 14, borderRadius: 10, alignItems: "center" },
   buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
   imagePicker: {
      alignSelf: "center",
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 1,
      borderColor: "#ddd",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: "#fafafa",
      marginBottom: 8,
   },
   preview: { width: "100%", height: "100%" },
});
