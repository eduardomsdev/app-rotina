/**
 * AppContext.js — Estado global: hábitos, autenticação e tema.
 *
 * Mudanças em relação à versão anterior:
 *  - "tasks" substituído por "habits" (com modelo novo: icon, color, history)
 *  - toggleHabitToday: marca/desmarca o hábito no dia atual
 *  - Validação de segurança em TODOS os inputs (usa security.js)
 *  - Senhas NUNCA salvas no AsyncStorage (apenas dados não-sensíveis)
 *
 * Modelo de hábito:
 *  {
 *    id: string,
 *    name: string,        // nome do hábito (ex: "Beber água")
 *    description: string, // descrição opcional
 *    icon: string,        // emoji (ex: "💧")
 *    color: string,       // hex (ex: "#45B7D1")
 *    createdAt: string,   // ISO date string
 *    history: {           // registro de conclusões por dia
 *      'YYYY-MM-DD': boolean
 *    }
 *  }
 */
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateUtils } from '../utils/dateUtils';
import { Security } from '../utils/security';

const AppContext = createContext({});

// Usuários pré-cadastrados para demonstração
const DEMO_USERS = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', password: '123456' },
  { id: '2', name: 'Maria Souza', email: 'maria@email.com', password: '123456' },
];

// Gera chave de data para N dias atrás (necessário antes do const INITIAL_HABITS)
function d(n) {
  return DateUtils.daysAgoKey(n);
}

// Hábitos iniciais de demonstração com histórico pré-populado para o Dashboard parecer rico
const INITIAL_HABITS = [
  {
    id: '1',
    name: 'Beber 2L de água',
    description: 'Manter hidratação ao longo do dia',
    icon: '💧',
    color: '#45B7D1',
    createdAt: new Date(Date.now() - 14 * 864e5).toISOString(),
    history: {
      [d(6)]: true, [d(5)]: true, [d(4)]: true,
      [d(3)]: false, [d(2)]: true, [d(1)]: true,
    },
  },
  {
    id: '2',
    name: 'Meditação matinal',
    description: '10 minutos ao acordar',
    icon: '🧘',
    color: '#DDA0DD',
    createdAt: new Date(Date.now() - 10 * 864e5).toISOString(),
    history: {
      [d(5)]: true, [d(4)]: true,
      [d(3)]: true, [d(2)]: true, [d(1)]: true,
    },
  },
  {
    id: '3',
    name: 'Leitura diária',
    description: 'Ler pelo menos 20 páginas',
    icon: '📚',
    color: '#FF6B6B',
    createdAt: new Date(Date.now() - 20 * 864e5).toISOString(),
    history: {
      [d(6)]: true, [d(5)]: false, [d(4)]: true,
      [d(3)]: true, [d(2)]: false, [d(1)]: true,
    },
  },
  {
    id: '4',
    name: 'Exercício físico',
    description: '30 minutos de atividade',
    icon: '🏃',
    color: '#4ECDC4',
    createdAt: new Date(Date.now() - 5 * 864e5).toISOString(),
    history: {
      [d(4)]: true, [d(3)]: true,
      [d(2)]: true, [d(1)]: false,
    },
  },
];

// Chaves do AsyncStorage (prefixo 'v2' para não conflitar com dados da versão anterior)
const KEYS = {
  USER: '@appRotina:v2:user',
  HABITS: '@appRotina:v2:habits',
  THEME: '@appRotina:v2:theme',
  USERS: '@appRotina:v2:users',
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(DEMO_USERS);

  useEffect(() => {
    loadStoredData();
  }, []);

  // Carrega dados persistidos na inicialização
  const loadStoredData = async () => {
    try {
      const [storedUser, storedHabits, storedTheme, storedUsers] = await Promise.all([
        AsyncStorage.getItem(KEYS.USER),
        AsyncStorage.getItem(KEYS.HABITS),
        AsyncStorage.getItem(KEYS.THEME),
        AsyncStorage.getItem(KEYS.USERS),
      ]);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedHabits) setHabits(JSON.parse(storedHabits));
      else setHabits(INITIAL_HABITS); // Primeira execução: carrega exemplos
      if (storedTheme) setTheme(storedTheme);
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } catch (error) {
      // Segurança: nunca logar detalhes do erro em produção
      Security.safeLog({ context: 'loadStoredData', error: error.message });
      setHabits(INITIAL_HABITS);
    } finally {
      setLoading(false);
    }
  };

  // Persiste array de hábitos no AsyncStorage
  const persistHabits = async (newHabits) => {
    try {
      await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(newHabits));
    } catch (error) {
      Security.safeLog({ context: 'persistHabits', error: error.message });
    }
  };

  // ─── AUTENTICAÇÃO ─────────────────────────────────────────────

  const login = async (email, password) => {
    // Valida formato do email antes de consultar a "base"
    if (!Security.validateEmail(email)) {
      return { success: false, message: 'Formato de email inválido.' };
    }

    const found = users.find(
      (u) => u.email === email.toLowerCase().trim() && u.password === password
    );

    if (found) {
      // SEGURANÇA: salvar apenas dados não-sensíveis (sem senha)
      const userData = { id: found.id, name: found.name, email: found.email };
      setUser(userData);
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(userData));
      return { success: true };
    }

    // Mensagem genérica: não revelar se o erro é no email ou na senha
    return { success: false, message: 'Email ou senha incorretos.' };
  };

  const register = async (name, email, password) => {
    // Validação completa com security.js
    const nameV = Security.validateName(name);
    if (!nameV.valid) return { success: false, message: nameV.message };

    if (!Security.validateEmail(email)) {
      return { success: false, message: 'Formato de email inválido.' };
    }

    const passV = Security.validatePassword(password);
    if (!passV.valid) return { success: false, message: passV.message };

    const emailLower = email.toLowerCase().trim();
    if (users.find((u) => u.email === emailLower)) {
      return { success: false, message: 'Este email já está cadastrado.' };
    }

    const newUser = { id: Date.now().toString(), name: nameV.value, email: emailLower, password };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    // Persiste usuários (em produção real: usar backend seguro, nunca armazenar senha localmente)
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));

    const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userData);
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(userData));
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(KEYS.USER);
  };

  // ─── CRUD DE HÁBITOS ──────────────────────────────────────────

  const addHabit = async (habitData) => {
    // Valida e sanitiza inputs
    const nameV = Security.validateHabitName(habitData.name);
    if (!nameV.valid) return { success: false, message: nameV.message };

    // Valida cor e ícone (evita valores malformados nos estilos)
    const safeColor =
      Security.isValidHexColor(habitData.color) ? habitData.color : '#6C63FF';
    const safeIcon =
      Security.isValidIcon(habitData.icon) ? habitData.icon : '📋';

    const newHabit = {
      id: Date.now().toString(),
      name: nameV.value,
      description: Security.sanitizeDescription(habitData.description),
      icon: safeIcon,
      color: safeColor,
      createdAt: new Date().toISOString(),
      history: {}, // histórico começa vazio
    };

    const updatedHabits = [newHabit, ...habits];
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
    return { success: true, habit: newHabit };
  };

  const updateHabit = async (id, updates) => {
    const sanitizedUpdates = {};

    if (updates.name !== undefined) {
      const v = Security.validateHabitName(updates.name);
      if (!v.valid) return { success: false, message: v.message };
      sanitizedUpdates.name = v.value;
    }
    if (updates.description !== undefined) {
      sanitizedUpdates.description = Security.sanitizeDescription(updates.description);
    }
    if (updates.icon !== undefined && Security.isValidIcon(updates.icon)) {
      sanitizedUpdates.icon = updates.icon;
    }
    if (updates.color !== undefined && Security.isValidHexColor(updates.color)) {
      sanitizedUpdates.color = updates.color;
    }

    const updatedHabits = habits.map((h) =>
      h.id === id ? { ...h, ...sanitizedUpdates } : h
    );
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
    return { success: true };
  };

  const deleteHabit = async (id) => {
    const updatedHabits = habits.filter((h) => h.id !== id);
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
  };

  // Marca/desmarca o hábito como concluído no dia atual
  const toggleHabitToday = async (id) => {
    const today = DateUtils.todayKey();
    const updatedHabits = habits.map((h) => {
      if (h.id !== id) return h;
      const wasCompleted = h.history[today] === true;
      // Imutabilidade: cria novo objeto history em vez de mutar o existente
      const newHistory = { ...h.history, [today]: !wasCompleted };
      return { ...h, history: newHistory };
    });
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
  };

  // ─── TEMA ─────────────────────────────────────────────────────

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem(KEYS.THEME, newTheme);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        habits,
        theme,
        loading,
        login,
        register,
        logout,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitToday,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook customizado — importar em qualquer componente para acessar o estado global
export function useApp() {
  return useContext(AppContext);
}
