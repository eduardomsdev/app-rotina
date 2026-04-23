/**
 * App.js — Ponto de entrada da aplicação
 *
 * O AppProvider envolve toda a árvore de componentes e disponibiliza
 * o estado global (usuário, tarefas, tema) via Context API.
 * O AppNavigator decide qual fluxo de telas exibir (autenticado ou não).
 */
import React from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
