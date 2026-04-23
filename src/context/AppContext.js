/**
 * AppContext.js — Estado global da aplicação (hábitos, autenticação e tema).
 *
 * Usei a Context API do React para disponibilizar o estado global para todas
 * as telas sem precisar passar props manualmente de componente em componente.
 *
 * O que fica nesse contexto:
 *  - user: dados do usuário logado (nome, email — sem senha)
 *  - habits: lista de todos os hábitos do usuário
 *  - theme: 'light' ou 'dark'
 *  - Funções: login, register, logout, addHabit, updateHabit, deleteHabit,
 *             toggleHabitToday, toggleTheme
 *
 * Modelo de um hábito:
 *  {
 *    id: string,            → identificador único (timestamp)
 *    name: string,          → nome do hábito (ex: "Beber água")
 *    description: string,   → descrição opcional
 *    icon: string,          → emoji (ex: "💧")
 *    color: string,         → cor hex (ex: "#45B7D1")
 *    createdAt: string,     → data de criação em formato ISO
 *    history: {             → registro diário de conclusões
 *      'YYYY-MM-DD': boolean
 *    }
 *  }
 *
 * Segurança implementada:
 *  - Senhas NUNCA são salvas no AsyncStorage
 *  - Todos os inputs passam pela validação do security.js antes de persistir
 *  - As chaves do AsyncStorage têm prefixo 'v2' para não conflitar com versões antigas
 */
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateUtils } from '../utils/dateUtils';
import { Security } from '../utils/security';

// Cria o contexto vazio — o valor real é passado pelo AppProvider
const AppContext = createContext({});

// Usuários de demonstração para facilitar o teste do app
const DEMO_USERS = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', password: '123456' },
  { id: '2', name: 'Maria Souza', email: 'maria@email.com', password: '123456' },
];

// Função auxiliar para gerar chave de data N dias atrás
// Precisa estar antes do INITIAL_HABITS porque ele usa essa função
function d(n) {
  return DateUtils.daysAgoKey(n);
}

// Hábitos de exemplo carregados na primeira execução do app
// Já vêm com histórico pré-populado para o Dashboard ter dados para exibir
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

// Chaves do AsyncStorage com prefixo 'v2' para não conflitar com versões antigas
const KEYS = {
  USER: '@appRotina:v2:user',
  HABITS: '@appRotina:v2:habits',
  THEME: '@appRotina:v2:theme',
  USERS: '@appRotina:v2:users',
};

// AppProvider: componente que envolve todo o app e fornece o estado global
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);       // usuário logado (ou null)
  const [habits, setHabits] = useState([]);      // lista de hábitos
  const [theme, setTheme] = useState('light');   // tema atual
  const [loading, setLoading] = useState(true);  // carregando dados do storage
  const [users, setUsers] = useState(DEMO_USERS); // base de usuários (demo)

  // Ao abrir o app, carrega os dados salvos no AsyncStorage
  useEffect(() => {
    loadStoredData();
  }, []);

  /**
   * Carrega todos os dados persistidos de uma vez usando Promise.all.
   * Isso é mais eficiente do que fazer uma leitura de cada vez.
   */
  const loadStoredData = async () => {
    try {
      const [storedUser, storedHabits, storedTheme, storedUsers] = await Promise.all([
        AsyncStorage.getItem(KEYS.USER),
        AsyncStorage.getItem(KEYS.HABITS),
        AsyncStorage.getItem(KEYS.THEME),
        AsyncStorage.getItem(KEYS.USERS),
      ]);

      if (storedUser) setUser(JSON.parse(storedUser));
      // Se não há hábitos salvos (primeira execução), usa os exemplos
      if (storedHabits) setHabits(JSON.parse(storedHabits));
      else setHabits(INITIAL_HABITS);
      if (storedTheme) setTheme(storedTheme);
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } catch (error) {
      Security.safeLog({ context: 'loadStoredData', error: error.message });
      setHabits(INITIAL_HABITS); // fallback seguro em caso de erro
    } finally {
      setLoading(false); // libera a tela de loading independente do resultado
    }
  };

  // Salva o array de hábitos no AsyncStorage após qualquer modificação
  const persistHabits = async (newHabits) => {
    try {
      await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(newHabits));
    } catch (error) {
      Security.safeLog({ context: 'persistHabits', error: error.message });
    }
  };

  // ─── AUTENTICAÇÃO ─────────────────────────────────────────────────────────

  /**
   * Login: valida o email e busca o usuário na lista.
   * A mensagem de erro é genérica para não revelar se o problema
   * está no email ou na senha (boa prática de segurança).
   */
  const login = async (email, password) => {
    if (!Security.validateEmail(email)) {
      return { success: false, message: 'Formato de email inválido.' };
    }

    const found = users.find(
      (u) => u.email === email.toLowerCase().trim() && u.password === password
    );

    if (found) {
      // Salvo só os dados não-sensíveis — a senha nunca vai para o AsyncStorage
      const userData = { id: found.id, name: found.name, email: found.email };
      setUser(userData);
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, message: 'Email ou senha incorretos.' };
  };

  /**
   * Cadastro: valida todos os campos com o security.js e cria o novo usuário.
   * Em um app real de produção, isso seria feito no backend com hash de senha.
   */
  const register = async (name, email, password) => {
    // Valida cada campo individualmente para poder dar mensagens de erro específicas
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
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));

    // Loga automaticamente após o cadastro
    const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userData);
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(userData));
    return { success: true };
  };

  // Remove o usuário do estado e do storage (os hábitos permanecem)
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(KEYS.USER);
  };

  // ─── CRUD DE HÁBITOS ──────────────────────────────────────────────────────

  /**
   * Cria um novo hábito após validar e sanitizar todos os campos.
   * A cor e o ícone passam por validação adicional para garantir que
   * apenas valores seguros sejam aplicados nos estilos.
   */
  const addHabit = async (habitData) => {
    const nameV = Security.validateHabitName(habitData.name);
    if (!nameV.valid) return { success: false, message: nameV.message };

    // Se a cor ou o ícone forem inválidos, usa um valor padrão seguro
    const safeColor = Security.isValidHexColor(habitData.color) ? habitData.color : '#6C63FF';
    const safeIcon = Security.isValidIcon(habitData.icon) ? habitData.icon : '📋';

    const newHabit = {
      id: Date.now().toString(),
      name: nameV.value,
      description: Security.sanitizeDescription(habitData.description),
      icon: safeIcon,
      color: safeColor,
      createdAt: new Date().toISOString(),
      history: {}, // histórico vazio — o usuário começa a marcar a partir de hoje
    };

    const updatedHabits = [newHabit, ...habits]; // novo hábito aparece no topo
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
    return { success: true, habit: newHabit };
  };

  /**
   * Atualiza um hábito existente.
   * Só valida e atualiza os campos que foram passados (updates parciais).
   */
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

    // Cria novo array com o hábito atualizado (imutabilidade)
    const updatedHabits = habits.map((h) =>
      h.id === id ? { ...h, ...sanitizedUpdates } : h
    );
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
    return { success: true };
  };

  // Remove o hábito e todo o seu histórico permanentemente
  const deleteHabit = async (id) => {
    const updatedHabits = habits.filter((h) => h.id !== id);
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
  };

  /**
   * Marca ou desmarca o hábito como concluído no dia atual.
   * Funciona como toggle: se já estava feito, desfaz; se não estava, marca.
   *
   * Usei imutabilidade aqui: crio um novo objeto history em vez de
   * modificar o existente, o que é a forma correta de atualizar estado no React.
   */
  const toggleHabitToday = async (id) => {
    const today = DateUtils.todayKey();
    const updatedHabits = habits.map((h) => {
      if (h.id !== id) return h;
      const wasCompleted = h.history[today] === true;
      const newHistory = { ...h.history, [today]: !wasCompleted };
      return { ...h, history: newHistory };
    });
    setHabits(updatedHabits);
    await persistHabits(updatedHabits);
  };

  // ─── TEMA ──────────────────────────────────────────────────────────────────

  // Alterna entre tema claro e escuro e persiste a preferência
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

/**
 * Hook personalizado para acessar o contexto global.
 * Em vez de importar AppContext e useContext em cada tela,
 * basta importar esse hook: const { habits, theme } = useApp();
 */
export function useApp() {
  return useContext(AppContext);
}
