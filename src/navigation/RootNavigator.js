import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icons
import { Home as HomeIcon, Brain, PenTool, Layout } from 'lucide-react-native';

// Components
import Navbar from '../components/Navbar';

// Screens
import Home from '../screens/Home';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import EnrollmentGuard from '../components/EnrollmentGuard';
import GrammarGauntlet from '../screens/GrammarGauntlet';
import PolishWarForge from '../screens/PolishWarForge';
import ScenarioEngine from '../screens/ScenarioEngine';
import VocabularyVault from '../screens/VocabularyVault';
import LearningSpace from '../screens/LearningSpace';
import Profile from '../screens/Profile';
import PracticeLab from '../screens/PracticeLab';
import LirycznaSymfonia from '../screens/LirycznaSymfonia';
import AdminDashboard from '../screens/AdminDashboard';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- TAB NAVIGATOR ---
function TabNavigator() {
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = Platform.OS === 'android'
    ? 65
    : Math.max(60 + insets.bottom, 80);

  const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'android'
    ? 8
    : Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <Navbar />, // ✅ Navbar shown on all tab screens
        headerShown: true,        // ✅ Must be true for Navbar to appear
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#020617',
          borderTopColor: 'rgba(255,255,255,0.05)',
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT,
          paddingBottom: TAB_BAR_PADDING_BOTTOM,
          paddingTop: 8,
          elevation: 10,
          shadowOpacity: 0.1,
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontWeight: '900',
          fontSize: 10,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tab.Screen
        name="TabHome"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="GrammarTab"
        component={GrammarGauntlet}
        options={{
          tabBarLabel: 'Grammar',
          tabBarIcon: ({ color }) => <Brain size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="WritingTab"
        component={ScenarioEngine}
        options={{
          tabBarLabel: 'Writing',
          tabBarIcon: ({ color }) => <PenTool size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="SpaceTab"
        component={LearningSpace}
        options={{
          tabBarLabel: 'Space',
          tabBarIcon: ({ color }) => <Layout size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// --- MAIN STACK ---
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <Navbar />, // ✅ Navbar for deep stack screens
        headerStyle: { backgroundColor: '#020617' },
        contentStyle: { backgroundColor: '#020617' },
        animation: 'fade_from_bottom',
      }}
    >
      {/* ✅ MainTabs manages its own Navbar via TabNavigator */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Auth screens — no header */}
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
      <Stack.Screen name="Guest" component={EnrollmentGuard} options={{ headerShown: true }} />

      {/* Deep screens — show Navbar */}
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true }} />
      <Stack.Screen name="Practice" component={PracticeLab} options={{ headerShown: true }} />
      <Stack.Screen name="PolishMusic" component={LirycznaSymfonia} options={{ headerShown: true }} />
      <Stack.Screen name="Admin" component={AdminDashboard} options={{ headerShown: true }} />
      <Stack.Screen name="vocabularyvault" component={VocabularyVault} options={{ headerShown: true }} />
      <Stack.Screen name="polish-simplified" component={PolishWarForge} options={{ headerShown: true }} />
      <Stack.Screen name="Grammar" component={GrammarGauntlet} options={{ headerShown: true }} />
      <Stack.Screen name="shadow-protocol" component={ScenarioEngine} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}

// --- ROOT ---
export default function RootNavigator() {
  return <MainStack />;
}