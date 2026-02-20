import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { READING_VAULT } from '../data/readingVault';
import { ArrowRight, Star, X, Lightbulb, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PolishReadingEngine() {
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showGrammarNote, setShowGrammarNote] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const activeData = READING_VAULT.find((t) => t.id === selectedTextId);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleSelect = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    activeData?.questions.forEach((q) => {
      if (answers[q.id] === q.correct) score++;
    });
    return score;
  };

  const renderInteractiveText = (text, glossary = {}) => {
    const words = text.split(/(\s+)/);
    return (
      <View className="flex-row flex-wrap">
        {words.map((part, i) => {
          const cleanWord = part.toLowerCase().replace(/[.,„”()]/g, "").trim();
          const hasDefinition = glossary && glossary[cleanWord];
          const isSelected = activeTooltip === i;

          if (cleanWord.length > 0) {
            return (
              <View key={i} className="relative z-10">
                <TouchableOpacity
                  onPress={() => setActiveTooltip(isSelected ? null : i)}
                  className={`px-0.5 rounded ${hasDefinition ? 'border-b-2 border-indigo-500' : ''}`}
                >
                  <Text className={`text-xl font-serif leading-9 ${
                    hasDefinition ? 'text-indigo-400 font-bold' : 'text-slate-100'
                  }`}>
                    {part}
                  </Text>
                </TouchableOpacity>

                {isSelected && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-indigo-600 p-3 rounded-xl shadow-2xl z-50"
                  >
                    <Text className="text-[10px] font-black text-white uppercase mb-1 border-b border-white/20 pb-1">
                      {hasDefinition ? "Znaczenie" : "Słowo"}
                    </Text>
                    <Text className="text-white text-xs leading-tight font-bold">
                      {hasDefinition || "Kliknięto słowo (Brak w słowniku)"}
                    </Text>
                    <View className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-600" />
                  </MotiView>
                )}
              </View>
            );
          }
          return <Text key={i} className="text-xl leading-9"> </Text>;
        })}
      </View>
    );
  };

  // --- MENU VIEW ---
  if (!selectedTextId) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <ScrollView className="px-6 py-8">
          <View className="items-center mb-12">
            <Text className="text-white text-4xl font-black italic tracking-tighter uppercase text-center">
              B1 READING <Text className="text-indigo-500 font-serif lowercase">Codex</Text>
            </Text>
            <View className="h-1.5 w-24 bg-indigo-600 rounded-full mt-4 shadow-xl" />
          </View>

          <View className="gap-6 pb-20">
            {READING_VAULT.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedTextId(item.id)}
                className="bg-slate-900 border border-white/10 p-6 rounded-[2.5rem] overflow-hidden"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <Text className="text-5xl">{item.icon}</Text>
                  <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                    <Star 
                      size={28} 
                      color={favorites.includes(item.id) ? "#6366f1" : "#1e293b"} 
                      fill={favorites.includes(item.id) ? "#6366f1" : "transparent"}
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-indigo-500 font-black uppercase tracking-widest text-[10px] mb-1">
                  {item.category}
                </Text>
                <Text className="text-white text-2xl font-bold mb-4">{item.title}</Text>
                <View className="flex-row items-center">
                  <Text className="text-slate-500 font-black text-[10px] uppercase mr-2">Open Analysis</Text>
                  <ArrowRight size={14} color="#64748b" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- SIMULATOR VIEW ---
  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <View className="px-5 py-4 border-b border-white/10 flex-row justify-between items-center bg-slate-950">
          <View>
            <Text className="text-white font-black italic uppercase text-lg">
              B1 <Text className="text-indigo-500 font-serif">Simulator</Text>
            </Text>
            <Text className="text-[8px] text-slate-500 font-black uppercase tracking-widest" numberOfLines={1}>
              {activeData.title}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => { setSelectedTextId(null); setShowResults(false); setIsStarted(false); setAnswers({}); }}
            className="bg-slate-900 px-4 py-2 rounded-full border border-white/10"
          >
            <Text className="text-white text-[10px] font-black uppercase">Exit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {!isStarted ? (
            <MotiView 
              from={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 bg-slate-900 p-10 rounded-[3rem] border border-white/5 items-center"
            >
              <Text className="text-8xl mb-6">{activeData.icon}</Text>
              <Text className="text-white text-3xl font-black uppercase text-center mb-4">{activeData.title}</Text>
              <Text className="text-slate-400 text-center italic mb-10 leading-6 px-4">
                "Deep analysis mode engaged. Verify facts, identify linguistic traps, and master the B1 lexicon."
              </Text>
              <TouchableOpacity
                onPress={() => setIsStarted(true)}
                className="bg-indigo-600 px-10 py-5 rounded-2xl shadow-2xl active:scale-95 w-full"
              >
                <Text className="text-white text-center font-black uppercase tracking-widest">Start Analysis</Text>
              </TouchableOpacity>
            </MotiView>
          ) : (
            <View className="py-6 gap-8 pb-32">
              {/* INTERACTIVE TEXT */}
              <MotiView 
                from={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="bg-slate-900 p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl"
              >
                {renderInteractiveText(activeData.text, activeData.glossary)}
                
                <View className="mt-8 pt-6 border-t border-white/5 gap-4">
                  <View className="flex-row items-center">
                    <Lightbulb size={16} color="#818cf8" />
                    <Text className="text-indigo-400 text-[10px] font-bold uppercase ml-2 italic">
                      Tap terms for B1 meaning
                    </Text>
                  </View>

                  {activeData.grammarNote && (
                    <TouchableOpacity 
                      onPress={() => setShowGrammarNote(!showGrammarNote)}
                      className="bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/30 flex-row justify-between items-center"
                    >
                      <Text className="text-indigo-300 text-[10px] font-black uppercase">
                        {showGrammarNote ? "Hide Grammar Insight" : "View Grammar Insight"}
                      </Text>
                      <Info size={16} color="#818cf8" />
                    </TouchableOpacity>
                  )}

                  {showGrammarNote && (
                    <MotiView 
                      from={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-indigo-950/40 p-5 rounded-2xl"
                    >
                      <Text className="text-indigo-100 text-sm leading-6">
                        {activeData.grammarNote}
                      </Text>
                    </MotiView>
                  )}
                </View>
              </MotiView>

              {/* QUESTIONS */}
              <View className="gap-6">
                {activeData.questions.map((q, idx) => (
                  <View key={q.id} className="bg-slate-900 p-6 rounded-[2rem] border border-white/5">
                    <Text className="text-white text-lg font-bold mb-6">
                      <Text className="text-indigo-500 opacity-50">0{idx + 1}. </Text>{q.q}
                    </Text>
                    <View className="gap-3">
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt;
                        const isCorrect = opt === q.correct;
                        
                        let bgColor = "bg-slate-800";
                        let borderColor = "border-transparent";
                        let textColor = "text-slate-400";

                        if (showResults) {
                          if (isCorrect) {
                            bgColor = "bg-emerald-500/10"; borderColor = "border-emerald-500"; textColor = "text-emerald-400";
                          } else if (isSelected) {
                            bgColor = "bg-rose-500/10"; borderColor = "border-rose-500"; textColor = "text-rose-400";
                          } else {
                            bgColor = "bg-slate-900"; textColor = "text-slate-600 opacity-50";
                          }
                        } else if (isSelected) {
                          bgColor = "bg-indigo-600"; borderColor = "border-indigo-400"; textColor = "text-white";
                        }

                        return (
                          <TouchableOpacity
                            key={opt}
                            disabled={showResults}
                            onPress={() => handleSelect(q.id, opt)}
                            className={`${bgColor} ${borderColor} border-2 p-5 rounded-2xl`}
                          >
                            <Text className={`${textColor} text-center font-black uppercase text-[10px] tracking-widest`}>
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>

              {/* ACTION BUTTON */}
              {!showResults ? (
                <TouchableOpacity
                  onPress={() => setShowResults(true)}
                  disabled={Object.keys(answers).length < activeData.questions.length}
                  className={`py-6 rounded-full shadow-2xl ${
                    Object.keys(answers).length < activeData.questions.length ? 'bg-slate-800' : 'bg-white'
                  }`}
                >
                  <Text className="text-slate-950 text-center font-black uppercase tracking-[0.3em] text-xs">
                    Submit Analysis
                  </Text>
                </TouchableOpacity>
              ) : (
                <MotiView from={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-indigo-600 p-10 rounded-[3rem] items-center">
                  <Text className="text-white text-3xl font-black uppercase italic text-center mb-2">
                    Score: {calculateScore()} / {activeData.questions.length}
                  </Text>
                  <Text className="text-indigo-200 font-black uppercase text-[10px] tracking-widest mb-8">Module Competency Achieved</Text>
                  <TouchableOpacity
                    onPress={() => { setIsStarted(false); setShowResults(false); setAnswers({}); setSelectedTextId(null); }}
                    className="bg-white/10 px-8 py-4 rounded-full border border-white/20"
                  >
                    <Text className="text-white font-black uppercase text-[10px]">Return to Codex</Text>
                  </TouchableOpacity>
                </MotiView>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}