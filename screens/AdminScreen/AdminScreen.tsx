import { db } from "@/firebase-config";
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   FlatList,
   Image,
   Modal,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";

type UserItem = {
   id: string; // doc.id
   username: string;
   email: string;
   password: string; // (khuyến nghị: không lưu plaintext trong Firestore)
   image?: string | null; // base64
};

export default function AdminScreen() {
   const [users, setUsers] = useState<UserItem[]>([]);
   const [busyId, setBusyId] = useState<string | null>(null);

   // Search + sort
   const [search, setSearch] = useState("");
   const [sortAsc, setSortAsc] = useState(true);

   // Edit modal state
   const [editing, setEditing] = useState<UserItem | null>(null);
   const [uName, setUName] = useState("");
   const [uEmail, setUEmail] = useState("");
   const [uPass, setUPass] = useState("");

   useEffect(() => {
      const q = query(collection(db, "users"));
      const unsub = onSnapshot(q, (snap) => {
         const arr: UserItem[] = [];
         snap.forEach((d) => {
            const data = d.data() as Omit<UserItem, "id">;
            arr.push({ id: d.id, ...data });
         });
         setUsers(arr);
      });
      return () => unsub();
   }, []);

   const startEdit = (u: UserItem) => {
      setEditing(u);
      setUName(u.username ?? "");
      setUEmail(u.email ?? "");
      setUPass(u.password ?? "");
   };

   const saveEdit = async () => {
      if (!editing) return;
      if (!uName || !uEmail || !uPass) {
         Alert.alert("Thiếu thông tin", "Điền đủ username, email, password.");
         return;
      }
      try {
         setBusyId(editing.id);
         await updateDoc(doc(db, "users", editing.id), {
            username: uName,
            email: uEmail,
            password: uPass,
         });
         setEditing(null);
      } catch (e: any) {
         Alert.alert("Lỗi", e?.message ?? "Không lưu được.");
      } finally {
         setBusyId(null);
      }
   };

   const confirmDelete = (u: UserItem) => {
      Alert.alert("Xóa user?", `Chỉ xóa document Firestore của: ${u.username}`, [
         { text: "Hủy" },
         {
            text: "Xóa",
            style: "destructive",
            onPress: async () => {
               try {
                  setBusyId(u.id);
                  await deleteDoc(doc(db, "users", u.id));
               } catch (e: any) {
                  Alert.alert("Lỗi", e?.message ?? "Không xóa được.");
               } finally {
                  setBusyId(null);
               }
            },
         },
      ]);
   };

   const filteredUsers = useMemo(() => {
      const kw = search.trim().toLowerCase();
      const filtered = kw ? users.filter((u) => (u.username || "").toLowerCase().includes(kw)) : users;
      const sorted = [...filtered].sort((a, b) =>
         sortAsc
            ? (a.username || "").localeCompare(b.username || "")
            : (b.username || "").localeCompare(a.username || "")
      );
      return sorted;
   }, [users, search, sortAsc]);

   const renderItem = ({ item }: { item: UserItem }) => (
      <View style={styles.card}>
         <View style={styles.row}>
            <Image
               source={
                  item.image ? { uri: `data:image/jpeg;base64,${item.image}` } : require("../../assets/images/icon.png")
               }
               style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
               <Text style={styles.name}>{item.username}</Text>
               <Text style={styles.email}>{item.email}</Text>
               <Text style={{ color: "#444" }}>Password: {item.password}</Text>
            </View>

            <View style={{ gap: 6 }}>
               <TouchableOpacity style={[styles.btn, { backgroundColor: "#0a7ea4" }]} onPress={() => startEdit(item)}>
                  <Text style={{ color: "#fff" }}>Sửa</Text>
               </TouchableOpacity>

               <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => confirmDelete(item)}>
                  {busyId === item.id ? <ActivityIndicator /> : <Text style={{ color: "#fff" }}>Xóa</Text>}
               </TouchableOpacity>
            </View>
         </View>
      </View>
   );

   return (
      <View style={{ flex: 1, padding: 16 }}>
         <Text style={styles.title}>Admin • Tất cả người dùng</Text>

         {/* Search + sort bar */}
         <View style={{ gap: 8, marginBottom: 12 }}>
            <TextInput style={styles.search} placeholder="🔍 Tìm theo tên..." value={search} onChangeText={setSearch} />
            <View style={styles.toolbar}>
               <Text style={{ color: "#666" }}>
                  Tổng: {users.length} • Hiển thị: {filteredUsers.length}
               </Text>
               <TouchableOpacity onPress={() => setSortAsc((s) => !s)}>
                  <Text style={{ color: "#0a7ea4", fontWeight: "600" }}>Sắp xếp {sortAsc ? "A–Z" : "Z–A"}</Text>
               </TouchableOpacity>
            </View>
         </View>

         <FlatList
            data={filteredUsers}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingBottom: 40 }}
         />

         {/* Edit Modal */}
         <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
            <View style={styles.modalBackdrop}>
               <View style={styles.modalCard}>
                  <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Sửa user</Text>

                  <TextInput style={styles.input} placeholder="Username" value={uName} onChangeText={setUName} />
                  <TextInput
                     style={styles.input}
                     placeholder="Email"
                     value={uEmail}
                     onChangeText={setUEmail}
                     autoCapitalize="none"
                     keyboardType="email-address"
                  />
                  <TextInput
                     style={styles.input}
                     placeholder="Password (Firestore)"
                     value={uPass}
                     onChangeText={setUPass}
                  />

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                     <TouchableOpacity
                        style={[styles.btn, { flex: 1, backgroundColor: "#ddd" }]}
                        onPress={() => setEditing(null)}
                     >
                        <Text>Hủy</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        style={[styles.btn, { flex: 1, backgroundColor: "#0a7ea4" }]}
                        onPress={saveEdit}
                        disabled={busyId === editing?.id}
                     >
                        {busyId === editing?.id ? <ActivityIndicator /> : <Text style={{ color: "#fff" }}>Lưu</Text>}
                     </TouchableOpacity>
                  </View>

                  <Text style={styles.note}>
                     Khuyến nghị: Không được tiết lộ mật khẩu của users 
                  </Text>
               </View>
            </View>
         </Modal>
      </View>
   );
}

const styles = StyleSheet.create({
   title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginVertical: 8 },
   search: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "#fff",
   },
   toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

   card: { padding: 12, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
   row: { flexDirection: "row", alignItems: "center", gap: 12 },
   avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#eee" },
   name: { fontSize: 16, fontWeight: "700" },
   email: { color: "#666" },

   btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: "center", justifyContent: "center" },
   deleteBtn: { backgroundColor: "#d9534f" },

   // modal
   modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", padding: 20 },
   modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
   input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      backgroundColor: "#fafafa",
      marginBottom: 8,
   },
   note: { marginTop: 12, color: "#777", fontSize: 12 },
});
