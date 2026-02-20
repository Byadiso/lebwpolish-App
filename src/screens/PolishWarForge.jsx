import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, SafeAreaView, 
  Animated, LayoutAnimation, Platform, UIManager, Dimensions 
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { FORGE_DATA } from "../data/ForgeData";
import { ChevronLeft, Flame, Heart, Info, Award } from "lucide-react-native";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

export default function PolishWarForge() {
  const { user, profile } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [wordBank, setWordBank] = useState([]);
  const [constructedSentence, setConstructedSentence] = useState([]);
  const [stamina, setStamina] = useState(3);
  const [isForged, setIsForged] = useState(false);
  const [streak, setStreak] = useState(0);

  // Animation Refs
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const xpFloatAnim = useRef(new Animated.Value(0)).current;
  const [showXpGain, setShowXpGain] = useState(false);

  const activeIndex = FORGE_DATA.findIndex(n => n.id === selectedId);
  const activeLesson = FORGE_DATA[activeIndex];
  const nextLesson = FORGE_DATA[activeIndex + 1];

  const completedCount = profile?.completedCategories?.length || 0;
  const progressPercent = (completedCount / FORGE_DATA.length) * 100;

  useEffect(() => {
    if (activeLesson) {
      const allWords = [...activeLesson.correctSequence, ...activeLesson.distractors];
      setWordBank(allWords.sort(() => Math.random() - 0.5));
      setConstructedSentence([]);
      setIsForged(false);
      setStamina(3);
    }
  }, [selectedId]);

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const toggleWord = (word, index) => {
    if (isForged || stamina === 0) return;
    animateLayout();
    setConstructedSentence([...constructedSentence, { word, originalIdx: index }]);
    setWordBank(wordBank.filter((_, i) => i !== index));
  };

  const removeWord = (item, index) => {
    if (isForged) return;
    animateLayout();
    setConstructedSentence(constructedSentence.filter((_, i) => i !== index));
    setWordBank([...wordBank, item.word]);
  };

  const triggerError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const verifyForge = async () => {
    const finalStr = constructedSentence.map(s => s.word).join(" ");
    const correctStr = activeLesson.correctSequence.join(" ");

    if (finalStr === correctStr) {
      setIsForged(true);
      setShowXpGain(true);
      setStreak(prev => prev + 1);
      
      // Floating XP Animation
      xpFloatAnim.setValue(0);
      Animated.timing(xpFloatAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          xp: increment(activeLesson.xp + (streak * 10)),
          grammarPoints: increment(20),
          completedCategories: arrayUnion(activeLesson.id)
        });
      } catch (e) { console.error("Sync Failed", e); }
      
      setTimeout(() => setShowXpGain(false), 2000);
    } else {
      triggerError();
      setStamina(s => {
        const newStamina = Math.max(0, s - 1);
        if (newStamina === 0) setStreak(0);
        return newStamina;
      });
    }
  };

  // --- CODEX VIEW ---
  if (!selectedId) {
    return (
      <SafeAreaView className="flex-1 bg-[#020617]">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="items-center mb-8">
            <Text className="text-3xl font-black italic tracking-tighter text-indigo-500 uppercase">
              War <Text className="text-white">Forge</Text>
            </Text>
            
            <View className="w-full max-w-[250] bg-slate-900 h-2 rounded-full mt-6 overflow-hidden">
              <View style={{ width: `${progressPercent}%` }} className="h-full bg-indigo-500" />
            </View>
            <Text className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
              System Mastery: {Math.round(progressPercent)}%
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {FORGE_DATA.map((item) => {
              const isDone = profile?.completedCategories?.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedId(item.id)}
                  style={{ width: '48%' }}
                  className={`p-5 rounded-[24px] border mb-4 ${
                    isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-white/5'
                  }`}
                >
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-xl">{item.icon}</Text>
                    {isDone && <Award size={14} color="#10b981" />}
                  </View>
                  <Text className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.tier}</Text>
                  <Text className="font-bold text-white text-xs leading-tight">{item.concept}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- GAME VIEW ---
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* XP Floating Indicator */}
      {showXpGain && (
        <Animated.View style={{ 
          position: 'absolute', top: '40%', alignSelf: 'center', zIndex: 50,
          opacity: xpFloatAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
          transform: [{ translateY: xpFloatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) }]
        }}>
          <Text className="text-emerald-400 font-black text-4xl italic">+{activeLesson.xp} XP</Text>
        </Animated.View>
      )}

      {/* Header HUD */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity onPress={() => setSelectedId(null)} className="bg-slate-900 px-4 py-2 rounded-full border border-white/5">
          <ChevronLeft size={16} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-3">
          {streak > 1 && (
            <View className="bg-orange-500/10 px-2 py-1 rounded-md flex-row items-center">
              <Flame size={12} color="#f97316" />
              <Text className="text-orange-500 font-black text-[10px] ml-1">{streak}x</Text>
            </View>
          )}
          <View className="flex-row gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} fill={i < stamina ? "#ef4444" : "transparent"} color={i < stamina ? "#ef4444" : "#1e293b"} />
            ))}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
        <View className="bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 mb-4">
          <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{activeLesson.concept}</Text>
        </View>
        <Text className="text-xl font-black italic text-white text-center mb-8 px-4">"{activeLesson.task}"</Text>

        {/* Construction Zone */}
        <Animated.View 
          style={{ transform: [{ translateX: shakeAnim }] }}
          className={`min-h-[160] w-full p-6 rounded-[32px] border-2 border-dashed flex-row flex-wrap justify-center items-center ${
            isForged ? "bg-emerald-500/10 border-emerald-500" : "bg-slate-900/40 border-slate-800"
          }`}
        >
          {constructedSentence.map((item, i) => (
            <TouchableOpacity
              key={`const-${i}`}
              onPress={() => removeWord(item, i)}
              className="bg-indigo-600 px-5 py-3 rounded-2xl m-1 shadow-md"
            >
              <Text className="text-white font-bold">{item.word}</Text>
            </TouchableOpacity>
          ))}
          {constructedSentence.length === 0 && (
            <Text className="text-slate-700 text-[10px] font-black uppercase tracking-widest">Select runes to forge</Text>
          )}
        </Animated.View>

        {/* Word Bank */}
        <View className="flex-row flex-wrap justify-center gap-2 mt-10 mb-32">
          {!isForged && stamina > 0 && wordBank.map((word, i) => (
            <TouchableOpacity
              key={`bank-${i}`}
              onPress={() => toggleWord(word, i)}
              className="bg-slate-900 border border-white/10 px-5 py-3 rounded-2xl"
            >
              <Text className="text-slate-200 font-medium">{word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {stamina === 0 && !isForged && (
          <View className="p-8 bg-rose-500/5 rounded-3xl border border-rose-500/20 items-center w-full">
            <Text className="text-rose-500 font-black uppercase text-xs mb-4">Forge Cold — No Stamina</Text>
            <TouchableOpacity onPress={() => setSelectedId(null)} className="bg-rose-600 px-8 py-3 rounded-2xl">
              <Text className="text-white font-bold">Retry Realm</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity
          onPress={verifyForge}
          disabled={constructedSentence.length === 0 || isForged || stamina === 0}
          className={`w-full py-5 rounded-3xl items-center shadow-2xl ${
            isForged ? "bg-emerald-500" : stamina === 0 ? "bg-slate-800" : "bg-white"
          }`}
        >
          <Text className={`font-black uppercase tracking-widest text-xs ${isForged ? "text-white" : "text-black"}`}>
            {isForged ? "VERIFIED ✓" : stamina === 0 ? "DEPLETED" : "FORGE RUNES"}
          </Text>
        </TouchableOpacity>

        {isForged && nextLesson && (
          <TouchableOpacity
            onPress={() => setSelectedId(nextLesson.id)}
            className="w-full mt-3 py-4 bg-indigo-600 rounded-3xl items-center"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-widest">
              Next Realm: {nextLesson.concept} →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}