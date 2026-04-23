/**
 * AppContext.js — Gerenciamento de estado global com Context API.
 *
 * Responsabilidades:
 *  - Autenticação: login, cadastro, logout
 *  - CRUD de tarefas: adicionar, atualizar, excluir, marcar como concluída
 *  - Preferência de tema (claro/escuro)
 *  - Persistência de dados via AsyncStorage
 *
 * Padrão: Provider + hook personalizado (useApp)
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext({});

// Usuários pré-cadastrados para demonstração
const DEMO_USERS = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', password: '123456' },
  { id: '2', name: 'Maria Souza', email: 'maria@email.com', password: '123456' },
];

// Tarefas iniciais de exemplo carregadas no primeiro uso do app
const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Estudar React Native',
    description: 'Revisar componentes, hooks, navegação e Context API',
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Fazer exercícios físicos',
    description: '30 minutos de caminhada pela manhã antes do trabalho',
    completed: true,
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Ler um livro',
    description: 'Continuar a leitura do capítulo 5 — "Clean Code"',
    completed: false,
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Entregar trabalho acadêmico',
    description: 'Finalizar e enviar o projeto de React Native para a faculdade',
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
];

// Chaves do AsyncStorage
const KEYS = {
  USER: '@appRotina:user',
  TASKS: '@appRotina:tasks',
  THEME: '@appRotina:theme',
  USERS: '@appRotina:users',
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);       // Usuário logado (ou null)
  const [tasks, setTasks] = useState([]);        // Lista de tarefas
  const [theme, setTheme] = useState('light');   // 'light' | 'dark'
  const [loading, setLoading] = useState(true);  // Carregando dados iniciais
  const [users, setUsers] = useState(DEMO_USERS); // Usuários cadastrados

  // Carrega os dados persistidos quando o app é aberto
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedTasks, storedTheme, storedUsers] = await Promise.all([
        AsyncStorage.getItem(KEYS.USER),
        AsyncStorage.getItem(KEYS.TASKS),
        AsyncStorage.getItem(KEYS.THEME),
        AsyncStorage.getItem(KEYS.USERS),
      ]);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedTasks) setTasks(JSON.parse(storedTasks));
      else setTasks(INITIAL_TASKS); // primeira vez: carrega as tarefas de exemplo
      if (storedTheme) setTheme(storedTheme);
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } catch (error) {
      console.log('[AppContext] Erro ao carregar dados:', error);
      setTasks(INITIAL_TASKS);
    } finally {
      setLoading(false);
    }
  };

  // Persiste o array de tarefas no AsyncStorage
  const persistTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(newTasks));
    } catch (error) {
      console.log('[AppContext] Erro ao salvar tarefas:', error);
    }
  };

  // ─── AUTENTICAÇÃO ──────────────────────────────────────────────

  // LOGIN: verifica email e senha entre os usuários cadastrados
  const login = async (email, password) => {
    const found = users.find(
      (u) => u.email === email.toLowerCase().trim() && u.password === password
    );
    if (found) {
      const userData = { id: found.id, name: found.name, email: found.email };
      setUser(userData);
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Email ou senha incorretos.' };
  };

  // CADASTRO: valida unicidade do email e cria novo usuário
  const register = async (name, email, password) => {
    const emailLower = email.toLowerCase().trim();
    const exists = users.find((u) => u.email === emailLower);
    if (exists) {
      return { success: false, message: 'Este email já está cadastrado.' };
    }

    const newUser = { id: Date.now().toString(), name, email: emailLower, password };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));

    const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userData);
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(userData));
    return { success: true };
  };

  // LOGOUT: remove sessão do usuário
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(KEYS.USER);
  };

  // ─── CRUD DE TAREFAS ───────────────────────────────────────────

  // ADICIONAR nova tarefa no início da lista
  const addTask = async (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await persistTasks(updatedTasks);
    return newTask;
  };

  // ATUALIZAR campos de uma tarefa existente
  const updateTask = async (id, updates) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    await persistTasks(updatedTasks);
  };

  // EXCLUIR tarefa pelo id
  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await persistTasks(updatedTasks);
  };

  // MARCAR/DESMARCAR como concluída (toggle)
  const toggleTaskComplete = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await persistTasks(updatedTasks);
  };

  // ─── TEMA ──────────────────────────────────────────────────────

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem(KEYS.THEME, newTheme);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        tasks,
        theme,
        loading,
        login,
        register,
        logout,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado — importar em qualquer componente para acessar o estado global
export function useApp() {
  return useContext(AppContext);
}
