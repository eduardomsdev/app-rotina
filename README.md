# 📱 MS Productivity — Habit Tracker

Aplicativo mobile de rastreamento de hábitos desenvolvido em **React Native com Expo**, como trabalho acadêmico da disciplina de Desenvolvimento Mobile.

<p align="center">
  <img src="screenshots/Login.webp" alt="Tela de Login do MS Productivity" width="280" />
</p>

---

## 💡 Ideia do Projeto

A ideia surgiu de uma necessidade real: muitas pessoas querem criar bons hábitos (exercício, leitura, hidratação) mas esquecem ou perdem a motivação por falta de acompanhamento visual.

O **MS Productivity** resolve isso permitindo que o usuário:
- Cadastre seus hábitos diários com ícone e cor personalizados
- Marque cada hábito como feito com um toque
- Acompanhe sua sequência (streak) de dias consecutivos
- Visualize o progresso da semana em um mini gráfico de barras
- Veja estatísticas dos últimos 30 dias por hábito

A motivação principal foi criar algo que eu mesmo usaria — um app simples, bonito e que realmente ajude a manter a consistência nos hábitos.

---

## ✅ Requisitos Acadêmicos Atendidos

| Requisito | Onde está implementado |
|---|---|
| `View` | Em todas as telas (containers, cards, linhas) |
| `Text` | Em todas as telas (títulos, labels, valores) |
| `TextInput` | LoginScreen, RegisterScreen, AddTaskScreen, TaskDetailScreen |
| `Button` (nativo RN) | AddTaskScreen — botão "Limpar Campos" |
| `FlatList` | HomeScreen — lista de hábitos do dia |
| `Image` | LoginScreen (logo do app), SettingsScreen (avatar do usuário) |
| Layout **Flexbox** | Todos os componentes usam flexDirection, justifyContent, alignItems |
| **React Navigation** | Stack Navigator + Bottom Tab Navigator |
| **AsyncStorage** | Persiste preferência de tema e sessão de login |
| **Banco de dados na nuvem (Supabase)** | Autenticação real e tabela de hábitos com RLS |
| Mínimo **5 telas** | 7 telas: Login, Cadastro, Dashboard, Hoje, Detalhe, Novo Hábito, Configurações |
| Código organizado | Estrutura de pastas: screens, components, context, services, utils |

---

## 🛠️ Tecnologias Utilizadas

- **React Native** com **Expo SDK 55**
- **React Navigation v6** — Stack + Bottom Tabs
- **Supabase** — banco de dados PostgreSQL na nuvem com autenticação e RLS
- **AsyncStorage** — persistência local da sessão e preferência de tema
- **Context API** — gerenciamento de estado global
- **Expo Vector Icons (Ionicons)** — ícones do app
- **LayoutAnimation** — animação dos cards do Dashboard

---

## 📂 Estrutura de Pastas

```
ms-productivity/
├── App.js                        # Ponto de entrada
├── app.json                      # Configurações do Expo
├── screenshots/                  # Capturas de tela usadas no README
├── src/
│   ├── assets/
│   │   └── logo.webp             # Logo do app
│   ├── context/
│   │   └── AppContext.js         # Estado global: hábitos, autenticação, tema
│   ├── navigation/
│   │   └── AppNavigator.js       # Configuração de rotas (Stack + Tab)
│   ├── screens/
│   │   ├── LoginScreen.js        # Tela 1 — Login
│   │   ├── RegisterScreen.js     # Tela 2 — Cadastro
│   │   ├── DashboardScreen.js    # Tela 3 — Dashboard com cards expansíveis
│   │   ├── HomeScreen.js         # Tela 4 — Lista de hábitos do dia
│   │   ├── AddTaskScreen.js      # Tela 5 — Criar novo hábito
│   │   ├── TaskDetailScreen.js   # Tela 6 — Detalhes e edição do hábito
│   │   └── SettingsScreen.js     # Tela 7 — Configurações e perfil
│   ├── components/
│   │   ├── HabitCard.js          # Card de hábito com histórico semanal
│   │   ├── DashboardCard.js      # Card expansível (acordeão)
│   │   └── EmptyList.js          # Componente de lista vazia
│   ├── services/
│   │   ├── supabase.js           # Conexão com o banco de dados na nuvem
│   │   └── habitService.js       # Lógica de negócio: streak, stats, taxas
│   └── utils/
│       ├── themes.js             # Paletas de cores claro/escuro
│       ├── dateUtils.js          # Utilitários de data
│       ├── storage.js            # Wrapper do AsyncStorage
│       └── security.js           # Validação e sanitização de inputs
```

---

## 📲 Como Instalar e Testar

### Pré-requisitos

- [Node.js 20+](https://nodejs.org/) instalado
- [Expo Go](https://expo.dev/go) instalado no celular (disponível na App Store e Google Play)
- Celular e computador na **mesma rede Wi-Fi**

### Passo a Passo

**1. Clone o repositório**
```bash
git clone https://github.com/eduardomsdev/ms-productivity.git
cd ms-productivity
```

**2. Instale as dependências**
```bash
npm install --legacy-peer-deps
```

**3. Inicie o servidor de desenvolvimento**
```bash
npm start
```

**4. Abra no celular**
- Abra o aplicativo **Expo Go** no seu celular
- Escaneie o **QR Code** que aparecer no terminal
- Aguarde o app carregar (pode levar alguns segundos na primeira vez)

### Alternativa: emulador Android

Com o Android Studio e um emulador aberto, pressione **`a`** no terminal após rodar `npm start`.

---

## 🔑 Credenciais de Teste

O app já vem com um usuário cadastrado para facilitar a avaliação:

| Usuário | Email | Senha |
|---|---|---|
| João (demo) | joao@email.com | 123456 |

> Também é possível criar uma conta nova diretamente pelo app na tela de Cadastro. Cada conta nova já é criada com 4 hábitos de exemplo para você ver o app em funcionamento na hora.

---

## 📱 Telas do Aplicativo

### 1. Login

<p align="center">
  <img src="screenshots/Login.webp" alt="Tela de Login" width="280" />
</p>

Tela inicial com campos de email e senha. Possui toggle para mostrar/esconder a senha e dica com as credenciais de demonstração.

### 2. Cadastro

Permite criar uma nova conta com nome, email e senha. Inclui validação de todos os campos e confirmação de senha.

### 3. Dashboard

<p align="center">
  <img src="screenshots/inicio.webp" alt="Tela do Dashboard" width="280" />
</p>

Tela principal com 4 cards expansíveis (acordeão com animação):
- **Progresso de Hoje** — barra de progresso e % de conclusão
- **Sequências Ativas** — ranking de streaks por hábito com 🔥
- **Esta Semana** — mini gráfico de barras dos últimos 7 dias
- **Estatísticas (30 dias)** — taxa de conclusão por hábito

### 4. Hoje (Lista de Hábitos)

<p align="center">
  <img src="screenshots/AllHabitos.webp" alt="Lista de hábitos do dia" width="280" />
</p>

FlatList com todos os hábitos do dia. Cada card mostra:
- Ícone e nome do hábito
- 7 pontinhos do histórico semanal
- Streak atual (🔥 dias consecutivos)
- Botão de check para marcar/desmarcar no dia

Inclui campo de busca e filtros (Todos / Pendentes / Concluídos).

### 5. Novo Hábito

<p align="center">
  <img src="screenshots/addHabito.webp" alt="Tela de criar novo hábito" width="280" />
</p>

Formulário para criar um hábito com:
- Campo de nome e descrição (TextInput)
- Grade de 24 emojis para escolher o ícone
- Paleta de 12 cores
- Preview em tempo real do hábito
- Botão nativo `Button` para limpar os campos

### 6. Detalhes do Hábito

- Cabeçalho colorido com streak, taxa de conclusão e recorde
- Calendário dos últimos 21 dias (3 semanas)
- Botão para marcar como feito hoje
- Modo de edição completo (nome, descrição, ícone, cor)
- Opção de excluir o hábito com confirmação

### 7. Configurações

<p align="center">
  <img src="screenshots/config.webp" alt="Tela de configurações" width="280" />
</p>

- Foto de perfil gerada automaticamente com as iniciais do usuário
- Barra de progresso do dia
- Toggle de tema claro/escuro
- Estatísticas de hoje (total, pendentes, feitos)
- Informações do aplicativo
- Botão de logout com confirmação

---

## 🔒 Segurança Implementada

- Todos os inputs são **validados e sanitizados** antes de salvar (remoção de tags HTML, limite de caracteres)
- **Senhas nunca trafegam ou ficam salvas no app** — quem cuida disso é o Supabase Auth
- **Row Level Security (RLS)** no banco — cada usuário só consegue ler e mexer nos próprios hábitos
- Logs de debug só aparecem em modo de desenvolvimento (`__DEV__`)
- Cores e emojis são validados antes de serem aplicados nos estilos

---

## 👨‍💻 Desenvolvido por

Eduardo Martins Da Silva
Disciplina: Desenvolvimento de Aplicativos Mobile
Ano: 2026
