import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, StyleSheet, Dimensions 
} from 'react-native';
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get('window');
const DAY_MS = 1000 * 60 * 60 * 24;
const ADMIN_EMAIL = "byadiso@gmail.com";

export default function Profile({ navigation }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Calculate Days since account creation for Admin fallback
  const accountAgeDays = user?.metadata?.creationTime 
    ? Math.floor((new Date().getTime() - new Date(user.metadata.creationTime).getTime()) / DAY_MS)
    : 0;

  // DYNAMIC FALLBACK
  const displayProfile = profile || (isAdmin ? {
    cityName: "Admin HQ",
    level: "All-Access",
    rank: "Grandmaster",
    streak: accountAgeDays,
    vocabCount: 0,
    lastWrite: { toDate: () => new Date() } 
  } : null);

  if (!displayProfile) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-8">
        <Text className="text-6xl mb-4">⏳</Text>
        <Text className="text-2xl font-bold text-slate-800">Profil w przygotowaniu</Text>
        <Text className="text-slate-500 mt-2 text-center">
          Your Polish identity is being forged...
        </Text>
      </SafeAreaView>
    );
  }

  const lastWriteDate = displayProfile.lastWrite?.toDate?.();
  const diffDays = lastWriteDate
    ? Math.floor((new Date().getTime() - lastWriteDate.getTime()) / DAY_MS)
    : 0;

  // Logic: Streak is "Broken" if more than 24 hours have passed since last post
  const isBroken = diffDays > 1 && !isAdmin;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* Admin Quick Access Bar */}
        {isAdmin && (
          <View className="mb-6 bg-slate-900 p-4 rounded-3xl flex-row justify-between items-center shadow-lg border border-slate-800">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">🔑</Text>
              <View>
                <Text className="text-[10px] font-black uppercase text-red-500 tracking-widest">Admin Mode</Text>
                <Text className="text-xs font-bold text-white">Manage Students</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AdminDashboard')}
              className="bg-red-600 px-4 py-2 rounded-xl"
            >
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Header Card */}
        <View className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
          
          {/* Header Background */}
          <View 
            className={`h-32 w-full flex items-center justify-end pb-4 relative`}
            style={{ backgroundColor: isBroken ? '#0f172a' : '#dc2626' }}
          >
             {isAdmin && (
               <View className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full border border-white/30">
                 <Text className="text-[9px] font-black text-white uppercase tracking-widest">Chief Administrator</Text>
               </View>
             )}
             
             {/* Avatar Circle */}
             <View className="bg-white p-2 rounded-full shadow-lg" style={{ transform: [{ translateY: 48 }] }}>
                <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center">
                  <Text className="text-4xl">
                    {isBroken ? '💀' : isAdmin ? '👑' : '✍️'}
                  </Text>
                </View>
             </View>
          </View>

          <View className="pt-16 pb-10 px-6 items-center">
            <Text className="text-3xl font-black text-slate-800 tracking-tight">
              {displayProfile.cityName}
            </Text>
            
            <View className="flex-row justify-center mt-2">
              <View className="bg-slate-100 px-3 py-1 rounded-full mr-2">
                <Text className="text-slate-600 text-[10px] font-bold uppercase tracking-tighter">
                  Level {displayProfile.level}
                </Text>
              </View>
              <View className="bg-red-50 px-3 py-1 rounded-full">
                <Text className="text-red-600 text-[10px] font-bold uppercase tracking-tighter">
                  Rank: {displayProfile.rank || "Mieszczanin"}
                </Text>
              </View>
            </View>

            {/* DYNAMIC STREAK SECTION */}
            <View 
              className={`w-full mt-8 p-6 rounded-3xl items-center`}
              style={isBroken ? styles.brokenBox : styles.activeBox}
            >
              {isBroken ? (
                <View className="items-center">
                  <Text className="text-xl font-black uppercase tracking-tighter text-red-500 italic">BRUTAL ALERT!</Text>
                  <Text className="text-sm font-medium text-white opacity-80 mt-2 text-center">
                    Silence for <Text className="text-red-500 text-lg font-bold">{diffDays}</Text> days.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('LearningSpace')}
                    className="mt-4 bg-red-600 px-8 py-3 rounded-2xl"
                  >
                    <Text className="text-white text-sm font-bold uppercase">Restore Streak</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center">
                  <Text className="text-xs font-bold text-orange-600 uppercase tracking-widest">Active Streak</Text>
                  <View className="flex-row items-baseline mt-1">
                    <Text className="text-6xl font-black text-slate-900 tracking-tighter">
                      {displayProfile.streak ?? 0}
                    </Text>
                    <Text className="text-2xl ml-2 text-orange-500 font-bold uppercase">Days</Text>
                  </View>
                  <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                    {isAdmin ? "Admin Tenure" : "Keep the flame alive"}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <View className="mt-8 flex-row gap-4">
              <View className="flex-1 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Words</Text>
                <Text className="text-3xl font-black text-slate-800">{displayProfile.vocabCount}</Text>
              </View>

              <View className="flex-1 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</Text>
                <Text className="text-sm font-bold text-slate-700 mb-2" numberOfLines={1}>
                  {displayProfile.rank}
                </Text>
                <View className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                   <View className="bg-red-500 h-full w-[100%]" />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('LearningSpace')}
              className="mt-10 flex-row items-center"
            >
              <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                ← Back to Learning Space
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brokenBox: {
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#dc2626',
    // In React Native, pulse animation requires Animated API, 
    // but a static red border is a strong starting point.
  },
  activeBox: {
    backgroundColor: '#fff7ed', // orange-50
    borderWidth: 1,
    borderColor: '#ffedd5', // orange-100
  }
});