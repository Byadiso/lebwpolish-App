import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, SafeAreaView, StyleSheet 
} from "react-native";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { 
  collection, addDoc, serverTimestamp, query, where, 
  getDocs, onSnapshot, deleteDoc, doc, updateDoc 
} from "firebase/firestore";

const POLISH_CITIES = ["Warszawa", "Kraków", "Wrocław", "Łódź", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Białystok"];
const ADMIN_EMAIL = "byadiso@gmail.com";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Identity States
  const [studentEmail, setStudentEmail] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("A1");

  // Content States
  const [drillPolish, setDrillPolish] = useState("");
  const [drillEnglish, setDrillEnglish] = useState("");
  const [gramQuestion, setGramQuestion] = useState("");
  const [gramAnswer, setGramAnswer] = useState("");

  // Live Lists
  const [pendingUsers, setPendingUsers] = useState([]);
  const [grammarTasks, setGrammarTasks] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const unsubUsers = onSnapshot(collection(db, "pending_users"), (s) => {
      setPendingUsers(s.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubGram = onSnapshot(collection(db, "grammar_lab"), (s) => {
      setGrammarTasks(s.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubRes = onSnapshot(collection(db, "resources"), (s) => {
      setResources(s.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { unsubUsers(); unsubGram(); unsubRes(); };
  }, [user]);

  const handleAddDrill = async () => {
    if (!drillPolish || !drillEnglish) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "drills"), {
        polish: drillPolish.trim(), english: drillEnglish.trim(),
        level: "A1", createdAt: serverTimestamp()
      });
      Alert.alert("Success", "Drill Online!");
      setDrillPolish(""); setDrillEnglish("");
    } catch (err) { Alert.alert("Error", "Drill failed."); }
    finally { setLoading(false); }
  };

  const handleCreateStudent = async () => {
    setLoading(true);
    const accessKey = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const emailLower = studentEmail.trim().toLowerCase();
      await addDoc(collection(db, "pending_users"), {
        email: emailLower, level: "A1", passcode: accessKey,
        cityName: POLISH_CITIES[Math.floor(Math.random() * POLISH_CITIES.length)],
        role: "user", claimed: false, createdAt: serverTimestamp()
      });
      setGeneratedKey(accessKey);
      setStudentEmail("");
    } catch (error) { Alert.alert("Error", "Write rejected."); }
    finally { setLoading(false); }
  };

  const confirmDelete = (col, id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to purge this record?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(col, id) }
    ]);
  };

  const handleDelete = async (col, id) => {
    try {
      await deleteDoc(doc(db, col, id));
    } catch (err) { Alert.alert("Error", "Delete failed."); }
  };

  if (authLoading) return <View style={styles.centered}><ActivityIndicator color="#6366f1" /></View>;
  if (!user || user.email !== ADMIN_EMAIL) return <View style={styles.denied}><Text style={styles.deniedText}>ACCESS DENIED</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ADMIN <Text style={{color: '#6366f1'}}>CORE</Text></Text>
          <Text style={styles.headerSub}>{user.email}</Text>
        </View>

        {/* IDENTITY MANAGER */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>IDENTITY MANAGER</Text>
          <TextInput 
            value={studentEmail} 
            onChangeText={setStudentEmail}
            placeholder="Student email..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <TouchableOpacity 
            onPress={handleCreateStudent}
            disabled={loading}
            style={styles.buttonPrimary}
          >
            <Text style={styles.buttonText}>GENERATE KEY</Text>
          </TouchableOpacity>
          {generatedKey ? (
            <View style={styles.keyDisplay}>
              <Text style={styles.keyText}>{generatedKey}</Text>
              <TouchableOpacity onPress={() => setGeneratedKey("")}>
                <Text style={styles.resetText}>RESET</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* DRILL FACTORY */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DRILL FACTORY</Text>
          <TextInput 
            value={drillPolish} 
            onChangeText={setDrillPolish}
            placeholder="Polish Sentence"
            style={styles.input}
          />
          <TextInput 
            value={drillEnglish} 
            onChangeText={setDrillEnglish}
            placeholder="English Translation"
            style={styles.input}
          />
          <TouchableOpacity onPress={handleAddDrill} style={[styles.buttonPrimary, { backgroundColor: '#e11d48' }]}>
            <Text style={styles.buttonText}>DEPLOY DRILL 🚀</Text>
          </TouchableOpacity>
        </View>

        {/* SYSTEM MONITOR (USER MATRIX) */}
        <View style={styles.darkCard}>
          <Text style={styles.monitorLabel}>SYSTEM MONITOR</Text>
          {pendingUsers.map((u) => (
            <View key={u.id} style={styles.monitorRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.monitorEmail} numberOfLines={1}>{u.email}</Text>
                <Text style={styles.monitorStatus}>{u.claimed ? "CLAIMED" : "PENDING"}</Text>
              </View>
              <TouchableOpacity onPress={() => confirmDelete('pending_users', u.id)}>
                <Text style={{ color: '#fb7185', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 30 },
  headerTitle: { fontSize: 40, fontWeight: '900', fontStyle: 'italic', letterSpacing: -2 },
  headerSub: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 2, marginTop: 5 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 25, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 15 },
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 15, marginBottom: 10, fontWeight: 'bold', borderWidth: 1, borderColor: '#f1f5f9' },
  buttonPrimary: { backgroundColor: '#6366f1', padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '900', fontSize: 12 },
  keyDisplay: { marginTop: 15, padding: 15, backgroundColor: '#eef2ff', borderRadius: 15, alignItems: 'center' },
  keyText: { fontSize: 24, fontWeight: '900', color: '#4338ca', letterSpacing: 5 },
  resetText: { fontSize: 10, color: '#6366f1', fontWeight: 'bold', marginTop: 5 },
  darkCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 25, minHeight: 300 },
  monitorLabel: { color: '#818cf8', fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 20 },
  monitorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  monitorEmail: { color: '#f1f5f9', fontSize: 12, fontWeight: 'bold' },
  monitorStatus: { color: '#64748b', fontSize: 8, fontWeight: 'bold', marginTop: 2 },
  denied: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  deniedText: { color: 'white', fontWeight: '900', letterSpacing: 5 }
});

export default AdminDashboard;