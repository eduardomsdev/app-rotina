/**
 * AppNavigator.js — Configuração completa de navegação (atualizada para o habit tracker).
 *
 * Estrutura:
 *  AuthStack         → Login, Register (sem header)
 *  MainTabNavigator  → Três abas:
 *    DashboardStack  → DashboardScreen
 *    HomeStack       → HomeScreen → AddHabit → HabitDetail
 *    SettingsStack   → SettingsScreen
 *
 * Por que dois navigators (Stack + Tab)?
 *  - Tab Navigator cuida das abas principais (Dashboard, Hoje, Config)
 *  - Stack Navigator dentro de cada aba cuida da navegação em profundidade
 *    (ex: Hoje → Detalhe do hábito → Editar hábito)
 */
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';     // conteúdo: AddHabit
import TaskDetailScreen from '../screens/TaskDetailScreen'; // conteúdo: HabitDetail
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack da aba "Dashboard" (tela única por ora — sem sub-navegação)
function DashboardStack() {
  const { theme } = useApp();
  const colors = getTheme(theme);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 17 },
      }}
    >
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
}

// Stack da aba "Hoje" — inclui AddHabit e HabitDetail
function HomeStack() {
  const { theme } = useApp();
  const colors = getTheme(theme);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 17 },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Meus Hábitos' }}
      />
      <Stack.Screen
        name="AddHabit"
        component={AddTaskScreen}
        options={{ title: 'Novo Hábito' }}
      />
      <Stack.Screen
        name="HabitDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detalhes do Hábito' }}
      />
    </Stack.Navigator>
  );
}

// Stack da aba "Configurações"
function SettingsStack() {
  const { theme } = useApp();
  const colors = getTheme(theme);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 17 },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator principal (pós-login)
function MainTabNavigator() {
  const { theme } = useApp();
  const colors = getTheme(theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Ícone muda conforme o foco da aba
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Hoje: focused ? 'today' : 'today-outline',
            Configurações: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: 6,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false, // cada Stack filho gerencia seu próprio header
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Hoje" component={HomeStack} />
      <Tab.Screen name="Configurações" component={SettingsStack} />
    </Tab.Navigator>
  );
}

// Stack de autenticação (sem header, telas controlam o layout)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Navegador raiz: exibe AuthStack ou App conforme o estado de login
export default function AppNavigator() {
  const { user, loading, theme } = useApp();
  const colors = getTheme(theme);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
