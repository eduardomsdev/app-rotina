/**
 * App.js — Arquivo principal, ponto de entrada do aplicativo.
 *
 * Aqui eu envolvo tudo com o AppProvider, que disponibiliza o estado global
 * (usuário logado, hábitos, tema) para todas as telas via Context API.
 *
 * O AppNavigator cuida de mostrar as telas certas conforme o estado:
 * - Se o usuário está logado → mostra as abas principais
 * - Se não está logado → mostra Login/Cadastro
 */
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // AppProvider precisa envolver o Navigator para que todas as telas
    // consigam acessar o contexto global com o hook useApp()
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
