import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, 
  ActivityIndicator, Modal, Dimensions, StyleSheet 
} from 'react-native';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function LirycznaSymfonia() {
  const playlist = ["sanah_01.json", "sanah_02.json", "sanah_03.json"];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [song, setSong] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  // Load Song Data
  useEffect(() => {
    // In React Native, you'd typically bundle these or fetch from an API
    // Example fetch logic:
    setSong(null);
    setSelectedWord(null);
    // Mocking the fetch for the structure
    const loadMockData = async () => {
        // Replace with actual fetch or require()
        // const data = await fetch(`your-api/songs/${playlist[currentIndex]}`).then(res => res.json());
        // setSong(data);
    };
    loadMockData();
  }, [currentIndex]);

  // Handle Audio Lifecycle
  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  async function togglePlay() {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) handleNext();
      });
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  }

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % playlist.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);

  const selectSong = (index) => {
    setCurrentIndex(index);
    setIsMenuOpen(false);
    if (sound) sound.unloadAsync();
    setSound(null);
    setIsPlaying(false);
  };

  if (!song) return (
    <View className="flex-1 bg-[#020617] items-center justify-center">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#020617]">
      {/* 📂 SONG LIBRARY MODAL */}
      <Modal visible={isMenuOpen} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-900 h-[80%] rounded-t-[40px] p-6 border-t border-white/10">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-xl font-black italic text-white uppercase">Library</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)} className="bg-white/10 px-4 py-2 rounded-xl">
                <Text className="text-slate-400 font-bold text-xs uppercase">Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {playlist.map((fileName, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => selectSong(idx)}
                  className={`w-full p-5 rounded-2xl mb-3 border ${
                    currentIndex === idx ? "bg-indigo-600 border-indigo-400" : "bg-white/5 border-transparent"
                  }`}
                >
                  <Text className={`text-[9px] font-black uppercase mb-1 ${currentIndex === idx ? "text-indigo-200" : "text-indigo-500"}`}>
                    Track 0{idx + 1}
                  </Text>
                  <Text className="font-bold text-base text-white capitalize">
                    {fileName.replace('.json', '').replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🎵 PLAYER HEADER */}
      <View className="px-6 py-4 border-b border-white/5 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => setIsMenuOpen(true)}
          className="w-10 h-10 rounded-lg bg-indigo-500/10 items-center justify-center border border-indigo-500/20"
        >
          <View className="w-4 h-0.5 bg-indigo-500 mb-1 rounded-full" />
          <View className="w-4 h-0.5 bg-indigo-500 rounded-full" />
        </TouchableOpacity>

        <View className="flex-row items-center bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <TouchableOpacity 
            onPress={togglePlay}
            className="w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center mr-3"
          >
            <Text className="text-white font-black">{isPlaying ? "II" : "▶"}</Text>
          </TouchableOpacity>
          <View className="pr-4">
            <Text className="text-[10px] font-bold text-slate-100" numberOfLines={1}>{song.title}</Text>
            <Text className="text-[7px] font-black uppercase text-indigo-400">{song.artist}</Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity onPress={handlePrev}><Text className="text-slate-400">⏮</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleNext}><Text className="text-slate-400">⏭</Text></TouchableOpacity>
        </View>
      </View>

      {/* 📖 LYRICS CONTENT */}
      <ScrollView className="flex-1 px-6 pt-8">
        {song.fullLyrics.map((line, lineIdx) => (
          <View key={lineIdx} className="mb-12 border-l-2 border-white/5 pl-4">
            <View className="flex-row flex-wrap gap-2 mb-2">
              {line.words.map((word, wIdx) => (
                <TouchableOpacity key={wIdx} onPress={() => setSelectedWord(word)}>
                  <Text className={`text-3xl font-black uppercase tracking-tighter ${
                    selectedWord?.pl === word.pl ? "text-indigo-500" : "text-slate-200"
                  }`}>
                    {word.pl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-sm font-medium text-slate-500 italic">
              {line.translation}
            </Text>
          </View>
        ))}
        <View className="h-40" />
      </ScrollView>

      {/* 📱 MOBILE BOTTOM SHEET (VOCABULARY) */}
      {selectedWord && (
        <View style={styles.sheetBackdrop}>
            <TouchableOpacity style={{flex: 1}} onPress={() => setSelectedWord(null)} />
            <View className="bg-slate-900 rounded-t-[40px] p-8 border-t border-white/10 shadow-2xl">
                <View className="w-12 h-1.5 bg-white/10 rounded-full self-center mb-6" />
                <View className="flex-row justify-between items-start mb-6">
                    <View>
                        <Text className="text-[8px] font-black uppercase text-indigo-500 mb-1">Polish</Text>
                        <Text className="text-4xl font-black italic text-white uppercase">{selectedWord.pl}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-[8px] font-black uppercase text-indigo-500 mb-1">Type</Text>
                        <Text className="text-xs font-bold text-slate-300 uppercase">{selectedWord.type}</Text>
                    </View>
                </View>
                <View className="mb-10">
                    <Text className="text-[8px] font-black uppercase text-indigo-500 mb-1">English</Text>
                    <Text className="text-2xl font-bold text-indigo-100">{selectedWord.en}</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => setSelectedWord(null)}
                    className="w-full py-5 bg-indigo-600 rounded-2xl items-center"
                >
                    <Text className="text-white font-black uppercase tracking-widest text-xs">Got it</Text>
                </TouchableOpacity>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'flex-end'
  }
});