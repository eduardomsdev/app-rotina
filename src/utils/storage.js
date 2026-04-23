/**
 * storage.js — Utilitário para o AsyncStorage.
 *
 * Abstrai a serialização/deserialização JSON e o tratamento de erros,
 * para que o AppContext não precise lidar com esses detalhes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  // Salva qualquer valor convertendo para JSON
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao salvar "${key}":`, error);
      return false;
    }
  },

  // Lê e converte de JSON automaticamente; retorna null se não existir
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`[Storage] Erro ao ler "${key}":`, error);
      return null;
    }
  },

  // Remove um item do storage
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[Storage] Erro ao remover "${key}":`, error);
      return false;
    }
  },

  // Apaga todos os dados do storage (usar com cuidado)
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('[Storage] Erro ao limpar storage:', error);
      return false;
    }
  },
};
