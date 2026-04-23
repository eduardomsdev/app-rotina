# 📱 AppRotina — Habit Tracker

Aplicativo mobile de rastreamento de hábitos desenvolvido em **React Native com Expo**, como trabalho acadêmico da disciplina de Desenvolvimento Mobile.

---

## 💡 Ideia do Projeto

A ideia surgiu de uma necessidade real: muitas pessoas querem criar bons hábitos (exercício, leitura, hidratação) mas esquecem ou perdem a motivação por falta de acompanhamento visual.

O **AppRotina** resolve isso permitindo que o usuário:
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
| `Image` | LoginScreen (logo), SettingsScreen (avatar do usuário) |
| Layout **Flexbox** | Todos os componentes usam flexDirection, justifyContent, alignItems |
| **React Navigation** | Stack Navigator + Bottom Tab Navigator |
| **AsyncStorage** | Persiste hábitos, usuário e tema entre sessões |
| Mínimo **5 telas** | 6 telas: Login, Cadastro, Dashboard, Hoje, Detalhe, Configurações |
| Código organizado | Estrutura de pastas: screens, components, context, services, utils |

---

## 🛠️ Tecnologias Utilizadas

- **React Native** com **Expo SDK 54**
- **React Navigation v6** — Stack + Bottom Tabs
- **AsyncStorage** — persistência local de dados
- **Context API** — gerenciamento de estado global
- **Expo Vector Icons (Ionicons)** — ícones do app
- **LayoutAnimation** — animação dos cards do Dashboard

---

## 📂 Estrutura de Pastas

```
app-rotina/
├── App.js                        # Ponto de entrada
├── app.json                      # Configurações do Expo
├── src/
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
│   │   └── habitService.js       # Lógica de negócio: streak, stats, taxas
│   └── utils/
│       ├── themes.js             # Paletas de cores claro/escuro
│       ├── dateUtils.js          # Utilitários de data
│       ├── storage.js            # Wrapper do AsyncStorage
│       └── security.js          # Validação e sanitização de inputs
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
git clone https://github.com/seu-usuario/app-rotina.git
cd app-rotina
```

**2. Instale as dependências**
```bash
npm install --legacy-peer-deps
```

**3. Instale o Babel preset do Expo** (necessário para o bundler)
```bash
npm install babel-preset-expo --legacy-peer-deps
```

**4. Inicie o servidor de desenvolvimento**
```bash
npm start
```

**5. Abra no celular**
- Abra o aplicativo **Expo Go** no seu celular
- Escaneie o **QR Code** que aparecer no terminal
- Aguarde o app carregar (pode levar alguns segundos na primeira vez)

### Alternativa: emulador Android

Com o Android Studio e um emulador aberto, pressione **`a`** no terminal após rodar `npm start`.

---

## 🔑 Credenciais de Teste

O app já vem com dois usuários cadastrados para facilitar o teste:

| Usuário | Email | Senha |
|---|---|---|
| João Silva | joao@email.com | 123456 |
| Maria Souza | maria@email.com | 123456 |

> Também é possível criar uma nova conta diretamente pelo app na tela de Cadastro.

---

## 📱 Telas do Aplicativo

### 1. Login
Tela inicial com campos de email e senha. Possui toggle para mostrar/esconder a senha e dica com as credenciais de demonstração.

### 2. Cadastro
Permite criar uma nova conta com nome, email e senha. Inclui validação de todos os campos e confirmação de senha.

### 3. Dashboard
Tela principal com 4 cards expansíveis (acordeão com animação):
- **Progresso de Hoje** — barra de progresso e % de conclusão
- **Sequências Ativas** — ranking de streaks por hábito com 🔥
- **Esta Semana** — mini gráfico de barras dos últimos 7 dias
- **Estatísticas (30 dias)** — taxa de conclusão por hábito

### 4. Hoje (Lista de Hábitos)
FlatList com todos os hábitos do dia. Cada card mostra:
- Ícone e nome do hábito
- 7 pontinhos do histórico semanal
- Streak atual (🔥 dias consecutivos)
- Botão de check para marcar/desmarcar no dia

Inclui campo de busca e filtros (Todos / Pendentes / Concluídos).

### 5. Novo Hábito
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
- Foto de perfil gerada automaticamente com as iniciais do usuário
- Barra de progresso do dia
- Toggle de tema claro/escuro
- Estatísticas de hoje (total, pendentes, feitos)
- Informações do aplicativo
- Botão de logout com confirmação

---

## 🔒 Segurança Implementada

- Todos os inputs são **validados e sanitizados** antes de salvar (remoção de tags HTML, limite de caracteres)
- **Senhas nunca são salvas** no AsyncStorage — apenas nome e email
- Logs de debug só aparecem em modo de desenvolvimento (`__DEV__`)
- Cores e emojis são validados antes de serem aplicados nos estilos

---

## 👨‍💻 Desenvolvido por

Eduardo Martins Da Silva  
Disciplina: Desenvolvimento de Aplicativos Mobile  
Ano: 2025
