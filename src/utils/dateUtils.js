/**
 * dateUtils.js — Utilitários de data para o habit tracker.
 *
 * Centralizei tudo que envolve data nesse arquivo. Assim, se um dia eu
 * precisar mudar o formato de alguma coisa, altero só aqui.
 *
 * A principal decisão foi usar o formato 'YYYY-MM-DD' como chave no
 * histórico dos hábitos (ex: history['2025-04-23'] = true).
 * Esse formato é ótimo porque:
 *  - Pode ser comparado e ordenado como string normal
 *  - É o padrão internacional ISO 8601
 *  - É fácil de ler e debugar
 *
 * ATENÇÃO: usei os métodos locais de Date (getFullYear, getMonth, getDate)
 * em vez de toISOString(), porque o toISOString() retorna a data em UTC,
 * o que pode causar bugs para usuários em fusos com diferença de horas
 * (ex: meia-noite no Brasil ainda é dia anterior em UTC+0).
 */

export const DateUtils = {

  /**
   * Converte um objeto Date para string no formato 'YYYY-MM-DD'.
   * Usa a data local do usuário, não UTC.
   */
  formatKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() começa em 0
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /** Retorna a chave de hoje no formato 'YYYY-MM-DD'. */
  todayKey() {
    return this.formatKey(new Date());
  },

  /** Retorna a chave de N dias atrás no formato 'YYYY-MM-DD'. */
  daysAgoKey(n) {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return this.formatKey(date);
  },

  /**
   * Retorna um array com os últimos N dias, do mais antigo para o mais novo.
   * Índice 0 = N-1 dias atrás | último índice = hoje.
   *
   * Uso esse método no HabitCard (últimos 7 dias como pontinhos)
   * e no Dashboard (gráfico de barras semanal).
   *
   * Cada objeto no array tem:
   *  - key: 'YYYY-MM-DD' (para buscar no history do hábito)
   *  - date: objeto Date
   *  - isToday: true só para o último elemento
   *  - dayName: 'seg', 'ter', etc.
   *  - dayNumber: número do dia do mês (ex: 23)
   *  - monthName: 'jan', 'fev', etc.
   */
  lastNDays(n) {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        key: this.formatKey(date),
        date,
        isToday: i === 0,
        dayName: date
          .toLocaleDateString('pt-BR', { weekday: 'short' })
          .replace('.', ''),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('pt-BR', { month: 'short' }),
      });
    }
    return days;
  },

  /**
   * Transforma uma chave 'YYYY-MM-DD' em texto amigável para o usuário.
   * Exibe 'Hoje', 'Ontem' ou a data curta ('23 abr').
   *
   * O '+T12:00:00' no parse é um truque para evitar o problema de timezone:
   * se eu criasse o Date só com a string 'YYYY-MM-DD', o JavaScript
   * interpretaria como meia-noite UTC e poderia mostrar o dia errado.
   */
  humanize(dateKey) {
    const today = this.todayKey();
    const yesterday = this.daysAgoKey(1);
    if (dateKey === today) return 'Hoje';
    if (dateKey === yesterday) return 'Ontem';
    const date = new Date(dateKey + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  },

  /**
   * Retorna o nome do dia da semana por extenso em português.
   * Ex: 'quinta-feira', 'segunda-feira'.
   * Uso na HomeScreen como saudação do dia.
   */
  fullDayName() {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  },

  /**
   * Retorna a data de hoje formatada por extenso.
   * Ex: '23 de abril de 2025'.
   * Uso no cabeçalho do Dashboard.
   */
  todayFormatted() {
    return new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  },

  /**
   * Calcula o número do dia no ano atual (1 a 366).
   * Uso para selecionar a frase motivacional do dia no Dashboard:
   * cada dia do ano exibe uma frase diferente de forma determinística.
   */
  dayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  },
};
