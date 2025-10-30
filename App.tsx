import { auth, db } from "@/firebase-config";
import * as ImagePicker from "expo-image-picker";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, onSnapshot, query, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type UserItem = {
  id: string;            // chỉ dùng trong app (doc.id), KHÔNG lưu vào Firestore
  username: string;
  email: string;
  password: string;      // theo đề bài: lưu & hiển thị password
  image?: string;        // base64
};

export default function HomeScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [loading, setLoading]   = useState(false);

  const [users, setUsers] = useState<UserItem[]>([]);

  // xin quyền thư viện ảnh & subscribe danh sách users
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") Alert.alert("Cần quyền", "Cấp quyền truy cập ảnh để chọn hình.");
    })();

    // Không orderBy vì đề yêu cầu đúng 4 field, ta chỉ đọc toàn bộ
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      const arr: UserItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as Omit<UserItem, "id">;
        // d.id là doc id (ví dụ lấy theo uid), không phải field trong DB
        arr.push({ id: d.id, ...data });
      });
      setUsers(arr);
    });
    return () => unsub();
  }, []);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // API mới
      quality: 0.5,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setImageBase64(res.assets[0].base64);
    }
  };

  const onRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Thiếu thông tin", "Nhập đủ username, email, password.");
      return;
    }
    try {
      setLoading(true);

      // Có thể bỏ Auth nếu bạn muốn chỉ dùng Firestore.
      // Ở đây vẫn dùng Auth để sinh uid, nhưng KHÔNG lưu thêm field nào ngoài 4 field yêu cầu.
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: username });

      // Lưu đúng 4 field vào Firestore. Doc id = uid (không phải field).
      await setDoc(doc(db, "users", cred.user.uid), {
        username,
        email: cred.user.email,
        password,                // đề bài yêu cầu hiển thị password (cảnh báo: không an toàn)
        image: imageBase64 ?? null,
      });

      Alert.alert("OK", "Đăng ký & lưu Firestore thành công!");
      setUsername(""); setEmail(""); setPassword(""); setImageBase64(undefined);
    } catch (e: any) {
      console.log(e);
      Alert.alert("Lỗi", e?.message ?? "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: UserItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={
            item.image
              ? { uri: `data:image/jpeg;base64,${item.image}` }
              : require("./assets/images/icon.png")
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={{ color: "#444" }}>Password: {item.password}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageBase64 ? (
          <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} style={styles.preview} />
        ) : (
          <Text style={{ color: "#666" }}>Chọn ảnh đại diện</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
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

      <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Tạo tài khoản</Text>}
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 24 }]}>Danh sách người dùng</Text>
      <FlatList
        data={users}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginVertical: 8 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, backgroundColor: "#fff",
  },
  button: { backgroundColor: "#0a7ea4", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  imagePicker: {
    alignSelf: "center", width: 120, height: 120, borderRadius: 60,
    borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center",
    overflow: "hidden", backgroundColor: "#fafafa", marginBottom: 8,
  },
  preview: { width: "100%", height: "100%" },
  card: { padding: 12, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#eee" },
  name: { fontSize: 16, fontWeight: "700" },
  email: { color: "#666" },
});
