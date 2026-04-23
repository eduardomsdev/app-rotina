/**
 * habitService.js — Lógica de negócio para hábitos.
 *
 * Separa cálculos complexos do contexto e das telas (boas práticas de arquitetura).
 * Nenhuma chamada de UI aqui — apenas funções puras que recebem dados e retornam resultados.
 *
 * Conceitos implementados:
 *  - Streak: sequência de dias consecutivos com o hábito concluído
 *  - Completion rate: taxa de conclusão dos últimos 30 dias
 *  - Weekly aggregates: quantos hábitos foram feitos em cada dia da semana
 */
import { DateUtils } from '../utils/dateUtils';

export const HabitService = {
  /**
   * Verifica se o hábito foi marcado como concluído hoje.
   */
  isCompletedToday(habit) {
    return habit.history[DateUtils.todayKey()] === true;
  },

  /**
   * Calcula a sequência atual (streak) de dias consecutivos.
   *
   * Regra:
   *  - Se hoje foi concluído: conta de hoje para trás enquanto houver dias consecutivos.
   *  - Se hoje NÃO foi concluído ainda: conta de ontem para trás
   *    (damos a chance de completar hoje sem "quebrar" o streak).
   *
   * Limite de busca: 365 dias (evita loop infinito em históricos antigos).
   */
  calculateStreak(history) {
    if (!history || Object.keys(history).length === 0) return 0;

    const today = DateUtils.todayKey();
    // Se hoje não foi feito, começamos a contar do dia anterior
    let startOffset = history[today] === true ? 0 : 1;

    let streak = 0;
    for (let i = startOffset; i < 365; i++) {
      const key = DateUtils.daysAgoKey(i);
      if (history[key] === true) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  /**
   * Calcula o maior streak já atingido no histórico completo do hábito.
   * Percorre todas as datas marcadas como 'true' em ordem cronológica.
   */
  calculateLongestStreak(history) {
    if (!history) return 0;

    const doneDays = Object.keys(history)
      .filter((k) => history[k] === true)
      .sort(); // ordena lexicograficamente (funciona com 'YYYY-MM-DD')

    if (doneDays.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < doneDays.length; i++) {
      const prev = new Date(doneDays[i - 1] + 'T12:00:00');
      const curr = new Date(doneDays[i] + 'T12:00:00');
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 1;
      }
    }
    return longest;
  },

  /**
   * Retorna os dados dos últimos 7 dias para exibição no HabitCard.
   * Cada elemento indica se o hábito foi feito naquele dia.
   */
  getWeeklyData(history) {
    return DateUtils.lastNDays(7).map((day) => ({
      ...day,
      completed: history[day.key] === true,
    }));
  },

  /**
   * Taxa de conclusão dos últimos 30 dias (0 a 100).
   * Base fixa de 30 dias (não o total de dias desde a criação do hábito)
   * para comparabilidade entre hábitos de idades diferentes.
   */
  getCompletionRate(history) {
    if (!history) return 0;
    const last30 = DateUtils.lastNDays(30);
    const done = last30.filter((d) => history[d.key] === true).length;
    return Math.round((done / 30) * 100);
  },

  /**
   * Agrupa quantos hábitos foram concluídos em cada um dos últimos N dias.
   * Usado pelo Dashboard para o gráfico de barras semanal.
   */
  getDailyAggregates(habits, nDays = 7) {
    const days = DateUtils.lastNDays(nDays);
    return days.map((day) => ({
      ...day,
      completed: habits.filter((h) => h.history[day.key] === true).length,
      total: habits.length,
      // Percentual de conclusão naquele dia (0-100)
      percent:
        habits.length > 0
          ? Math.round(
              (habits.filter((h) => h.history[day.key] === true).length /
                habits.length) *
                100
            )
          : 0,
    }));
  },

  /**
   * Estatísticas de hoje: concluídos, total e percentual.
   * Ponto central de dados para o Dashboard e HomeScreen.
   */
  getTodayStats(habits) {
    const today = DateUtils.todayKey();
    const completed = habits.filter((h) => h.history[today] === true).length;
    const total = habits.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  },

  /**
   * Retorna os dados dos últimos N dias com status de conclusão.
   * Usado para o calendário de histórico na tela de detalhe do hábito.
   */
  getHistoryDays(history, nDays = 21) {
    return DateUtils.lastNDays(nDays).map((day) => ({
      ...day,
      completed: history[day.key] === true,
    }));
  },

  /**
   * Retorna uma mensagem motivacional baseada no percentual de conclusão do dia.
   * Mensagens diferentes evitam que o usuário as ignore por repetição.
   */
  getMotivationMessage(percent) {
    if (percent === 100) return '🏆 Perfeito! Dia completo!';
    if (percent >= 75) return '💪 Ótimo progresso! Quase lá!';
    if (percent >= 50) return '🚀 Na metade do caminho!';
    if (percent >= 25) return '🌱 Bom começo, continue!';
    if (percent > 0) return '⚡ Cada passo conta!';
    return '☀️ Comece seu primeiro hábito de hoje!';
  },
};
