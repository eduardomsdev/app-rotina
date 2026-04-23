/**
 * DashboardScreen.js — Tela 3: Dashboard com visão geral dos hábitos.
 *
 * Essa tela é a mais visual do app. A ideia foi dar ao usuário um painel
 * completo com diferentes perspectivas sobre seus hábitos, sem precisar
 * navegar para outras telas.
 *
 * Usei o componente DashboardCard (acordeão) para organizar as informações
 * em seções expansíveis, deixando a tela mais limpa e evitando sobrecarga visual.
 *
 * Os 4 cards do Dashboard:
 *  1. "Progresso de Hoje" — % de conclusão com barra de progresso (aberto por padrão)
 *  2. "Sequências Ativas" — ranking de streaks por hábito com badge 🔥
 *  3. "Esta Semana" — mini gráfico de barras dos últimos 7 dias
 *  4. "Estatísticas (30 dias)" — taxa de conclusão e recorde de cada hábito
 *
 * A frase motivacional no topo muda a cada dia (baseada no número do dia do ano),
 * então o usuário sempre vê uma mensagem diferente ao abrir o app.
 *
 * Componentes RN utilizados: View, Text, ScrollView
 */
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/themes';
import { HabitService } from '../services/habitService';
import { DateUtils } from '../utils/dateUtils';
import DashboardCard from '../components/DashboardCard';

// Frases motivacionais — rotação diária baseada no número do dia do ano
const QUOTES = [
  'A consistência transforma o esforço em resultado.',
  'Cada dia é uma nova oportunidade de crescer.',
  'Pequenos hábitos constroem grandes conquistas.',
  'O progresso importa mais do que a perfeição.',
  'Construa hábitos, construa seu futuro.',
  'Discipline é a ponte entre metas e realizações.',
  'Comece pequeno, pense grande, aja agora.',
];

export default function DashboardScreen() {
  const { habits, user, theme } = useApp();
  const colors = getTheme(theme);

  // Dados calculados pelo HabitService para os cards
  const stats = HabitService.getTodayStats(habits);
  const weeklyData = HabitService.getDailyAggregates(habits, 7);
  const motivationMsg = HabitService.getMotivationMessage(stats.percent);

  // Seleciona a frase do dia: índice = dia do ano % quantidade de frases
  // Isso garante que a frase muda todo dia, mas de forma determinística
  const dailyQuote = QUOTES[DateUtils.dayOfYear() % QUOTES.length];

  const styles = createStyles(colors);

  // ─── Conteúdo do card "Progresso de Hoje" ────────────────────────────────
  const TodayContent = () => (
    <View>
      <View style={styles.progressRow}>
        {/* Número grande em destaque no lado esquerdo */}
        <View style={styles.percentBox}>
          <Text style={[styles.percentNumber, { color: colors.primary }]}>
            {stats.percent}%
          </Text>
          <Text style={styles.percentLabel}>concluído</Text>
        </View>

        {/* Detalhes à direita: feitos, pendentes e mensagem motivacional */}
        <View style={styles.progressDetails}>
          <Text style={styles.progressDetailText}>
            ✅ {stats.completed} hábito{stats.completed !== 1 ? 's' : ''} feito{stats.completed !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.progressDetailText}>
            ⏳ {stats.total - stats.completed} pendente{stats.total - stats.completed !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.motivationText, { color: colors.primary }]}>
            {motivationMsg}
          </Text>
        </View>
      </View>

      {/* Barra de progresso — fica verde quando 100% completo */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${stats.percent}%`,
              backgroundColor: stats.percent === 100 ? colors.success : colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );

  // ─── Conteúdo do card "Sequências Ativas" ────────────────────────────────
  const StreakContent = () => {
    // Ordena os hábitos pelo streak atual (maior streak aparece no topo)
    const sorted = [...habits]
      .map((h) => ({ ...h, streak: HabitService.calculateStreak(h.history) }))
      .sort((a, b) => b.streak - a.streak);

    if (sorted.length === 0) {
      return <Text style={styles.emptyText}>Nenhum hábito criado ainda.</Text>;
    }

    return (
      <View style={styles.streakList}>
        {sorted.map((h) => (
          <View key={h.id} style={styles.streakRow}>
            {/* Ícone do hábito com fundo suave */}
            <View style={[styles.streakIcon, { backgroundColor: h.color + '20' }]}>
              <Text style={styles.streakEmoji}>{h.icon}</Text>
            </View>
            <Text style={styles.streakName} numberOfLines={1}>
              {h.name}
            </Text>
            {/* Badge de streak — mostra 🔥 se tiver sequência ativa */}
            <View style={styles.streakBadge}>
              {h.streak > 0 ? (
                <>
                  <Text style={styles.streakFire}>🔥</Text>
                  <Text style={[styles.streakDays, { color: h.color }]}>
                    {h.streak} {h.streak === 1 ? 'dia' : 'dias'}
                  </Text>
                </>
              ) : (
                <Text style={styles.streakZero}>— início</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // ─── Conteúdo do card "Esta Semana" ──────────────────────────────────────
  const WeekContent = () => (
    <View>
      {/* Gráfico de barras simples: cada coluna representa um dia */}
      <View style={styles.weekChart}>
        {weeklyData.map((day, idx) => {
          // Altura da barra proporcional à % de conclusão daquele dia
          const fillHeight = day.total > 0 ? (day.completed / day.total) * 56 : 0;
          // Hoje fica com a cor principal, os outros dias ficam mais claros
          const barColor = day.isToday ? colors.primary : colors.primaryLight;
          return (
            <View key={idx} style={styles.weekColumn}>
              {/* Container de altura fixa — a barra cresce de baixo para cima */}
              <View style={styles.weekBarContainer}>
                {day.total > 0 && (
                  <View
                    style={[
                      styles.weekBarFill,
                      { height: Math.max(fillHeight, 4), backgroundColor: barColor },
                    ]}
                  />
                )}
              </View>
              {/* Contagem de hábitos feitos/total naquele dia */}
              <Text style={[styles.weekCount, day.isToday && { color: colors.primary, fontWeight: '700' }]}>
                {day.completed}/{day.total}
              </Text>
              {/* Nome do dia (seg, ter, qua...) — hoje em destaque */}
              <Text style={[styles.weekDayName, day.isToday && { color: colors.primary, fontWeight: '700' }]}>
                {day.dayName}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  // ─── Conteúdo do card "Estatísticas (30 dias)" ───────────────────────────
  const StatsContent = () => {
    if (habits.length === 0) {
      return <Text style={styles.emptyText}>Nenhum hábito criado ainda.</Text>;
    }

    return (
      <View style={styles.statsList}>
        {habits.map((h) => {
          const rate = HabitService.getCompletionRate(h.history);
          const longest = HabitService.calculateLongestStreak(h.history);
          return (
            <View key={h.id} style={styles.statsRow}>
              <Text style={styles.statsEmoji}>{h.icon}</Text>
              <View style={styles.statsInfo}>
                <Text style={styles.statsName} numberOfLines={1}>{h.name}</Text>
                {/* Barra de progresso com largura proporcional à taxa de conclusão */}
                <View style={styles.statsBarBg}>
                  <View
                    style={[
                      styles.statsBarFill,
                      { width: `${rate}%`, backgroundColor: h.color },
                    ]}
                  />
                </View>
              </View>
              {/* Taxa de conclusão e recorde de streak à direita */}
              <View style={styles.statsNumbers}>
                <Text style={[styles.statsRate, { color: h.color }]}>{rate}%</Text>
                <Text style={styles.statsLongest}>🏆 {longest}d</Text>
              </View>
            </View>
          );
        })}
        <Text style={styles.statsNote}>* taxa de conclusão dos últimos 30 dias</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Cabeçalho com saudação e contador de hoje ─── */}
      <View style={styles.header}>
        <View>
          {/* Pega o primeiro nome do usuário (split pelo espaço) */}
          <Text style={styles.greeting}>
            Olá, {user?.name?.split(' ')[0] || 'usuário'}! ✨
          </Text>
          <Text style={styles.date}>{DateUtils.todayFormatted()}</Text>
        </View>
        {/* Badge com o progresso do dia */}
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {stats.completed}/{stats.total}
          </Text>
          <Text style={styles.headerBadgeLabel}>hoje</Text>
        </View>
      </View>

      {/* ─── Frase motivacional do dia ─── */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteIcon}>💡</Text>
        <Text style={styles.quoteText}>{dailyQuote}</Text>
      </View>

      {/* ─── Cards expansíveis do Dashboard ─── */}

      {/* Card 1: aberto por padrão para o usuário ver o progresso imediatamente */}
      <DashboardCard
        title="Progresso de Hoje"
        icon="📊"
        summary={`${stats.completed} de ${stats.total} hábitos concluídos`}
        accentColor={colors.primary}
        defaultExpanded
      >
        <TodayContent />
      </DashboardCard>

      <DashboardCard
        title="Sequências Ativas"
        icon="🔥"
        summary="Seus dias consecutivos por hábito"
        accentColor="#FF6B6B"
      >
        <StreakContent />
      </DashboardCard>

      <DashboardCard
        title="Esta Semana"
        icon="📅"
        summary="Hábitos concluídos por dia"
        accentColor="#4ECDC4"
      >
        <WeekContent />
      </DashboardCard>

      <DashboardCard
        title="Estatísticas (30 dias)"
        icon="📈"
        summary="Taxa de conclusão de cada hábito"
        accentColor="#DDA0DD"
      >
        <StatsContent />
      </DashboardCard>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    // ─── Cabeçalho ───
    header: {
      flexDirection: 'row',       // saudação + badge lado a lado (Flexbox)
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    greeting: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    date: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    headerBadge: {
      backgroundColor: colors.primaryLight,
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
      minWidth: 56,
    },
    headerBadgeText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    },
    headerBadgeLabel: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: '600',
    },
    // ─── Frase motivacional ───
    quoteCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
      alignItems: 'center',
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    quoteIcon: {
      fontSize: 20,
    },
    quoteText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    // ─── Card "Hoje" ───
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      gap: 16,
    },
    percentBox: {
      alignItems: 'center',
      minWidth: 72,
    },
    percentNumber: {
      fontSize: 36,
      fontWeight: 'bold',
    },
    percentLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: -2,
    },
    progressDetails: {
      flex: 1,
      gap: 4,
    },
    progressDetailText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    motivationText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 8,
      borderRadius: 4,
    },
    // ─── Card "Sequências" ───
    streakList: {
      gap: 10,
    },
    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    streakIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    streakEmoji: {
      fontSize: 18,
    },
    streakName: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    streakFire: {
      fontSize: 14,
    },
    streakDays: {
      fontSize: 13,
      fontWeight: '700',
    },
    streakZero: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    // ─── Card "Semana" (gráfico de barras) ───
    weekChart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    weekColumn: {
      flex: 1,
      alignItems: 'center',
    },
    weekBarContainer: {
      height: 56,
      width: '70%',
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      justifyContent: 'flex-end', // faz a barra crescer de baixo para cima
    },
    weekBarFill: {
      width: '100%',
      borderRadius: 4,
    },
    weekCount: {
      fontSize: 9,
      color: colors.textSecondary,
      marginTop: 4,
    },
    weekDayName: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    // ─── Card "Estatísticas" ───
    statsList: {
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    statsEmoji: {
      fontSize: 20,
      width: 28,
      textAlign: 'center',
    },
    statsInfo: {
      flex: 1,
    },
    statsName: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
      marginBottom: 4,
    },
    statsBarBg: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    statsBarFill: {
      height: 6,
      borderRadius: 3,
    },
    statsNumbers: {
      alignItems: 'flex-end',
      minWidth: 44,
    },
    statsRate: {
      fontSize: 13,
      fontWeight: '700',
    },
    statsLongest: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statsNote: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 4,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 8,
    },
  });
