import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  Dimensions
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { query, collection, where, getDocs, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { GRAMMAR_VAULT } from "../data/grammarVault";
import { ChevronLeft, ArrowRight, CheckCircle2 } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function GrammarGauntlet() {
  const { user, profile } = useAuth();
  const navigation = useNavigation();
  const scrollRef = useRef(null);

  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const activeIndex = GRAMMAR_VAULT.findIndex(n => n.id === selectedNode);
  const activeLesson = GRAMMAR_VAULT[activeIndex];
  const nextLesson = GRAMMAR_VAULT[activeIndex + 1];

  useEffect(() => {
    setUserAnswer(null);
    setError(false);
    setIsCorrect(false);
    // Scroll to top on mobile when lesson changes
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [selectedNode]);

  const handleMastery = async (nodeId) => {
    if (userAnswer !== activeLesson.challenge.correct) {
      setError(true);
      setIsCorrect(false);
      return;
    }

    setLoading(true);
    setError(false);
    
    try {
      const q = query(collection(db, "users"), where("email", "==", user.email.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          completedCategories: arrayUnion(nodeId),
          xp: increment(100),
          grammarPoints: increment(15)
        });
        setIsCorrect(true);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- MENU VIEW ---
  if (!selectedNode) {
    const completed = profile?.completedCategories || [];
    return (
      <SafeAreaView className="flex-1 bg-[#020617]">
        <ScrollView ref={scrollRef} className="px-6 py-8">
          <View className="items-center mb-10 pt-6">
            <Text className="text-4xl font-black italic tracking-tighter uppercase text-white">
              Polish <Text className="text-indigo-500">Codex</Text>
            </Text>
            <View className="mt-5 flex-row items-center bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              <View className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
              <Text className="text-[9px] font-black uppercase tracking-[2px] text-indigo-400">
                B1 Linguistic Engine Active
              </Text>
            </View>
          </View>

          {/* TOP NAVIGATION CARDS */}
          <View className="flex-row justify-between mb-8">
            <TouchableOpacity 
              onPress={() => navigation.navigate("PracticeCase")}
              className="w-[48%] p-5 rounded-3xl bg-indigo-600 border border-white/10 shadow-lg"
            >
              <Text className="text-[8px] font-black uppercase text-white/60 mb-1">Module 01</Text>
              <Text className="text-sm font-black italic uppercase text-white">Grammar Cases</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate("ReadingComprehension")}
              className="w-[48%] p-5 rounded-3xl bg-[#0f172a] border border-indigo-500/30 shadow-lg"
            >
              <Text className="text-[8px] font-black uppercase text-indigo-400 mb-1">Module 02</Text>
              <Text className="text-sm font-black italic uppercase text-white">Reading Codex</Text>
            </TouchableOpacity>
          </View>

          {/* PROGRESS GRID */}
          <View className="space-y-3 pb-20">
            {GRAMMAR_VAULT.map((node, i) => {
              const isDone = completed.includes(node.id);
              return (
                <TouchableOpacity
                  key={node.id}
                  onPress={() => setSelectedNode(node.id)}
                  className={`flex-row items-center p-5 rounded-2xl border ${
                    isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#0f172a] border-white/5 shadow-xl'
                  }`}
                >
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    {isDone ? <CheckCircle2 size={18} color="white" /> : <Text className="text-lg">{node.icon}</Text>}
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{node.label}</Text>
                    <Text className="text-sm font-bold text-slate-200">{node.concept}</Text>
                  </View>
                  <Text className="text-slate-700 font-black text-lg italic opacity-20">
                    {(i + 1).toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- LESSON VIEW ---
  const alreadyCompleted = profile?.completedCategories?.includes(activeLesson.id);

  return (
    <SafeAreaView className="flex-1 bg-[#020617]">
      <ScrollView ref={scrollRef} className="px-5">
        <TouchableOpacity 
          onPress={() => setSelectedNode(null)} 
          className="flex-row items-center mt-6 mb-8"
        >
          <ChevronLeft size={20} color="#64748b" />
          <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
            Return to Codex
          </Text>
        </TouchableOpacity>

        <View className="bg-[#0f172a] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden mb-10">
          {/* Header Section */}
          <View className="bg-indigo-700 p-8 relative">
            <Text className="bg-black/20 text-white/80 text-[8px] font-black uppercase tracking-[2px] px-3 py-1 rounded-full self-start">
              B1 Masterclass
            </Text>
            <Text className="text-3xl font-black uppercase italic tracking-tighter text-white mt-4 leading-8">
              {activeLesson.concept}
            </Text>
            <View className="absolute bottom-[-10px] right-4 opacity-10">
               <Text className="text-8xl">{activeLesson.icon}</Text>
            </View>
          </View>

          <View className="p-8 space-y-8">
            {/* Logic Block */}
            <View className="items-center">
              <Text className="text-[9px] font-black text-indigo-400 uppercase tracking-[3px] mb-4">The Logic</Text>
              <Text className="text-xl text-slate-100 italic leading-7 text-center font-serif">
                "{activeLesson.lesson}"
              </Text>
            </View>

            {/* Sections */}
            <View className="space-y-4">
              {activeLesson.sections.map((sec, idx) => (
                <View key={idx} className="bg-[#020617] p-6 rounded-3xl border border-white/5">
                  <Text className="text-indigo-400 font-black text-[10px] uppercase mb-2 tracking-widest">{sec.title}</Text>
                  <Text className="text-slate-300 text-sm mb-4 leading-5 font-medium">{sec.content}</Text>
                  <View className="bg-emerald-500/10 self-start px-4 py-2 rounded-xl border border-emerald-500/20">
                    <Text className="text-emerald-400 font-black text-xs">
                      <Text className="opacity-50">EX: </Text>{sec.ex}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Challenge Block */}
            <View className={`p-6 rounded-[30px] border-2 ${
              isCorrect || alreadyCompleted ? 'bg-emerald-500/5 border-emerald-500/40' : 'bg-indigo-500/5 border-dashed border-indigo-500/20'
            }`}>
              <View className="items-center mb-6">
                <View className={`${isCorrect || alreadyCompleted ? 'bg-emerald-500' : 'bg-indigo-500'} px-3 py-1 rounded-full`}>
                  <Text className="text-[8px] font-black text-white tracking-widest">
                    {isCorrect || alreadyCompleted ? 'VERIFIED' : 'CHALLENGE'}
                  </Text>
                </View>
              </View>
              
              <Text className="text-lg font-bold text-slate-100 mb-6 text-center">{activeLesson.challenge.q}</Text>
              
              <View className="space-y-3">
                {activeLesson.challenge.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    disabled={isCorrect || alreadyCompleted}
                    onPress={() => { setUserAnswer(option); setError(false); }}
                    className={`p-5 rounded-2xl border-2 items-center ${
                      userAnswer === option || (alreadyCompleted && option === activeLesson.challenge.correct)
                      ? (isCorrect || alreadyCompleted ? 'bg-emerald-600 border-emerald-400' : 'bg-indigo-600 border-indigo-400') 
                      : 'bg-slate-900 border-white/5'
                    }`}
                  >
                    <Text className={`font-black uppercase tracking-widest text-xs ${userAnswer === option || (alreadyCompleted && option === activeLesson.challenge.correct) ? 'text-white' : 'text-slate-500'}`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error && (
                <Text className="mt-6 text-rose-500 text-[9px] font-black uppercase text-center italic tracking-widest">
                  ❌ Construction Error. Review the logic above.
                </Text>
              )}
            </View>

            {/* Footer Buttons */}
            <View className="pb-10">
              <TouchableOpacity
                disabled={loading || alreadyCompleted || !userAnswer || isCorrect}
                onPress={() => handleMastery(activeLesson.id)}
                className={`py-6 rounded-3xl items-center ${
                  alreadyCompleted || isCorrect
                  ? 'bg-emerald-500/10 border border-emerald-500/50' 
                  : !userAnswer 
                    ? 'bg-slate-800 opacity-50'
                    : 'bg-white shadow-lg'
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className={`font-black uppercase tracking-[2px] text-xs ${alreadyCompleted || isCorrect ? 'text-emerald-400' : 'text-black'}`}>
                    {(isCorrect || alreadyCompleted) ? "Construction Mastered" : "Verify Construction"}
                  </Text>
                )}
              </TouchableOpacity>

              {(isCorrect || alreadyCompleted) && nextLesson && (
                <View className="mt-4 p-6 bg-indigo-500/10 rounded-[30px] border border-indigo-500/20 items-center">
                  <Text className="text-indigo-300 text-[8px] font-black uppercase tracking-widest mb-4 opacity-70">
                    Sequential Access Granted
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setSelectedNode(nextLesson.id)}
                    className="w-full py-5 bg-indigo-600 rounded-2xl flex-row items-center justify-center shadow-lg"
                  >
                    <Text className="text-white font-black uppercase tracking-widest text-[9px] mr-2">
                      Next: {nextLesson.concept}
                    </Text>
                    <ArrowRight size={14} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}