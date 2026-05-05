/**
 * AppContext.js — Estado global da aplicação com Supabase.
 *
 * Autenticação e dados de hábitos agora são gerenciados pelo Supabase:
 *  - Auth: email/senha real com sessão persistida no dispositivo
 *  - Banco: tabela "habits" com Row Level Security (cada usuário vê só os seus)
 *  - Tema: ainda salvo localmente no AsyncStorage (preferência do dispositivo)
 *
 * A interface pública do contexto (funções e estado) não mudou,
 * então nenhuma tela precisa ser alterada.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { DateUtils } from '../utils/dateUtils';
import { Security } from '../utils/security';

const AppContext = createContext({});

const THEME_KEY = '@appRotina:theme';

// Converte o objeto do Supabase Auth para o formato que o app usa
function mapSupabaseUser(supabaseUser) {
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
    email: supabaseUser.email,
  };
}

// Converte a linha do banco para o formato que o app usa (snake_case → camelCase)
function mapHabit(row) {
  return {
    ...row,
    createdAt: row.created_at,
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Ao abrir o app: carrega tema local e verifica sessão existente no Supabase
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((t) => { if (t) setTheme(t); });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        loadHabits(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Ouve mudanças de autenticação (login, logout, expiração de sessão)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setHabits([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca todos os hábitos do usuário no Supabase
  const loadHabits = async (userId) => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHabits(data.map(mapHabit));
    }
    setLoading(false);
  };

  // ─── AUTENTICAÇÃO ─────────────────────────────────────────────────────────

  const login = async (email, password) => {
    if (!Security.validateEmail(email)) {
      return { success: false, message: 'Formato de email inválido.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) return { success: false, message: 'Email ou senha incorretos.' };

    const userData = mapSupabaseUser(data.user);
    setUser(userData);
    await loadHabits(data.user.id);
    return { success: true };
  };

  const register = async (name, email, password) => {
    const nameV = Security.validateName(name);
    if (!nameV.valid) return { success: false, message: nameV.message };

    if (!Security.validateEmail(email)) {
      return { success: false, message: 'Formato de email inválido.' };
    }

    const passV = Security.validatePassword(password);
    if (!passV.valid) return { success: false, message: passV.message };

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: { data: { name: nameV.value } },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { success: false, message: 'Este email já está cadastrado.' };
      }
      return { success: false, message: error.message };
    }

    const userData = { id: data.user.id, name: nameV.value, email: data.user.email };
    setUser(userData);

    // Insere hábitos de exemplo para o novo usuário ter dados para ver
    await seedDemoHabits(data.user.id);
    await loadHabits(data.user.id);
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHabits([]);
  };

  // ─── CRUD DE HÁBITOS ──────────────────────────────────────────────────────

  const addHabit = async (habitData) => {
    const nameV = Security.validateHabitName(habitData.name);
    if (!nameV.valid) return { success: false, message: nameV.message };

    const safeColor = Security.isValidHexColor(habitData.color) ? habitData.color : '#6C63FF';
    const safeIcon = Security.isValidIcon(habitData.icon) ? habitData.icon : '📋';

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: nameV.value,
        description: Security.sanitizeDescription(habitData.description),
        icon: safeIcon,
        color: safeColor,
        history: {},
      })
      .select()
      .single();

    if (error) return { success: false, message: 'Erro ao criar hábito. Tente novamente.' };

    const newHabit = mapHabit(data);
    setHabits([newHabit, ...habits]);
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

    const { error } = await supabase.from('habits').update(sanitizedUpdates).eq('id', id);
    if (error) return { success: false, message: 'Erro ao atualizar hábito.' };

    setHabits(habits.map((h) => (h.id === id ? { ...h, ...sanitizedUpdates } : h)));
    return { success: true };
  };

  const deleteHabit = async (id) => {
    await supabase.from('habits').delete().eq('id', id);
    setHabits(habits.filter((h) => h.id !== id));
  };

  const toggleHabitToday = async (id) => {
    const today = DateUtils.todayKey();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const newHistory = { ...habit.history, [today]: !habit.history[today] };
    await supabase.from('habits').update({ history: newHistory }).eq('id', id);
    setHabits(habits.map((h) => (h.id === id ? { ...h, history: newHistory } : h)));
  };

  // ─── TEMA ──────────────────────────────────────────────────────────────────

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  // ─── SEED DE DADOS ─────────────────────────────────────────────────────────

  // Insere hábitos de demonstração para que novos usuários já tenham dados para ver
  const seedDemoHabits = async (userId) => {
    function d(n) { return DateUtils.daysAgoKey(n); }

    const demos = [
      {
        user_id: userId, name: 'Beber 2L de água',
        description: 'Manter hidratação ao longo do dia', icon: '💧', color: '#45B7D1',
        history: { [d(6)]: true, [d(5)]: true, [d(4)]: true, [d(3)]: false, [d(2)]: true, [d(1)]: true },
      },
      {
        user_id: userId, name: 'Meditação matinal',
        description: '10 minutos ao acordar', icon: '🧘', color: '#DDA0DD',
        history: { [d(5)]: true, [d(4)]: true, [d(3)]: true, [d(2)]: true, [d(1)]: true },
      },
      {
        user_id: userId, name: 'Leitura diária',
        description: 'Ler pelo menos 20 páginas', icon: '📚', color: '#FF6B6B',
        history: { [d(6)]: true, [d(5)]: false, [d(4)]: true, [d(3)]: true, [d(2)]: false, [d(1)]: true },
      },
      {
        user_id: userId, name: 'Exercício físico',
        description: '30 minutos de atividade', icon: '🏃', color: '#4ECDC4',
        history: { [d(4)]: true, [d(3)]: true, [d(2)]: true, [d(1)]: false },
      },
    ];

    await supabase.from('habits').insert(demos);
  };

  return (
    <AppContext.Provider
      value={{
        user, habits, theme, loading,
        login, register, logout,
        addHabit, updateHabit, deleteHabit, toggleHabitToday,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
