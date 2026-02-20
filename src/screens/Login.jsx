import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Linking 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

const ADMIN_EMAIL = "byadiso@gmail.com";
const SUPPORT_EMAIL = "nganatech@gmail.com";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !pass) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (normalizedEmail === ADMIN_EMAIL) {
        await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      } else {
        const q = query(
          collection(db, "pending_users"),
          where("email", "==", normalizedEmail),
          where("passcode", "==", pass.trim())
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error("Invalid email or access key.");

        try {
          await signInWithEmailAndPassword(auth, normalizedEmail, pass.trim());
        } catch (signInErr) {
          if (
            signInErr.code === 'auth/user-not-found' ||
            signInErr.code === 'auth/invalid-credential'
          ) {
            await createUserWithEmailAndPassword(auth, normalizedEmail, pass.trim());
          } else {
            throw signInErr;
          }
        }
      }

      setSuccess(true);
      setTimeout(() => navigation.navigate('MainTabs'), 1200); // ✅ fixed route

    } catch (err) {
      setError(err.message.includes("access key")
        ? "Błędny e-mail lub kod dostępu."
        : "Logowanie nieudane. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  const handleSupportEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Access Key Request`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: insets.top }}>

      {/* ✅ Top Navbar with back button + logo + signup */}
      <View style={{ backgroundColor: '#020617' }} className="flex-row justify-between items-center px-5 h-14 border-b border-white/5">
        
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs')}
          className="flex-row items-center gap-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={18} color="#64748b" />
          <Text className="text-slate-400 font-black text-[10px] uppercase">{'Home'}</Text>
        </TouchableOpacity>

        {/* Logo */}
        <Text className="text-lg font-black text-white italic tracking-tighter">
          {'LEBW'}<Text className="text-red-600">{'POLISH'}</Text>
        </Text>

        {/* Sign Up CTA */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          className="bg-red-600 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white font-black text-[10px] uppercase">{'Sign Up'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: insets.bottom + 20
          }}
          className="px-6"
        >

          <View className="w-full py-10 px-8 bg-white rounded-[40px] shadow-xl border border-slate-100">

            {/* Logo Section */}
            <View className="mb-10 items-center">
              <Text className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                {'LEBW'}<Text className="text-red-600">{'POL'}</Text>
              </Text>
              <View className="flex-row items-center justify-center mt-3">
                <View className="h-[1px] w-4 bg-slate-200" />
                <Text className="text-slate-400 text-[9px] font-black uppercase tracking-[4px] px-2">
                  {'Secure Access'}
                </Text>
                <View className="h-[1px] w-4 bg-slate-200" />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                <Text className="text-red-600 text-[11px] font-black uppercase tracking-tight">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Inputs */}
            <View className="space-y-6">
              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">
                  {'Email Address'}
                </Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-2 border-transparent"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              <View className="mt-4">
                <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">
                  {email.toLowerCase() === ADMIN_EMAIL ? 'Admin Password' : '6-Digit Access Key'}
                </Text>
                <TextInput
                  secureTextEntry
                  placeholder={email.toLowerCase() === ADMIN_EMAIL ? "••••••••" : "000 000"}
                  placeholderTextColor="#94a3b8"
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 tracking-[5px] border-2 border-transparent"
                  onChangeText={setPass}
                  value={pass}
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading || success}
                className={`w-full py-5 rounded-2xl items-center mt-6 shadow-lg ${
                  loading || success ? "bg-slate-300" : "bg-slate-900"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-black text-[11px] uppercase tracking-[2px]">
                    {success ? 'Success! ✓' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic text-center leading-6">
              {'Brak kodu? Napisz do:\n'}
              <Text
                onPress={handleSupportEmail}
                className="text-red-500 underline"
              >
                {'Administratora ('}{SUPPORT_EMAIL}{')'}
              </Text>
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}