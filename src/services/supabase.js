/**
 * supabase.js — Configuração do cliente Supabase.
 *
 * ATENÇÃO: substitua os valores abaixo com os da sua conta Supabase.
 * Acesse: https://supabase.com → seu projeto → Settings → API
 *
 * SUPABASE_URL  → "Project URL"
 * SUPABASE_ANON_KEY → "Project API Keys" → anon public
 *
 * A chave anon é segura para ficar no código-fonte do cliente porque
 * o acesso aos dados é controlado pelas políticas RLS no Supabase.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khythczqolfuhyxybxnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeXRoY3pxb2xmdWh5eHlieG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Mjc5ODYsImV4cCI6MjA5MzUwMzk4Nn0.v0CQS5r8cPBs7Qxlr0PJqKafOR1ZJcL5SY-FpOtVdvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,       // persiste a sessão no dispositivo
    autoRefreshToken: true,      // renova o token automaticamente
    persistSession: true,        // mantém o login entre aberturas do app
    detectSessionInUrl: false,   // necessário para React Native (sem URL)
  },
});
