import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { BookOpen, Mic, Database, Zap, ArrowRight, CheckCircle2 } from "lucide-react-native";

const PathIcon = ({ type, color = "#94a3b8" }) => {
  const iconProps = { size: 24, color: color, strokeWidth: 2.5 };
  switch (type) {
    case 'grammar': return <BookOpen {...iconProps} />;
    case 'shadow': return <Mic {...iconProps} />;
    case 'vault': return <Database {...iconProps} />;
    case 'zap': return <Zap {...iconProps} />;
    default: return <BookOpen {...iconProps} />;
  }
};

export default function Home() {
  const { user, profile } = useAuth();
  const [showBriefing, setShowBriefing] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const learningPaths = [
    { name: 'Grammar Labs', path: 'Grammar', type: 'grammar', tag: 'Structure' },
    { name: 'Shadow Protocol', path: 'shadow-protocol', type: 'shadow', tag: 'Audio' },
    { name: 'Vocabulary Vault', path: 'vocabularyvault', type: 'vault', tag: 'Memory' },
    { name: 'Simplified Polish', path: 'polish-simplified', type: 'zap', tag: 'Speed' }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >

        {/* Streak/Level Overlay — ✅ && replaced with ternary */}
        {user ? (
          <View className="mx-auto mt-6 bg-white shadow-sm border border-slate-200 px-6 py-3 rounded-full flex-row items-center justify-between w-[90%]">
            <View className="flex-row items-center">
              <View className="h-2 w-2 rounded-full bg-red-600 mr-2" />
              <Text className="text-[10px] font-black tracking-widest text-slate-900 uppercase">
                {'STREAK: '}{profile?.streak || 0}
              </Text>
            </View>
            <View className="h-4 w-[1px] bg-slate-300 mx-4" />
            <Text className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              {'LVL: '}{profile?.level || '1'}
            </Text>
          </View>
        ) : null}

        {/* Hero Section */}
        <View className="items-center pt-16 px-6">
          <View className="mb-6 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            <Text className="text-[9px] font-black tracking-[3px] text-red-600 uppercase">
              {'Writing • Listening • Mastery'}
            </Text>
          </View>

          {/* ✅ Logo strings wrapped in {} */}
          <Text className="text-6xl font-black text-slate-900 tracking-tighter text-center leading-[55px]">
            {'LEBW'}<Text className="text-red-600">{'POL'}</Text>
          </Text>

          <Text className="text-base text-slate-500 mt-6 text-center leading-6 font-medium px-4">
            {user ? (
              <Text>
                {'Welcome back, '}
                <Text className="text-slate-900 font-bold italic">
                  {profile?.cityName || 'Operator'}
                </Text>
                {'. Your '}
                <Text className="text-red-600 font-black">{'Immersion Protocol'}</Text>
                {' is live.'}
              </Text>
            ) : (
              <Text>
                {'Stop memorizing tables. Start '}
                <Text className="text-slate-900 font-bold underline decoration-red-500">
                  {'producing language'}
                </Text>
                {'. Master Polish through active writing and native audio.'}
              </Text>
            )}
          </Text>
        </View>

        {/* Learning Paths Grid */}
        <View className="px-6 mt-12 flex-row flex-wrap justify-between">
          {learningPaths.map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigation.navigate(item.path)}
              activeOpacity={0.7}
              className="bg-white border border-slate-200 p-5 rounded-[2rem] w-[48%] mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="p-2 bg-slate-50 rounded-xl">
                  <PathIcon type={item.type} />
                </View>
                <View className="bg-slate-100 px-2 py-1 rounded-md">
                  <Text className="text-[7px] font-black uppercase text-slate-500">{item.tag}</Text>
                </View>
              </View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">
                {item.name}
              </Text>
              <Text className="text-[9px] text-slate-400 font-bold uppercase">{'Enter Module →'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Primary CTAs */}
        <View className="px-6 mt-8 space-y-4">
          <TouchableOpacity
            onPress={() => navigation.navigate(user ? 'SpaceTab' : 'Login')}
            className="bg-slate-900 py-6 rounded-2xl flex-row items-center justify-center shadow-xl"
          >
            <Text className="text-white font-black text-sm uppercase tracking-widest mr-2">
              {user ? 'RESUME TRAINING' : 'ENTER PRACTICE SPACE'}
            </Text>
            <ArrowRight size={16} color="white" />
          </TouchableOpacity>

          {/* ✅ && replaced with ternary */}
          {!user ? (
            <TouchableOpacity
              onPress={() => setShowBriefing(true)}
              className="bg-white border-2 border-slate-200 py-6 rounded-2xl items-center"
            >
              <Text className="text-slate-900 font-black text-sm uppercase tracking-widest">
                {'HOW IT WORKS'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Member-Only Promo — ✅ && replaced with ternary */}
        {!user ? (
          <View className="px-6 mt-16">
            <View className="bg-slate-900 rounded-[3rem] p-8 overflow-hidden">
              <Text className="text-red-500 text-[9px] font-black uppercase tracking-[3px] mb-4">
                {'Member-Only Access'}
              </Text>
              <Text className="text-3xl font-black text-white uppercase tracking-tighter leading-8 mb-4">
                {'Unlock the Full '}
                <Text className="text-red-500 italic">{'Experience'}</Text>
              </Text>
              <Text className="text-slate-400 text-xs leading-5 mb-8 font-medium">
                {'Authorized students gain access to the Liryczna Symfonia and daily writing feedback.'}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                className="bg-red-600 py-4 px-8 rounded-xl items-center"
              >
                <Text className="text-white font-black uppercase text-[10px] tracking-widest">
                  {'Claim Your Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Trust Bar */}
        <View className="bg-white border-y border-slate-100 py-8 mt-16">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
            {['Free Practice Space', 'Real-Time Progress', 'Native Audio Immersion'].map((text) => (
              <View key={text} className="flex-row items-center mr-8">
                <CheckCircle2 size={12} color="#dc2626" />
                <Text className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">
                  {text}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Footer */}
        <View className="py-12 items-center mt-12">
          <Text className="text-[8px] uppercase tracking-[4px] font-black text-slate-400">
            {'Engineered by Nganatech • 2026'}
          </Text>
        </View>

      </ScrollView>

      {/* Mission Briefing Modal */}
      <Modal visible={showBriefing} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-slate-900/90 px-4">
          <View className="bg-white rounded-[40px] p-8 w-full max-w-sm relative">
            <View className="absolute top-0 left-0 right-0 h-2 bg-red-600 rounded-t-[40px]" />
            <TouchableOpacity
              onPress={() => setShowBriefing(false)}
              className="absolute top-8 right-8"
            >
              <Text className="text-[10px] font-black text-slate-400">{'CLOSE [X]'}</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
              {'Polish Mastery Protocol'}
            </Text>
            <View className="space-y-6 mb-10">
              <View className="flex-row items-start mb-6">
                <Text className="text-red-600 font-black text-xl italic mr-4">{'01.'}</Text>
                <View className="flex-1">
                  <Text className="font-black text-slate-900 uppercase text-[10px] mb-1">
                    {'Active Production'}
                  </Text>
                  <Text className="text-slate-500 text-xs leading-4">
                    {'The brain learns best when it has to create sentences.'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Text className="text-red-600 font-black text-xl italic mr-4">{'02.'}</Text>
                <View className="flex-1">
                  <Text className="font-black text-slate-900 uppercase text-[10px] mb-1">
                    {'Audio Synchronization'}
                  </Text>
                  <Text className="text-slate-500 text-xs leading-4">
                    {'Bridge the gap between reading and hearing native speech.'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => { setShowBriefing(false); navigation.navigate('Signup'); }}
              className="bg-slate-900 py-5 rounded-2xl items-center"
            >
              <Text className="text-white font-black uppercase text-[10px] tracking-widest">
                {'Create Fluency Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}