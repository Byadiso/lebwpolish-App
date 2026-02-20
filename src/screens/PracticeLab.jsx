import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, Dimensions, StyleSheet, Animated 
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, updateDoc, increment } from "firebase/firestore";
import drillData from "../data/drills.json";

const { width } = Dimensions.get('window');
const POLISH_CHARS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

export default function PracticeLab({ navigation }) {
  const { user, profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle, checking, success, error
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const xpTranslateY = useRef(new Animated.Value(0)).current;

  const XP_PER_LEVEL = 100;
  const drills = drillData;
  const xp = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const currentDrill = drills[currentIndex];

  const getRank = () => {
    if (xp < 100) return "Novice";
    if (xp < 300) return "Student";
    if (xp < 600) return "Speaker";
    return "Polyglot";
  };

  const speak = (text, speed = 0.8) => {
    Speech.stop();
    Speech.speak(text, { language: 'pl-PL', rate: speed });
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const triggerXpPopup = () => {
    xpOpacity.setValue(1);
    xpTranslateY.setValue(0);
    Animated.timing(xpTranslateY, {
      toValue: -100,
      duration: 1000,
      useNativeDriver: true
    }).start(() => xpOpacity.setValue(0));
  };

  const handleVerify = async () => {
    if (status === 'checking' || !userInput) return;
    setStatus("checking");
    const normalize = (str) => str.toLowerCase().replace(/[.,?!]/g, "").trim();
    const userRef = doc(db, "pending_users", user.uid);

    setTimeout(async () => {
      if (normalize(userInput) === normalize(currentDrill.polish)) {
        const earnedXp = showHint ? 5 : 20;
        setStatus("success");
        triggerXpPopup();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (user) {
          await updateDoc(userRef, {
            xp: increment(earnedXp),
            streak: increment(1)
          });
        }
        speak("Świetnie!", 1.1);
      } else {
        setStatus("error");
        triggerShake();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        speak("Spróbuj ponownie", 0.8);
        if (user) await updateDoc(userRef, { streak: 0 });
      }
    }, 600);
  };

  const nextLevel = () => {
    if (currentIndex + 1 < drills.length) {
      setStatus("idle");
      setUserInput("");
      setShowHint(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#020617]">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* HUD */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-slate-900 border border-white/10 p-3 rounded-2xl">
            <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current Rank</Text>
            <Text className="text-sm font-black text-red-500">{getRank()}</Text>
            <View className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <View style={{ width: `${xpInCurrentLevel}%` }} className="h-full bg-red-600" />
            </View>
          </View>
          <View className="flex-1 bg-slate-900 border border-white/10 p-3 rounded-2xl items-end">
            <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Streak</Text>
            <View className="flex-row items-center">
              <Text className="text-xl font-black italic text-white mr-1">{streak}</Text>
              <Text>🔥</Text>
            </View>
          </View>
        </View>

        {!isFinished ? (
          <View>
            {/* PROGRESS DOTS */}
            <View className="flex-row justify-center gap-2 mb-6">
              {drills.slice(0, 10).map((_, i) => (
                <View 
                  key={i} 
                  className={`h-1 rounded-full ${
                    i === currentIndex ? "w-8 bg-red-600" : i < currentIndex ? "w-2 bg-emerald-500" : "w-2 bg-slate-800"
                  }`} 
                />
              ))}
            </View>

            {/* MAIN CARD */}
            <Animated.View 
              style={[
                { transform: [{ translateX: shakeAnimation }] },
                status === 'success' ? styles.cardSuccess : status === 'error' ? styles.cardError : styles.cardIdle
              ]}
              className="rounded-[40px] p-6 border-t border-white/10 shadow-2xl"
            >
              <View className="items-center gap-6">
                <View className="flex-row items-center gap-6">
                  <TouchableOpacity 
                    onPress={() => speak(currentDrill.polish)}
                    className="w-12 h-12 bg-slate-800 rounded-xl items-center justify-center"
                  >
                    <Text className="text-xl">🔊</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="w-20 h-20 rounded-full bg-red-600 items-center justify-center shadow-xl"
                  >
                    <Text className="text-3xl">🎙️</Text>
                  </TouchableOpacity>
                </View>

                <View className="w-full relative py-4">
                  <TextInput
                    value={userInput}
                    onChangeText={(text) => { setUserInput(text); if(status !== 'idle') setStatus('idle'); }}
                    className="w-full text-white text-center text-2xl font-black uppercase tracking-tight"
                    placeholder="Type translation..."
                    placeholderTextColor="#1e293b"
                    autoFocus
                  />
                  
                  <Animated.Text 
                    style={{ 
                      opacity: xpOpacity, 
                      transform: [{ translateY: xpTranslateY }],
                      position: 'absolute', top: -20, alignSelf: 'center'
                    }}
                    className="text-2xl font-black text-emerald-400"
                  >
                    +{showHint ? '5' : '20'} XP
                  </Animated.Text>
                </View>

                {/* SPECIAL CHARS */}
                <View className="flex-row flex-wrap justify-center gap-2">
                  {POLISH_CHARS.map(char => (
                    <TouchableOpacity
                      key={char}
                      onPress={() => setUserInput(prev => prev + char)}
                      className="w-12 h-12 bg-slate-800 border border-white/5 rounded-lg items-center justify-center"
                    >
                      <Text className="font-bold text-lg text-red-500">{char}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  onPress={status === 'success' ? nextLevel : handleVerify}
                  disabled={!userInput && status !== 'success'}
                  className={`w-full py-5 rounded-2xl items-center ${
                    status === 'success' ? 'bg-emerald-500' : 'bg-white opacity-100'
                  }`}
                  style={!userInput && status !== 'success' ? { opacity: 0.2 } : {}}
                >
                  <Text className={`font-black uppercase tracking-widest ${status === 'success' ? 'text-white' : 'text-black'}`}>
                    {status === 'checking' ? 'Checking...' : status === 'success' ? 'Next Mission →' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* PROMPT SECTION */}
            <View className="items-center mt-8">
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">English Task</Text>
              <View className="h-16 justify-center px-4">
                {!showHint ? (
                  <Text className="text-xl font-black italic text-white text-center leading-tight">
                    "{currentDrill.english}"
                  </Text>
                ) : (
                  <View className="bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/30">
                    <Text className="text-emerald-400 font-black text-xl tracking-tighter">
                      {currentDrill.polish}
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-row gap-12 mt-4">
                <TouchableOpacity onPress={() => speak(currentDrill.polish, 0.4)} className="items-center">
                  <Text className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Slow</Text>
                  <View className="h-1 w-4 bg-slate-800 rounded-full mt-1" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowHint(true)} className="items-center">
                  <Text className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Hint</Text>
                  <View className="h-1 w-4 bg-slate-800 rounded-full mt-1" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className="bg-slate-900 p-8 rounded-[40px] border border-emerald-500/50 items-center">
             <Text className="text-4xl font-black text-white mb-6 uppercase italic">Cleared</Text>
             <TouchableOpacity 
               onPress={() => { setCurrentIndex(0); setIsFinished(false); }}
               className="w-full py-5 bg-white rounded-2xl items-center"
             >
               <Text className="text-black font-black uppercase tracking-widest">Restart Session</Text>
             </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardIdle: { backgroundColor: 'rgba(15, 23, 42, 0.9)' },
  cardSuccess: { backgroundColor: 'rgba(6, 78, 59, 0.4)', borderColor: '#10b981', borderWidth: 1 },
  cardError: { backgroundColor: 'rgba(159, 18, 57, 0.4)', borderColor: '#f43f5e', borderWidth: 1 },
});