/**
 * AppContext.js — O "cérebro" do aplicativo.
 *
 * Imagina que o app é um restaurante. As telas são os garçons que atendem
 * o cliente, mas quem realmente controla tudo — os ingredientes, os pedidos,
 * o cardápio — é a cozinha. O AppContext é essa cozinha.
 *
 * Aqui eu centralizo TUDO que é compartilhado entre as telas:
 *  - Quem está logado (o usuário)
 *  - A lista de hábitos dele
 *  - O tema do app (claro ou escuro)
 *  - Todas as ações: login, cadastro, adicionar/remover hábitos, etc.
 *
 * Por que centralizar em vez de deixar cada tela cuidar dos seus dados?
 * Porque senão a tela de início teria uma lista de hábitos, a tela de
 * detalhes teria outra, e elas nunca ficariam sincronizadas. Aqui tudo
 * fica num lugar só e qualquer tela pode "pedir" o que precisa.
 *
 * Os dados dos hábitos agora ficam salvos no Supabase (banco de dados na nuvem),
 * então mesmo que o usuário desinstale o app, os dados continuam lá.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { DateUtils } from '../utils/dateUtils';
import { Security } from '../utils/security';

// Aqui eu crio o "contexto" — é como criar um canal de comunicação
// que todas as telas do app podem usar para pegar os dados e funções.
const AppContext = createContext({});

// Chave usada para salvar o tema (claro/escuro) no aparelho.
// O tema é a única coisa que ainda fica salva localmente, porque é
// uma preferência do dispositivo e não precisa ficar na nuvem.
const THEME_KEY = '@appRotina:theme';

/**
 * Converte os dados do usuário que vêm do Supabase para o formato
 * simples que o resto do app usa.
 *
 * O Supabase retorna um monte de informação técnica sobre o usuário,
 * mas o app só precisa saber três coisas: o id, o nome e o email.
 * Então eu "filtro" só essas três e jogo o resto fora.
 *
 * O nome fica guardado em user_metadata (metadados do usuário) porque
 * o Supabase separa as informações de login (email/senha) das informações
 * extras do perfil. Se por algum motivo não tiver nome cadastrado,
 * eu uso a parte do email antes do @ como nome.
 */
function mapSupabaseUser(supabaseUser) {
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
    email: supabaseUser.email,
  };
}

/**
 * Converte um hábito que veio do banco de dados para o formato do app.
 *
 * O banco de dados usa snake_case (palavras_com_underline) porque é o
 * padrão do SQL. Mas o JavaScript usa camelCase (palavrasSeparadasAssim).
 * Então eu crio o campo "createdAt" (camelCase) apontando para o
 * "created_at" (snake_case) que veio do banco, para o resto do app
 * não precisar saber como o banco chama esse campo.
 */
function mapHabit(row) {
  return {
    ...row,           // copia todos os campos do banco
    createdAt: row.created_at,  // adiciona o alias em camelCase
  };
}

/**
 * AppProvider — É quem "fornece" os dados para todas as telas.
 *
 * Funciona assim: eu envolvo todo o app com esse componente (lá no App.js),
 * e aí qualquer tela que estiver "dentro" dele pode usar o useApp() para
 * pegar o que precisa. É como uma tomada que distribui energia para tudo
 * que está plugado nela.
 */
export function AppProvider({ children }) {
  // Esses são os "estados" — variáveis que o React fica observando.
  // Sempre que um deles muda, as telas que usam ele são atualizadas automaticamente.
  const [user, setUser] = useState(null);      // null = ninguém logado
  const [habits, setHabits] = useState([]);    // lista vazia no começo
  const [theme, setTheme] = useState('light'); // tema claro por padrão
  const [loading, setLoading] = useState(true); // começa carregando

  /**
   * useEffect com [] vazio = roda uma única vez quando o app abre.
   *
   * São duas coisas que eu faço na inicialização:
   *
   * 1. Carrego o tema salvo no aparelho. Se o usuário tinha escolhido
   *    o tema escuro antes, eu restauro essa preferência.
   *
   * 2. Verifico se já existe uma sessão ativa no Supabase. Sessão é como
   *    um "ingresso" que prova que o usuário já fez login. Se o ingresso
   *    ainda é válido, o usuário não precisa fazer login de novo — eu já
   *    carrego os dados dele diretamente.
   *
   * Também configuro um "ouvinte" que fica assistindo se o login ou
   * logout acontece. Se o usuário fizer logout em outro lugar (ou a
   * sessão expirar), o app reage automaticamente.
   */
  useEffect(() => {
    // Recupera o tema salvo (se houver) e aplica
    AsyncStorage.getItem(THEME_KEY).then((t) => { if (t) setTheme(t); });

    // Verifica se o usuário já estava logado de uma sessão anterior
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Sessão válida encontrada: restaura o usuário e carrega os hábitos
        setUser(mapSupabaseUser(session.user));
        loadHabits(session.user.id);
      } else {
        // Nenhuma sessão ativa: vai direto para a tela de login
        setLoading(false);
      }
    });

    // Fica "escutando" eventos de autenticação em tempo real.
    // Por enquanto só trato o SIGNED_OUT, mas o Supabase pode emitir
    // outros eventos como TOKEN_REFRESHED, USER_UPDATED, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Limpa tudo quando o usuário sai
        setUser(null);
        setHabits([]);
        setLoading(false);
      }
    });

    // Quando o app fechar ou esse componente sair da tela, cancela o ouvinte.
    // Isso evita vazamento de memória (o ouvinte ficando ativo sem necessidade).
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Busca todos os hábitos do usuário no banco de dados.
   *
   * Eu passo o userId como parâmetro para filtrar só os hábitos desse
   * usuário específico. Mesmo que o banco tivesse hábitos de mil usuários,
   * cada um só vê os seus (o banco tem uma regra de segurança chamada RLS
   * que garante isso, mas eu filtro aqui também por boa prática).
   *
   * Os hábitos vêm em ordem do mais recente para o mais antigo.
   */
  const loadHabits = async (userId) => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)          // só os hábitos desse usuário
      .order('created_at', { ascending: false }); // mais recente primeiro

    if (!error && data) {
      setHabits(data.map(mapHabit)); // converte e salva na memória do app
    }
    setLoading(false); // seja sucesso ou erro, para de mostrar o "carregando"
  };

  // ─── AUTENTICAÇÃO ─────────────────────────────────────────────────────────
  // As funções abaixo cuidam do login, cadastro e logout do usuário.
  // Toda a parte complicada de segurança (senhas, tokens, sessões) fica
  // com o Supabase — eu só chamo as funções dele e processo o resultado.

  /**
   * login — Faz o usuário entrar com email e senha.
   *
   * Antes de mandar para o Supabase, eu valido o formato do email.
   * Isso evita chamar o servidor com dados claramente errados (como
   * um email sem @ ou sem domínio).
   *
   * Se o Supabase retornar erro (email não existe ou senha errada),
   * eu retorno uma mensagem genérica de propósito — não quero dizer
   * "esse email não existe" porque aí alguém mal-intencionado descobriria
   * quais emails estão cadastrados.
   */
  const login = async (email, password) => {
    if (!Security.validateEmail(email)) {
      return { success: false, message: 'Formato de email inválido.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(), // padroniza o email (remove espaços e coloca minúsculo)
      password,
    });

    if (error) return { success: false, message: 'Email ou senha incorretos.' };

    // Login OK: salva o usuário e carrega os hábitos dele
    const userData = mapSupabaseUser(data.user);
    setUser(userData);
    await loadHabits(data.user.id);
    return { success: true };
  };

  /**
   * register — Cria uma conta nova para o usuário.
   *
   * Antes de criar a conta, eu valido tudo:
   *  - O nome não pode ser vazio ou ter caracteres estranhos
   *  - O email precisa ter formato válido
   *  - A senha precisa ter no mínimo 6 caracteres (regra do Security)
   *
   * Depois que a conta é criada, eu insiro automaticamente 4 hábitos de
   * exemplo para que o usuário já veja o app funcionando, não uma tela vazia.
   * É como quando você instala um jogo novo e já tem um tutorial com dados pré-carregados.
   */
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
      options: { data: { name: nameV.value } }, // salva o nome junto com os dados do usuário
    });

    if (error) {
      // Se o erro diz que o email já foi registrado, mostro uma mensagem amigável
      if (error.message.toLowerCase().includes('already registered')) {
        return { success: false, message: 'Este email já está cadastrado.' };
      }
      return { success: false, message: error.message };
    }

    const userData = { id: data.user.id, name: nameV.value, email: data.user.email };
    setUser(userData);

    // Insere os hábitos de demonstração e depois carrega tudo do banco
    await seedDemoHabits(data.user.id);
    await loadHabits(data.user.id);
    return { success: true };
  };

  /**
   * logout — Faz o usuário sair do app.
   *
   * O supabase.auth.signOut() invalida a sessão tanto no servidor quanto
   * no aparelho. Depois eu limpo manualmente o usuário e os hábitos da
   * memória do app para garantir que nada fique "sobrando".
   */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHabits([]);
  };

  // ─── CRUD DE HÁBITOS ──────────────────────────────────────────────────────
  // CRUD é uma sigla para Create (criar), Read (ler), Update (atualizar),
  // Delete (apagar) — as quatro operações básicas com qualquer dado.
  // Toda vez que o usuário altera algo, eu atualizo no banco E na memória
  // do app ao mesmo tempo, para a tela não precisar esperar uma nova busca.

  /**
   * addHabit — Cria um novo hábito.
   *
   * Eu valido o nome, a cor e o ícone antes de salvar. Não confio
   * cegamente no que vem da tela, porque um usuário mal-intencionado
   * poderia tentar mandar dados quebrados. Se algo estiver errado,
   * eu uso um valor padrão seguro no lugar.
   *
   * O campo "history" começa como um objeto vazio {}. Ele vai sendo
   * preenchido ao longo dos dias conforme o usuário marca os hábitos.
   */
  const addHabit = async (habitData) => {
    const nameV = Security.validateHabitName(habitData.name);
    if (!nameV.valid) return { success: false, message: nameV.message };

    // Se a cor ou ícone não forem válidos, uso um valor padrão
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
        history: {}, // começa sem nenhum registro de dias
      })
      .select()    // pede para o banco retornar o registro criado
      .single();   // pega só um resultado (já que é um único hábito)

    if (error) return { success: false, message: 'Erro ao criar hábito. Tente novamente.' };

    // Adiciona o novo hábito no topo da lista (mais recente primeiro)
    const newHabit = mapHabit(data);
    setHabits([newHabit, ...habits]);
    return { success: true, habit: newHabit };
  };

  /**
   * updateHabit — Atualiza as informações de um hábito existente.
   *
   * Só atualizo os campos que foram passados no objeto "updates".
   * Se a tela passou só o nome novo, só o nome vai ser atualizado —
   * ícone, cor e descrição ficam como estão.
   *
   * Cada campo passa pela validação antes de ir para o banco.
   * O objeto sanitizedUpdates vai acumulando só os campos válidos.
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

    const { error } = await supabase.from('habits').update(sanitizedUpdates).eq('id', id);
    if (error) return { success: false, message: 'Erro ao atualizar hábito.' };

    // Atualiza a lista na memória sem precisar buscar tudo do banco de novo
    setHabits(habits.map((h) => (h.id === id ? { ...h, ...sanitizedUpdates } : h)));
    return { success: true };
  };

  /**
   * deleteHabit — Apaga um hábito permanentemente.
   *
   * Não precisa de validação aqui porque o banco já tem uma regra de
   * segurança que impede um usuário de apagar hábitos de outro usuário.
   * Depois de apagar no banco, eu removo da lista local também.
   */
  const deleteHabit = async (id) => {
    await supabase.from('habits').delete().eq('id', id);
    setHabits(habits.filter((h) => h.id !== id)); // remove o hábito da lista
  };

  /**
   * toggleHabitToday — Marca ou desmarca o hábito de hoje.
   *
   * O "history" é um objeto onde cada chave é uma data (ex: "2025-05-04")
   * e o valor é true (feito) ou false (não feito).
   *
   * Quando o usuário clica no hábito, eu:
   * 1. Pego a data de hoje no formato de chave (ex: "2025-05-04")
   * 2. Copio o histórico atual
   * 3. Inverto o valor de hoje (se era true vira false, e vice-versa)
   * 4. Salvo o histórico novo no banco
   * 5. Atualizo a memória do app
   *
   * É como um interruptor de luz: clicou uma vez acende, clicou de novo apaga.
   */
  const toggleHabitToday = async (id) => {
    const today = DateUtils.todayKey(); // ex: "2025-05-04"
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    // Inverte o valor de hoje no histórico
    const newHistory = { ...habit.history, [today]: !habit.history[today] };

    await supabase.from('habits').update({ history: newHistory }).eq('id', id);
    setHabits(habits.map((h) => (h.id === id ? { ...h, history: newHistory } : h)));
  };

  // ─── TEMA ──────────────────────────────────────────────────────────────────

  /**
   * toggleTheme — Alterna entre o tema claro e o escuro.
   *
   * O tema é salvo no aparelho (não na nuvem) porque é uma preferência
   * do dispositivo. Se o usuário usar o app em dois celulares diferentes,
   * cada um pode ter seu próprio tema.
   */
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme); // salva no aparelho
  };

  // ─── DADOS DE DEMONSTRAÇÃO ─────────────────────────────────────────────────

  /**
   * seedDemoHabits — Insere hábitos de exemplo para usuários novos.
   *
   * Quando alguém cria uma conta nova, o app ficaria completamente vazio.
   * Para não assustar o usuário com uma tela em branco, eu insiro 4 hábitos
   * de exemplo com histórico de alguns dias atrás, para ele já ver como o
   * app funciona na prática.
   *
   * É como quando você abre um app de fotos pela primeira vez e ele já vem
   * com algumas fotos de demonstração.
   *
   * A função d(n) gera a chave de data de "n dias atrás". Por exemplo,
   * d(1) é ontem, d(3) é três dias atrás.
   */
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

  /**
   * Aqui eu "publico" tudo que as telas podem usar.
   *
   * O AppContext.Provider é como uma tomada: ele distribui os dados
   * e funções para tudo que estiver dentro dele. As telas usam o
   * hook useApp() para "plugar" nessa tomada e pegar o que precisam.
   *
   * Só coloco aqui o que as telas realmente precisam saber — as funções
   * internas como mapHabit e seedDemoHabits ficam escondidas.
   */
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

/**
 * useApp — O gancho que as telas usam para acessar o contexto.
 *
 * Em vez de escrever useContext(AppContext) em cada tela, eu crio
 * esse atalho chamado useApp(). Assim o código fica mais limpo e
 * se eu quiser trocar o nome do contexto no futuro, só mudo aqui.
 *
 * Uso nas telas assim:
 *   const { user, habits, addHabit } = useApp();
 */
export function useApp() {
  return useContext(AppContext);
}
