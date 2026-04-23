/**
 * habitService.js — Lógica de negócio para os hábitos.
 *
 * Optei por separar os cálculos mais complexos das telas e do contexto,
 * seguindo uma separação de responsabilidades básica:
 *  - Telas: só apresentam dados e capturam interações do usuário
 *  - AppContext: gerencia o estado e a persistência
 *  - HabitService: faz os cálculos e retorna resultados prontos para exibir
 *
 * Nenhuma chamada de UI aqui — só funções puras que recebem dados
 * e retornam números, arrays ou strings.
 *
 * Conceitos implementados:
 *  - Streak: sequência de dias consecutivos com o hábito concluído
 *  - Completion rate: porcentagem de conclusão nos últimos 30 dias
 *  - Daily aggregates: agrupamento por dia para o gráfico semanal
 */
import { DateUtils } from '../utils/dateUtils';

export const HabitService = {

  /**
   * Verifica se o hábito já foi marcado como feito hoje.
   * Simples: só verifica se history[chave-de-hoje] === true.
   */
  isCompletedToday(habit) {
    return habit.history[DateUtils.todayKey()] === true;
  },

  /**
   * Calcula o streak atual: quantos dias consecutivos o hábito foi feito.
   *
   * A lógica que decidi usar:
   *  - Se hoje JÁ foi marcado: conta de hoje para trás
   *  - Se hoje AINDA NÃO foi marcado: conta de ontem para trás
   *    (assim o streak não "quebra" só porque ainda não é fim do dia)
   *
   * O loop vai até 365 para evitar travar em históricos muito antigos.
   */
  calculateStreak(history) {
    if (!history || Object.keys(history).length === 0) return 0;

    const today = DateUtils.todayKey();
    // Se hoje não foi marcado, começo a contar do dia anterior
    let startOffset = history[today] === true ? 0 : 1;

    let streak = 0;
    for (let i = startOffset; i < 365; i++) {
      const key = DateUtils.daysAgoKey(i);
      if (history[key] === true) {
        streak++;
      } else {
        // Qualquer dia não feito quebra a sequência
        break;
      }
    }
    return streak;
  },

  /**
   * Calcula o maior streak já alcançado em todo o histórico do hábito.
   *
   * Pego todos os dias marcados como true, ordeno em ordem crescente
   * e percorro verificando se dias consecutivos têm diferença de 1 dia.
   * O formato YYYY-MM-DD permite ordenar como string normalmente.
   */
  calculateLongestStreak(history) {
    if (!history) return 0;

    const doneDays = Object.keys(history)
      .filter((k) => history[k] === true)
      .sort(); // funciona porque o formato YYYY-MM-DD é ordenável lexicograficamente

    if (doneDays.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < doneDays.length; i++) {
      // O +T12:00:00 evita o problema de timezone (veja dateUtils.js)
      const prev = new Date(doneDays[i - 1] + 'T12:00:00');
      const curr = new Date(doneDays[i] + 'T12:00:00');
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Dias consecutivos: incrementa a sequência atual
        current++;
        if (current > longest) longest = current;
      } else {
        // Quebrou a sequência: reinicia o contador
        current = 1;
      }
    }
    return longest;
  },

  /**
   * Retorna os dados dos últimos 7 dias com status de conclusão.
   * Uso nos pontinhos do HabitCard para mostrar o histórico visual da semana.
   */
  getWeeklyData(history) {
    return DateUtils.lastNDays(7).map((day) => ({
      ...day,
      completed: history[day.key] === true,
    }));
  },

  /**
   * Calcula a taxa de conclusão dos últimos 30 dias (0 a 100%).
   *
   * Uso base fixa de 30 dias para todos os hábitos, independentemente
   * de quando foram criados. Isso torna a comparação entre hábitos justa.
   */
  getCompletionRate(history) {
    if (!history) return 0;
    const last30 = DateUtils.lastNDays(30);
    const done = last30.filter((d) => history[d.key] === true).length;
    return Math.round((done / 30) * 100);
  },

  /**
   * Agrega quantos hábitos foram concluídos em cada dia dos últimos N dias.
   * Usado pelo DashboardScreen para desenhar o mini gráfico de barras semanal.
   *
   * Retorna um array onde cada elemento tem:
   *  - completed: quantidade de hábitos feitos naquele dia
   *  - total: total de hábitos existentes
   *  - percent: porcentagem de conclusão (0-100)
   */
  getDailyAggregates(habits, nDays = 7) {
    const days = DateUtils.lastNDays(nDays);
    return days.map((day) => ({
      ...day,
      completed: habits.filter((h) => h.history[day.key] === true).length,
      total: habits.length,
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
   * Estatísticas do dia de hoje: quantos hábitos foram feitos, o total
   * e o percentual de conclusão. Usado no Dashboard e na HomeScreen.
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
   * Uso na tela de detalhes do hábito para montar o calendário de histórico.
   */
  getHistoryDays(history, nDays = 21) {
    return DateUtils.lastNDays(nDays).map((day) => ({
      ...day,
      completed: history[day.key] === true,
    }));
  },

  /**
   * Retorna uma mensagem motivacional baseada no % de conclusão do dia.
   * Coloquei mensagens diferentes para cada faixa para evitar que o usuário
   * ignore por ver sempre a mesma coisa.
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
