/**
 * supabase.js — Configuração da conexão com o banco de dados na nuvem.
 *
 * O Supabase é um serviço de banco de dados online (na nuvem). Em vez de
 * salvar os dados dos usuários só no aparelho, agora eles ficam salvos num
 * servidor, o que significa que:
 *  - O usuário não perde os dados se desinstalar o app
 *  - Dá pra acessar de qualquer aparelho
 *  - Várias pessoas podem ter contas separadas com dados independentes
 *
 * Aqui eu crio a "conexão" com o banco. É como configurar o endereço de
 * um servidor antes de começar a mandar e receber informações.
 *
 * As duas informações necessárias são:
 *  - SUPABASE_URL: o endereço do servidor (como o endereço de um site)
 *  - SUPABASE_ANON_KEY: uma chave pública que identifica meu aplicativo
 *
 * A chave anon (anônima) é segura para ficar no código-fonte porque
 * ela sozinha não dá acesso a nada — só funciona com o usuário logado,
 * e as regras do banco (chamadas RLS) garantem que cada pessoa só vê
 * os próprios dados.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khythczqolfuhyxybxnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeXRoY3pxb2xmdWh5eHlieG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Mjc5ODYsImV4cCI6MjA5MzUwMzk4Nn0.v0CQS5r8cPBs7Qxlr0PJqKafOR1ZJcL5SY-FpOtVdvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Uso o AsyncStorage para salvar a sessão do usuário no aparelho.
    // Assim ele não precisa fazer login toda vez que abrir o app.
    storage: AsyncStorage,
    autoRefreshToken: true,   // renova o "passe de acesso" automaticamente antes de vencer
    persistSession: true,     // mantém o usuário logado mesmo fechando o app
    detectSessionInUrl: false, // desativo essa opção porque no React Native não tem URL de navegador
  },
});
