import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Lock, Copy, Check } from 'lucide-react-native';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const navigation = useNavigation();

  // Logic: Only show password field if email matches admin (as per your React code)
  const isAuthorizedEmail = email.toLowerCase() === "byadiso@gmail.com";

  const copyEmail = async () => {
    await Clipboard.setStringAsync("nganatech@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignup = async () => {
    if (!isAuthorizedEmail) return;
    setError("");
    setLoading(true);

    try {
      const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Credentials not found. Contact Admin for an invitation.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocId = querySnapshot.docs[0].id;
      
      await updateDoc(doc(db, "users", userDocId), {
        uid: userCredential.user.uid,
        status: "active",
        activatedAt: new Date().toISOString()
      });

      navigation.navigate("Space");
    } catch (err) {
      setError(err.message.includes("auth/email-already-in-use") 
        ? "Profile already active. Log in to continue." 
        : "Connection failed. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
          
          {/* Top Admin Contact Section */}
          <View className="items-center mt-10 mb-12">
            <Text className="text-slate-400 text-[9px] font-black uppercase tracking-[3px] mb-3">
              Request Invitation for Polish Mastery
            </Text>
            <TouchableOpacity 
              onPress={copyEmail}
              className="flex-row items-center bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm"
            >
              <Text className="text-xs font-black text-slate-900 mr-3">nganatech@gmail.com</Text>
              <View className="h-4 w-[1px] bg-slate-100 mr-3" />
              <View className="flex-row items-center">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mr-1">
                  {copied ? 'Copied' : 'Copy'}
                </Text>
                {copied ? <Check size={12} color="#dc2626" /> : <Copy size={12} color="#94a3b8" />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Branding */}
          <View className="items-center mb-10">
            <Text className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
              LEBW<Text className="text-red-600 italic">POL</Text>
            </Text>
            <View className="mt-3 px-4 py-1.5 bg-slate-900 rounded-full">
              <Text className="text-[9px] font-black text-white uppercase tracking-[4px]">Fluency Protocol</Text>
            </View>
          </View>

          {/* Main Card */}
          <View className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl relative overflow-hidden">
            <View className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />

            <View className="mb-8">
              <Text className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-7 mb-4">
                Unlock Your{"\n"}
                <Text className="text-red-600 italic">Polish Potential</Text>
              </Text>
              <Text className="text-slate-500 text-xs font-medium leading-5">
                Account activation is reserved for invited learners. Enter your registered email to begin.
              </Text>
            </View>
            
            <View className="space-y-6">
              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                  Assigned Student Email
                </Text>
                <TextInput 
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="learner@lebwpol.com"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              {isAuthorizedEmail && (
                <View className="mt-6">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                    Set Security Password
                  </Text>
                  <TextInput 
                    secureTextEntry
                    placeholder="••••••••" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900"
                    onChangeText={setPassword}
                    value={password}
                  />

                  {error ? (
                    <View className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <Text className="text-red-600 text-[11px] font-black">⚠️ {error}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity 
                    onPress={handleSignup}
                    disabled={loading}
                    className="w-full py-5 bg-slate-900 rounded-2xl flex-row items-center justify-center mt-6 shadow-lg"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-black uppercase tracking-widest text-[10px] mr-2">
                          Begin Learning Journey
                        </Text>
                        <Lock size={14} color="white" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="mt-10 pt-8 border-t border-slate-50 items-center">
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  Already a member? <Text className="text-red-600 underline">Resume Your Learning</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-12 mb-8 items-center">
            <Text className="text-slate-300 text-[9px] font-black uppercase tracking-[5px]">
              Powered by Nganatech • 2026
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}