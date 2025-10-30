import { auth, db } from "@/firebase-config";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { doc, onSnapshot, setDoc, deleteDoc, getDoc } from "firebase/firestore";

type UserDoc = {
  username: string;
  email: string;
  password: string;     // theo đề
  image?: string | null; // base64
};

export default function ClientScreen() {
  const uid = auth.currentUser?.uid ?? ""; // yêu cầu đã đăng nhập
  const docRef = useMemo(() => doc(db, "users", uid), [uid]);

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [loading, setLoading]   = useState(false);

  // Quyền media + subscribe 1 document của chính mình
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") Alert.alert("Cần quyền", "Cấp quyền để chọn ảnh.");
    })();

    if (!uid) return;

    const unsub = onSnapshot(docRef, (d) => {
      if (d.exists()) {
        const data = d.data() as UserDoc;
        setUsername(data.username ?? "");
        setEmail(data.email ?? "");
        setPassword(data.password ?? "");
        setImageBase64(data.image ?? undefined);
      } else {
        // nếu chưa có hồ sơ trong Firestore thì điền sẵn email từ auth
        setEmail(auth.currentUser?.email ?? "");
      }
    });

    return () => unsub();
  }, [uid]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.5,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setImageBase64(res.assets[0].base64);
    }
  };

  // tạo mới hoặc cập nhật (merge)
  const saveProfile = async () => {
    if (!uid) {
      Alert.alert("Chưa đăng nhập", "Không tìm thấy người dùng hiện tại.");
      return;
    }
    if (!username || !email || !password) {
      Alert.alert("Thiếu thông tin", "Điền đủ username, email, password.");
      return;
    }
    try {
      setLoading(true);
      await setDoc(docRef, {
        username,
        email,
        password,
        image: imageBase64 ?? null,
      } as UserDoc, { merge: true });

      Alert.alert("Đã lưu", "Hồ sơ của bạn đã được cập nhật.");
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message ?? "Không lưu được.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async () => {
    if (!uid) return;
    Alert.alert("Xóa hồ sơ?", "Chỉ xóa document trong Firestore (không xóa tài khoản Auth).", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            const existed = await getDoc(docRef);
            if (existed.exists()) await deleteDoc(docRef);
            Alert.alert("Đã xóa", "Hồ sơ Firestore của bạn đã xóa.");
            setUsername(""); setEmail(auth.currentUser?.email ?? ""); setPassword(""); setImageBase64(undefined);
          } catch (e: any) {
            Alert.alert("Lỗi", e?.message ?? "Không xóa được.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hồ sơ của tôi</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageBase64 ? (
          <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} style={styles.preview} />
        ) : (
          <Text style={{ color: "#666" }}>Chọn ảnh đại diện</Text>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mật khẩu (lưu Firestore)" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Lưu</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#d9534f" }]} onPress={deleteProfile} disabled={loading}>
        <Text style={styles.buttonText}>Xóa hồ sơ Firestore</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginVertical: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, backgroundColor: "#fafafa" },
  button: { backgroundColor: "#0a7ea4", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  imagePicker: {
    alignSelf: "center", width: 120, height: 120, borderRadius: 60,
    borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center",
    overflow: "hidden", backgroundColor: "#fafafa", marginBottom: 8,
  },
  preview: { width: "100%", height: "100%" },
});
