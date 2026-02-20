import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Modal, Animated, SafeAreaView, Dimensions, Platform 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from 'expo-speech';
import { db } from "../firebase/config";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { missions } from "../data/MissionData";
import { Mic, ShieldAlert, Zap, Info, RotateCcw, Activity } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function ScenarioEngine() {
  const { user, profile } = useAuth();
  
  // ANIMATION REFS
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // MISSION STATE
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [missionEarnings, setMissionEarnings] = useState(0);
  const [missionLog, setMissionLog] = useState([]);

  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState({ status: "idle", message: "" });
  const [patience, setPatience] = useState(100);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const mission = missions[currentMissionIndex];
  const objective = mission?.objectives[currentStep];

  // LOAD PERSISTENCE
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem("shadow_mission_index");
        const savedStep = await AsyncStorage.getItem("shadow_step_index");
        if (savedIndex !== null) setCurrentMissionIndex(JSON.parse(savedIndex));
        if (savedStep !== null) setCurrentStep(JSON.parse(savedStep));
      } catch (e) { console.error("Load failed", e); }
    };
    loadState();
  }, []);

  // SAVE PERSISTENCE
  useEffect(() => {
    AsyncStorage.setItem("shadow_mission_index", JSON.stringify(currentMissionIndex));
    AsyncStorage.setItem("shadow_step_index", JSON.stringify(currentStep));
  }, [currentMissionIndex, currentStep]);

  // PROGRESS BAR ANIMATION
  useEffect(() => {
    if (mission) {
      const targetWidth = (currentStep / mission.objectives.length) * 100;
      Animated.timing(progressAnim, {
        toValue: targetWidth,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentStep]);

  const calculateXP = () => 50 + Math.floor(patience / 2);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const speakTransmission = (text) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      language: "pl-PL",
      pitch: 0.9,
      rate: 0.8,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleVerify = async () => {
    if (!objective) return;
    const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,?!]/g, "").trim();
    
    if (normalize(userInput) === normalize(objective.correct)) {
      const earnedXP = calculateXP();
      setSessionXP(prev => prev + earnedXP);
      setMissionEarnings(prev => prev + earnedXP);
      setMissionLog(prev => [{ label: objective.label, correct: objective.correct, xp: earnedXP }, ...prev]);
      setFeedback({ status: "success", message: `+${earnedXP} XP - OBJECTIVE SECURED` });
      speakTransmission(objective.correct);
      
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { xp: increment(earnedXP), streak: increment(1) });
      } catch (e) { console.error(e); }

      setTimeout(() => {
        if (currentStep + 1 < mission.objectives.length) {
          setCurrentStep(prev => prev + 1);
          setUserInput("");
          setFeedback({ status: "idle", message: "" });
        } else {
          setFeedback({ status: "complete", message: "MISSION COMPLETE" });
          setTimeout(() => {
            setCurrentMissionIndex(prev => (prev + 1) % missions.length);
            setCurrentStep(0);
            setUserInput("");
            setPatience(100);
            setMissionEarnings(0);
            setMissionLog([]);
            setFeedback({ status: "idle", message: "" });
          }, 3000);
        }
      }, 1500);
    } else {
      triggerShake();
      setFeedback({ status: "error", message: "PROTOCOL BREACH" });
      setPatience(prev => Math.max(0, prev - 15));
    }
  };

  if (!mission) return <SafeAreaView className="flex-1 bg-black items-center justify-center"><Text className="text-emerald-500 font-mono">END OF OPS</Text></SafeAreaView>;

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* HUD HEADER */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-[10px] text-emerald-800 font-black uppercase">XP_CORE</Text>
            <Text className="text-2xl font-black text-white">{(profile?.xp || 0) + sessionXP}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowTerminateModal(true)}
            className="border border-red-900/50 px-3 py-1.5 rounded"
          >
            <Text className="text-[10px] text-red-600 font-black uppercase">Abort Mission</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN TERMINAL */}
        <Animated.View 
          style={{ transform: [{ translateX: shakeAnimation }] }}
          className="bg-emerald-950/5 border border-emerald-900/40 rounded-3xl p-6 overflow-hidden"
        >
          {/* Progress bar */}
          <View className="absolute top-0 left-0 right-0 h-1 bg-emerald-900/20">
            <Animated.View 
              style={{ width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }}
              className="h-full bg-emerald-500"
            />
          </View>

          <View className="flex-row justify-between mb-6 pt-2">
            <View className="flex-1">
              <Text className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1">B1 Level Operation</Text>
              <Text className="text-xl font-black text-white uppercase italic">{mission.title}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => speakTransmission(objective?.label)}
              className={`w-10 h-10 rounded-full items-center justify-center border ${isSpeaking ? 'bg-emerald-500 border-emerald-400' : 'bg-black/40 border-emerald-900/50'}`}
            >
              <Mic size={18} color={isSpeaking ? "black" : "#10b981"} />
            </TouchableOpacity>
          </View>

          {/* PATIENCE BAR */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-1">
              <Text className="text-[8px] text-emerald-800 font-black uppercase">Cognitive Stability</Text>
              <Text className="text-[8px] text-emerald-500 font-black">{patience}%</Text>
            </View>
            <View className="h-1 bg-black rounded-full overflow-hidden">
              <View style={{ width: `${patience}%` }} className={`h-full ${patience < 30 ? 'bg-red-500' : 'bg-emerald-500'}`} />
            </View>
          </View>

          {/* OBJECTIVE */}
          <View className="bg-black/40 border border-emerald-900/30 p-5 rounded-2xl mb-6">
            <Text className="text-[8px] text-emerald-700 font-black uppercase text-center mb-2">Decrypted Objective</Text>
            <Text className="text-xl text-white font-bold italic text-center">"{objective?.label}"</Text>
          </View>

          {/* INPUT */}
          <TextInput
            value={userInput}
            onChangeText={setUserInput}
            placeholder="TYPE IN POLISH..."
            placeholderTextColor="#064e3b"
            className={`bg-black/60 border-2 rounded-2xl p-5 text-2xl text-center font-bold text-white mb-4 ${feedback.status === 'error' ? 'border-red-500' : 'border-emerald-900/50'}`}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* POLISH CHARS */}
          <View className="flex-row flex-wrap justify-center gap-2 mb-6">
            {['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'].map(char => (
              <TouchableOpacity
                key={char}
                onPress={() => setUserInput(prev => prev + char)}
                className="w-10 h-10 bg-emerald-950/40 border border-emerald-900/50 rounded-lg items-center justify-center"
              >
                <Text className="text-emerald-500 font-bold">{char}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* FEEDBACK */}
          {feedback.message ? (
            <View className={`p-3 rounded-xl mb-6 border ${feedback.status === 'error' ? 'bg-red-950/50 border-red-900' : 'bg-emerald-500 border-emerald-400'}`}>
              <Text className={`text-center font-black uppercase text-[10px] ${feedback.status === 'error' ? 'text-red-500' : 'text-black'}`}>
                {feedback.message}
              </Text>
            </View>
          ) : null}

          {/* ACTION BUTTONS */}
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={handleVerify}
              className="flex-1 bg-emerald-500 py-4 rounded-xl items-center shadow-lg shadow-emerald-500/20"
            >
              <Text className="text-black font-black uppercase tracking-widest text-xs">Execute Protocol</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowHint(!showHint)}
              className={`px-4 py-4 rounded-xl border-2 ${showHint ? 'bg-blue-600 border-blue-400' : 'border-emerald-900'}`}
            >
              <Info size={18} color={showHint ? "white" : "#064e3b"} />
            </TouchableOpacity>
          </View>

          {/* HINT AREA */}
          {showHint && (
            <View className="mt-4 p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl">
              <Text className="text-blue-400 font-black text-[8px] uppercase mb-2">Tactical Intel</Text>
              <Text className="text-blue-100 text-xs italic">{objective?.hint}</Text>
            </View>
          )}
        </Animated.View>

        {/* MISSION LOG */}
        {missionLog.length > 0 && (
          <View className="mt-6 p-4 bg-black/40 border border-emerald-900/20 rounded-2xl">
            <Text className="text-[8px] font-black text-emerald-800 uppercase mb-3">Operation History</Text>
            {missionLog.map((log, i) => (
              <View key={i} className="flex-row justify-between py-2 border-b border-emerald-900/10">
                <Text className="text-white text-[10px] font-bold">{log.correct}</Text>
                <Text className="text-emerald-500 text-[10px] font-black">+{log.xp} XP</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ABORT MODAL */}
      <Modal visible={showTerminateModal} transparent animationType="fade">
        <View className="flex-1 bg-black/90 justify-center p-6">
          <View className="bg-[#0a0a0a] border-2 border-red-900/50 rounded-3xl p-8 items-center">
            <ShieldAlert size={48} color="#ef4444" />
            <Text className="text-white font-black text-xl uppercase mt-4 mb-2">Terminate Mission?</Text>
            <Text className="text-emerald-800 text-center text-xs mb-8">This will reset mission progress. Points earned in this session will be lost.</Text>
            
            <TouchableOpacity 
              onPress={() => { setCurrentStep(0); setShowTerminateModal(false); }}
              className="w-full bg-red-600 py-4 rounded-xl items-center mb-3"
            >
              <Text className="text-white font-black uppercase text-xs">Confirm Abortion</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTerminateModal(false)}>
              <Text className="text-emerald-500 font-black uppercase text-[10px] py-2">Resume Operation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}