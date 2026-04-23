/**
 * AppNavigator.js — Configuração completa de navegação do aplicativo.
 *
 * Optei por usar dois tipos de navigator combinados:
 *
 *  1. Bottom Tab Navigator — as três abas principais na barra inferior
 *     (Dashboard, Hoje, Configurações)
 *
 *  2. Stack Navigator — dentro de cada aba, para navegar em profundidade
 *     (ex: Hoje → Detalhe do hábito → Editar hábito)
 *
 * Por que essa combinação?
 * O Tab Navigator sozinho não permite navegar para telas secundárias como
 * "Detalhe do hábito" sem perder as abas. Ao colocar um Stack dentro de
 * cada aba, consigo ter navegação em pilha preservando a barra de abas.
 *
 * Estrutura de navegação:
 *
 *  NavigationContainer
 *  └── AuthStack (quando não logado)
 *      ├── Login
 *      └── Register
 *  └── MainTabNavigator (quando logado)
 *      ├── DashboardStack
 *      │   └── DashboardMain
 *      ├── HomeStack
 *      │   ├── Home
 *      │   ├── AddHabit
 *      │   └── HabitDetail
 *      └── SettingsStack
 *          └── SettingsMain
 *
 * O AppNavigator decide automaticamente qual fluxo mostrar baseado no
 * estado do usuário (user !== null → logado).
 *
 * Bibliotecas utilizadas:
 *  - @react-navigation/native — NavigationContainer
 *  - @react-navigation/native-stack — Stack Navigator
 *  - @react-navigation/bottom-tabs — Tab Navigator
 */
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';

// Importação de todas as telas do aplicativo
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';         // conteúdo: criação de hábito
import TaskDetailScreen from '../screens/TaskDetailScreen';   // conteúdo: detalhe do hábito
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack da aba Dashboard — tela única por enquanto, sem sub-navegação
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

// Stack da aba Hoje — inclui AddHabit e HabitDetail como telas filhas
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
      {/* Tela raiz da aba */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Meus Hábitos' }}
      />
      {/* Navegado pelo FAB da HomeScreen */}
      <Stack.Screen
        name="AddHabit"
        component={AddTaskScreen}
        options={{ title: 'Novo Hábito' }}
      />
      {/* Navegado ao tocar em um HabitCard */}
      <Stack.Screen
        name="HabitDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detalhes do Hábito' }}
      />
    </Stack.Navigator>
  );
}

// Stack da aba Configurações — tela única
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

// Tab Navigator principal — exibido após o login
function MainTabNavigator() {
  const { theme } = useApp();
  const colors = getTheme(theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Ícone de cada aba muda conforme o foco (outline = inativo, sólido = ativo)
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

// Stack de autenticação — exibido quando o usuário não está logado
// Não tem header pois as telas de login/cadastro gerenciam seu próprio layout
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

/**
 * Componente raiz de navegação.
 *
 * Enquanto o app está carregando os dados do AsyncStorage, mostra um spinner.
 * Após carregar, decide qual fluxo exibir baseado no estado do usuário:
 *  - user !== null → usuário logado → MainTabNavigator
 *  - user === null → não logado → AuthStack
 */
export default function AppNavigator() {
  const { user, loading, theme } = useApp();
  const colors = getTheme(theme);

  // Tela de splash/loading enquanto carrega os dados persistidos
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* A troca entre AuthStack e MainTabNavigator acontece automaticamente
          quando o estado 'user' muda no AppContext */}
      {user ? <MainTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
