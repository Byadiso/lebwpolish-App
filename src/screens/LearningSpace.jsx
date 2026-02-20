import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Linking, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ replaces SafeAreaView
import { db } from '../firebase/config';
import { 
  collection, query, onSnapshot, addDoc, serverTimestamp, 
  orderBy, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, limit 
} from 'firebase/firestore';
import { useAuth } from "../context/AuthContext";
import { useNavigation } from '@react-navigation/native'; // ✅ use hook instead of prop
import { Book, Shield, Zap, Music, Plus, Heart, MessageSquare, Trash2, Edit3, X } from 'lucide-react-native';

const ADMIN_EMAIL = "byadiso@gmail.com";
const POLISH_CHARS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];
const MISSIONS = [
  { id: 1, label: "Hipoteza", prompt: "Co byś zrobił/a, gdybyś wygrał/a milion złotych?", icon: "💰" },
  { id: 2, label: "Wspomnienie", prompt: "Opisz swoje ulubione miejsce z dzieciństwa.", icon: "🏠" },
  { id: 3, label: "Opinia", prompt: "Czy lepiej mieszkać w mieście czy na wsi? Dlaczego?", icon: "🏙️" },
  { id: 4, label: "Plany", prompt: "Gdzie pojedziesz na następne wakacje?", icon: "🏖️" }
];

export default function LearningSpace() { // ✅ removed navigation prop
  const { profile, user, loading: authLoading } = useAuth();
  const navigation = useNavigation(); // ✅ hook instead
  const insets = useSafeAreaInsets(); // ✅ for tab bar spacing
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [vocab, setVocab] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMission, setActiveMission] = useState(MISSIONS[0]);
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentText, setCommentText] = useState("");

  const isAdmin = user?.email === ADMIN_EMAIL;
  const effectiveLevel = profile?.level || (isAdmin ? "C1" : "A1");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // ✅ Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigation.replace('Login');
  }, [user, authLoading]);

  // Firebase Sync
  useEffect(() => {
    const q = query(collection(db, "global_posts"), orderBy('timestamp', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const insertChar = (char, setter, currentVal) => setter(currentVal + char);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const vocabList = vocab.split(',').map(v => v.trim().toLowerCase()).filter(v => v !== "");
      await addDoc(collection(db, "global_posts"), {
        content: text,
        vocabulary: vocabList,
        wordCount,
        missionType: activeMission.label,
        author: profile?.cityName || (isAdmin ? "Instruktor" : "Student"),
        authorEmail: user.email,
        authorLevel: effectiveLevel,
        uid: user.uid,
        likes: [],
        timestamp: serverTimestamp(),
      });
      setText(""); setVocab("");
      Alert.alert("Sukces!", "Twój wpis został opublikowany.");
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleLike = async (p) => {
    const isLiked = p.likes?.includes(user.uid);
    await updateDoc(doc(db, "global_posts", p.id), { 
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) 
    });
  };

  if (authLoading) return (
    <View className="flex-1 justify-center items-center bg-slate-950">
      <ActivityIndicator color="#ef4444" size="large" />
      <Text className="text-white font-black mt-4 uppercase tracking-widest italic">Wczytywanie...</Text>
    </View>
  );

  if (!user) return null; // ✅ prevents flash before redirect

  return (
    // ✅ View + insets instead of SafeAreaView
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }} // ✅ clears tab bar
      >
        
        {/* Header Stats */}
        <View className="flex-row justify-between items-center mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Twój Streak</Text>
            <Text className="text-xl font-black text-rose-500">🔥 {profile?.streak || 0} DNI</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('vocabularyvault')}
            className="bg-indigo-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-black text-[10px] uppercase">
              Słownik ({profile?.vocabulary?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mission Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
          {MISSIONS.map(m => (
            <TouchableOpacity 
              key={m.id}
              onPress={() => setActiveMission(m)}
              className={`mr-2 px-4 py-3 rounded-2xl flex-row items-center ${activeMission.id === m.id ? 'bg-indigo-600' : 'bg-white border border-slate-100'}`}
            >
              <Text className="mr-2 text-sm">{m.icon}</Text>
              <Text className={`font-black text-[10px] uppercase tracking-tighter ${activeMission.id === m.id ? 'text-white' : 'text-slate-400'}`}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Editor Card */}
        <View className="bg-white rounded-[32px] p-5 shadow-xl shadow-indigo-100 border border-indigo-50 mb-8">
          <Text className="text-lg font-bold text-slate-800 mb-4 italic leading-6">
            "{activeMission.prompt}"
          </Text>
          
          <View className="flex-row flex-wrap gap-1 mb-3">
            {POLISH_CHARS.map(char => (
              <TouchableOpacity 
                key={char} 
                onPress={() => insertChar(char, setText, text)}
                className="w-8 h-8 bg-slate-50 rounded-lg items-center justify-center border border-slate-100"
              >
                <Text className="font-black text-slate-700">{char}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            multiline
            numberOfLines={6}
            value={text}
            onChangeText={setText}
            placeholder="Napisz coś ambitnego po polsku..."
            placeholderTextColor="#cbd5e1"
            className="bg-slate-50 rounded-2xl p-4 text-slate-900 text-lg min-h-[120px] text-left mb-4"
            textAlignVertical="top"
          />

          <TextInput
            value={vocab}
            onChangeText={setVocab}
            placeholder="Słówka (oddzielone przecinkiem)"
            className="border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-600 mb-4"
          />

          <TouchableOpacity 
            disabled={!text.trim() || isSubmitting}
            onPress={handleSubmit}
            className={`w-full py-4 rounded-2xl items-center ${!text.trim() ? 'bg-slate-200' : 'bg-indigo-600 shadow-lg shadow-indigo-300'}`}
          >
            {isSubmitting 
              ? <ActivityIndicator color="#fff" /> 
              : <Text className="text-white font-black tracking-widest text-[11px] uppercase">OPUBLIKUJ</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Shadow Protocol Ad */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('shadow-protocol')}
          className="bg-slate-900 rounded-3xl p-6 mb-8 border border-emerald-500/20 overflow-hidden"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-emerald-500 font-black text-[10px] tracking-widest uppercase mb-1">System Aktywny</Text>
              <Text className="text-white text-xl font-black italic uppercase">
                SHADOW<Text className="text-emerald-500">PROTOCOL</Text>
              </Text>
            </View>
            <Zap color="#10b981" size={28} />
          </View>
        </TouchableOpacity>

        {/* Global Feed */}
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">
          Feed Obywatelski
        </Text>
        
        {posts.map(p => (
          <View key={p.id} className="bg-white rounded-[24px] p-5 border border-slate-100 mb-4">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-xl items-center justify-center ${p.authorEmail === ADMIN_EMAIL ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                  <Text className="text-white font-black uppercase">{p.author.charAt(0)}</Text>
                </View>
                <View className="ml-3">
                  <Text className="text-xs font-black text-slate-900 uppercase tracking-tight">{p.author}</Text>
                  <Text className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{p.missionType}</Text>
                </View>
              </View>
              {p.uid === user.uid && (
                <TouchableOpacity onPress={() => Alert.alert("Usuń", "Na pewno?", [
                  { text: 'Tak', onPress: () => deleteDoc(doc(db, "global_posts", p.id)) }, 
                  { text: 'Nie' }
                ])}>
                  <Trash2 size={16} color="#fda4af" />
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-slate-800 text-[16px] leading-6 font-medium italic border-l-4 border-indigo-50 pl-4 mb-4">
              "{p.content}"
            </Text>

            {p.vocabulary?.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {p.vocabulary.map((v, i) => (
                  <View key={i} className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <Text className="text-[9px] font-black text-slate-400 uppercase">{v}</Text>
                  </View>
                ))}
              </View>
            )}

            <View className="flex-row gap-6 border-t border-slate-50 pt-4">
              <TouchableOpacity onPress={() => handleLike(p)} className="flex-row items-center">
                <Heart 
                  size={20} 
                  color={p.likes?.includes(user.uid) ? "#f43f5e" : "#cbd5e1"} 
                  fill={p.likes?.includes(user.uid) ? "#f43f5e" : "transparent"} 
                />
                <Text className="ml-2 font-black text-xs text-slate-400">{p.likes?.length || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center">
                <MessageSquare size={20} color="#cbd5e1" />
                <Text className="ml-2 font-black text-xs text-slate-400 uppercase tracking-widest text-[10px]">
                  Feedback
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}