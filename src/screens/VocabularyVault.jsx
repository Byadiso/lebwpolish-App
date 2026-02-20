import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, SafeAreaView, 
  ActivityIndicator, Animated, Dimensions 
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { VOCAB_VAULT } from "../data/vocabVault";
import { ChevronLeft, CheckCircle2, Zap, BrainCircuit } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function VocabLexicon() {
  const { user, profile } = useAuth();
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const activeIndex = VOCAB_VAULT.findIndex(n => n.id === selectedNode);
  const activeLesson = VOCAB_VAULT[activeIndex];
  const nextLesson = VOCAB_VAULT[activeIndex + 1];

  useEffect(() => {
    setUserAnswer(null);
    setError(false);
    setIsCorrect(false);
    
    // Trigger fade in animation when node changes
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [selectedNode]);

  const handleMastery = async (nodeId) => {
    if (userAnswer !== activeLesson.challenge.correct) {
      setError(true);
      return;
    }

    setLoading(true);
    try {
      // In React Native/Firebase v9+, we usually have the UID directly 
      // targeting "users" collection is faster than a query if you have the ID
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        completedVocab: arrayUnion(nodeId),
        xp: increment(150),
        vocabPoints: increment(20)
      });
      setIsCorrect(true);
    } catch (e) {
      console.error("Mastery Update Failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- GRID MENU VIEW ---
  if (!selectedNode) {
    const completed = profile?.completedVocab || [];
    return (
      <SafeAreaView className="flex-1 bg-[#020617]">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View className="items-center mb-10 pt-6">
            <Text className="text-4xl font-black italic tracking-tighter text-white uppercase">
              B1 <Text className="text-emerald-500">LEXICON</Text>
            </Text>
            <Text className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mt-2">
              Advanced Word Acquisition Lab
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {VOCAB_VAULT.map((node) => {
              const isDone = completed.includes(node.id);
              return (
                <TouchableOpacity
                  key={node.id}
                  onPress={() => setSelectedNode(node.id)}
                  activeOpacity={0.7}
                  style={{ width: '100%' }}
                  className={`flex-row items-center p-5 rounded-3xl border mb-4 ${
                    isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-white/5'
                  }`}
                >
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    isDone ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}>
                    {isDone ? <CheckCircle2 size={20} color="white" /> : <Text className="text-xl">{node.icon}</Text>}
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      {node.label}
                    </Text>
                    <Text className="text-lg font-bold text-white">{node.concept}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- DETAIL LAB VIEW ---
  const alreadyCompleted = profile?.completedVocab?.includes(activeLesson.id);

  return (
    <SafeAreaView className="flex-1 bg-[#020617]">
      <View className="px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => setSelectedNode(null)} className="flex-row items-center">
          <ChevronLeft size={20} color="#64748b" />
          <Text className="text-[10px] font-black text-slate-500 uppercase ml-1">Exit Lab</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
          <View className="mx-5 bg-slate-900 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
            {/* Header */}
            <View className="bg-emerald-600 p-8 relative">
              <Text className="text-3xl font-black uppercase italic tracking-tighter text-white z-10">
                {activeLesson.concept}
              </Text>
              <Text className="absolute right-[-10] bottom-[-10] text-9xl opacity-20 rotate-12">
                {activeLesson.icon}
              </Text>
            </View>

            <View className="p-6">
              {/* Sections */}
              {activeLesson.sections.map((s, idx) => (
                <View key={idx} className="bg-black/40 p-5 rounded-3xl border border-white/5 mb-4">
                  <Text className="text-emerald-400 font-black text-[10px] uppercase mb-2 tracking-widest">{s.title}</Text>
                  <Text className="text-slate-300 text-sm mb-3 leading-relaxed">{s.content}</Text>
                  <View className="border-l-2 border-emerald-500/50 pl-3">
                    <Text className="text-white font-bold italic text-sm">{s.ex}</Text>
                  </View>
                </View>
              ))}

              {/* Challenge Zone */}
              <View className={`mt-4 p-4 rounded-3xl ${isCorrect || alreadyCompleted ? 'bg-emerald-500/5' : ''}`}>
                <View className="flex-row items-center mb-4">
                  <Zap size={16} color="#10b981" />
                  <Text className="text-base font-bold text-slate-100 ml-2">{activeLesson.challenge.q}</Text>
                </View>

                {activeLesson.challenge.options.map(opt => {
                  const isSelected = userAnswer === opt || (alreadyCompleted && opt === activeLesson.challenge.correct);
                  return (
                    <TouchableOpacity 
                      key={opt}
                      disabled={isCorrect || alreadyCompleted}
                      onPress={() => {setUserAnswer(opt); setError(false);}}
                      className={`w-full p-4 rounded-2xl mb-2 border ${
                        isSelected ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-800/50 border-transparent'
                      }`}
                    >
                      <Text className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-400'}`}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}

                {error && (
                  <Text className="text-center text-rose-500 text-[10px] font-black uppercase mt-4 tracking-widest">
                    Selection Refused. Try Again.
                  </Text>
                )}

                {/* Main Action Button */}
                <TouchableOpacity 
                  disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                  onPress={() => handleMastery(activeLesson.id)}
                  className={`w-full mt-6 py-5 rounded-2xl items-center ${
                    alreadyCompleted || isCorrect ? 'bg-emerald-500/20 border border-emerald-500/40' : 
                    !userAnswer ? 'bg-slate-800' : 'bg-white'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Text className={`font-black uppercase tracking-widest text-xs ${
                      alreadyCompleted || isCorrect ? 'text-emerald-400' : 
                      !userAnswer ? 'text-slate-600' : 'text-black'
                    }`}>
                      {(isCorrect || alreadyCompleted) ? "Lexicon Updated" : "Lock In Word"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Continue/Advance Button */}
                {(isCorrect || alreadyCompleted) && nextLesson && (
                  <TouchableOpacity
                    onPress={() => setSelectedNode(nextLesson.id)}
                    className="w-full mt-4 py-4 bg-emerald-500/10 rounded-2xl items-center"
                  >
                    <Text className="text-emerald-400 font-bold text-[10px] uppercase">
                      Advance to: {nextLesson.concept} →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}