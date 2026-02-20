import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { 
  Lock, 
  BookOpen, 
  Mic, 
  Zap, 
  Database, 
  ChevronRight 
} from "lucide-react-native";

export default function EnrollmentGuard({ children, user, featureName = "module" }) {
  const navigation = useNavigation();

  // If user exists, render the protected content immediately
  if (user) return children;

  const labs = [
    { name: 'Grammar', path: 'Grammar', icon: BookOpen, desc: 'Core structures' },
    { name: 'Shadowing', path: 'ShadowProtocol', icon: Mic, desc: 'Pronunciation' },
    { name: 'Vocabulary', path: 'VocabularyVault', icon: Database, desc: 'Word storage' },
    { name: 'Simplified', path: 'PolishSimplified', icon: Zap, desc: 'Speed learning' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <ScrollView 
        contentContainerStyle={{ paddingVertical: 40, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 1. PRIMARY ACTION: OPEN ACCESS LABS */}
        <View className="mb-10">
          <View className="items-center mb-6">
            <Text className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-2">
              Available Now
            </Text>
            <Text className="text-slate-900 font-bold text-base text-center">
              Start training with our Open Access Labs
            </Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {labs.map((item) => (
              <TouchableOpacity 
                key={item.name}
                onPress={() => navigation.navigate(item.path)}
                activeOpacity={0.7}
                className="flex-row items-center bg-white border border-slate-200 p-4 rounded-2xl w-[48%] mb-3 shadow-sm"
              >
                <View className="bg-slate-50 p-2 rounded-lg mr-3">
                  <item.icon size={18} color="#94a3b8" strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                    {item.name}
                  </Text>
                  <Text className="text-[8px] text-slate-400 font-medium">{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. SECONDARY ACTION: THE PREMIUM UPGRADE (THE GUARD) */}
        <View className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl items-center relative overflow-hidden">
          <View className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
          
          <View className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full mb-6">
            <Lock size={14} color="#dc2626" strokeWidth={3} />
            <Text className="text-[9px] font-black uppercase tracking-widest text-red-600 ml-2">
              Reserved Area
            </Text>
          </View>

          <View className="items-center mb-8">
            <Text className="text-2xl font-black text-slate-900 tracking-tighter uppercase text-center leading-7">
              Unlock Full{"\n"}
              <Text className="text-red-600 italic">Persistence</Text>
            </Text>
            
            <Text className="text-slate-500 text-xs leading-5 font-medium text-center mt-4">
              The <Text className="text-slate-900 font-bold">{featureName}</Text> requires a verified profile to save XP and track your long-term fluency streaks.
            </Text>
          </View>

          <View className="w-full space-y-4 mb-8">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
              className="w-full bg-slate-900 py-5 rounded-2xl items-center shadow-lg"
            >
              <Text className="text-white font-black uppercase tracking-widest text-[10px]">
                Claim Invitation
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              className="items-center py-2"
            >
              <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Already Member? <Text className="text-red-600 underline">Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Premium Benefits Row */}
          <View className="pt-8 border-t border-slate-50 flex-row justify-around w-full">
            <View className="items-center">
              <Text className="text-[8px] font-black text-slate-400 uppercase mb-1">Vault</Text>
              <Text className="text-[10px] font-bold text-slate-900 uppercase">XP Core</Text>
            </View>
            <View className="h-6 w-[1px] bg-slate-100" />
            <View className="items-center">
              <Text className="text-[8px] font-black text-slate-400 uppercase mb-1">Metrics</Text>
              <Text className="text-[10px] font-bold text-slate-900 uppercase">Streaks</Text>
            </View>
            <View className="h-6 w-[1px] bg-slate-100" />
            <View className="items-center">
              <Text className="text-[8px] font-black text-slate-400 uppercase mb-1">Rank</Text>
              <Text className="text-[10px] font-bold text-slate-900 uppercase">Badges</Text>
            </View>
          </View>
        </View>
        
        <View className="mt-12 items-center">
          <Text className="text-slate-300 text-[8px] font-black uppercase tracking-[4px] text-center">
            Nganatech Managed Environment • 2026
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}