import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LogOut, ShieldAlert } from 'lucide-react-native';

export default function Navbar() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      "Wyloguj się",
      "Czy na pewno chcesz się wylogować?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Wyloguj",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert("Błąd", "Nie udało się wylogować.");
              console.error("Logout error:", error);
            }
          },
        },
      ]
    );
  };

  const isAdmin = user?.email === "byadiso@gmail.com";
  const displayChar = isAdmin ? "A" : (user?.email?.charAt(0).toUpperCase() || "?");
  const displayLabel = isAdmin ? "Admin" : (user?.email?.split('@')[0] || "Obywatel");

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: '#020617' }} className="border-b border-white/5">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View className="flex-row justify-between items-center px-5 py-3 h-14">

        {/* Logo — ✅ strings wrapped in {} to fix Text rendering error */}
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
          <Text className="text-xl font-black text-white italic tracking-tighter">
            {'LEBW'}<Text className="text-red-600">{'POLISH'}</Text>
          </Text>
        </TouchableOpacity>

        {/* Right Side */}
        <View className="flex-row items-center gap-3">
          {user ? (
            <>
              {/* Admin Shield */}
              {isAdmin ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Admin')}
                  className="p-2"
                >
                  <ShieldAlert size={18} color="#ef4444" />
                </TouchableOpacity>
              ) : null}

              {/* Profile Pill */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                className="flex-row items-center gap-2 bg-slate-900 pr-3 pl-1 py-1 rounded-full border border-white/10"
              >
                <View className="w-6 h-6 rounded-full bg-red-600 items-center justify-center">
                  <Text className="text-[10px] font-black text-white">{displayChar}</Text>
                </View>
                <Text className="text-[10px] font-black text-slate-400 uppercase">
                  {displayLabel}
                </Text>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                className="p-2 rounded-lg bg-slate-900 border border-white/10"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LogOut size={18} color="#ef4444" />
              </TouchableOpacity>
            </>
          ) : (
            // Logged out — Login + Signup
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                className="px-3 py-1.5 rounded-lg border border-white/10"
              >
                <Text className="text-slate-400 font-black text-[10px] uppercase">{'Sign Up'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                className="bg-red-600 px-4 py-1.5 rounded-lg"
              >
                <Text className="text-white font-black text-[10px] uppercase">{'Login'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}