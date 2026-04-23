/**
 * dateUtils.js — Utilitários de data para o habit tracker.
 *
 * Centraliza a formatação de datas em um único lugar para que
 * qualquer mudança de formato afete todo o app consistentemente.
 *
 * Formato de chave: 'YYYY-MM-DD' (ISO 8601, sem timezone)
 * Motivo: string comparável e ordenável lexicograficamente.
 */

export const DateUtils = {
  /**
   * Converte um objeto Date para a chave 'YYYY-MM-DD'.
   * Usa a data local (não UTC) para garantir consistência com o fuso do usuário.
   */
  formatKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /** Chave de hoje no formato 'YYYY-MM-DD'. */
  todayKey() {
    return this.formatKey(new Date());
  },

  /** Chave para N dias atrás. */
  daysAgoKey(n) {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return this.formatKey(date);
  },

  /**
   * Retorna array com os últimos N dias (do mais antigo para o mais recente).
   * Índice 0 = (N-1) dias atrás | Último índice = hoje.
   *
   * Cada elemento contém:
   *  - key: 'YYYY-MM-DD'
   *  - date: objeto Date
   *  - isToday: boolean
   *  - dayName: 'seg', 'ter', etc.
   *  - dayNumber: número do dia do mês
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
   * Converte uma chave 'YYYY-MM-DD' para texto amigável:
   *  'Hoje', 'Ontem' ou '15 jan'.
   */
  humanize(dateKey) {
    const today = this.todayKey();
    const yesterday = this.daysAgoKey(1);
    if (dateKey === today) return 'Hoje';
    if (dateKey === yesterday) return 'Ontem';
    // Adiciona 'T12:00:00' para evitar problemas de timezone (meia-noite UTC)
    const date = new Date(dateKey + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  },

  /**
   * Retorna o nome do dia da semana por extenso.
   * Ex: 'Segunda-feira', 'Terça-feira'...
   */
  fullDayName() {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  },

  /**
   * Retorna a data de hoje formatada para exibição.
   * Ex: '23 de abril de 2025'
   */
  todayFormatted() {
    return new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  },

  /**
   * Retorna o número do dia do ano (1-366).
   * Usado para selecionar frases motivacionais de forma determinística.
   */
  dayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  },
};
