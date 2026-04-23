/**
 * AppNavigator.js — Configuração completa de navegação.
 *
 * Estrutura:
 *  AuthStack      → Login, Register (para usuários não autenticados)
 *  MainTabNavigator → Abas inferiores com:
 *    HomeStack    → Home → AddTask → TaskDetail (Stack Navigator)
 *    SettingsStack → Settings (Stack Navigator)
 *
 * O navegador raiz troca automaticamente entre AuthStack e MainTabNavigator
 * com base no estado do usuário (user !== null).
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack de navegação para a aba "Início"
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
        options={{ title: 'Minhas Tarefas' }}
      />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{ title: 'Nova Tarefa' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detalhes da Tarefa' }}
      />
    </Stack.Navigator>
  );
}

// Stack de navegação para a aba "Configurações"
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

// Navegador de abas inferiores (exibido após o login)
function MainTabNavigator() {
  const { theme } = useApp();
  const colors = getTheme(theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Ícone de cada aba varia conforme o foco
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Início: focused ? 'home' : 'home-outline',
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
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerShown: false, // cada stack filho cuida do próprio header
      })}
    >
      <Tab.Screen name="Início" component={HomeStack} />
      <Tab.Screen name="Configurações" component={SettingsStack} />
    </Tab.Navigator>
  );
}

// Stack de autenticação (Login e Cadastro)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Navegador raiz: exibe AuthStack ou MainTabNavigator conforme o estado do login
export default function AppNavigator() {
  const { user, loading, theme } = useApp();
  const colors = getTheme(theme);

  // Enquanto o AsyncStorage carrega os dados, exibe um indicador de carregamento
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
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
