import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './src/lib/store';
import { useTema } from './src/lib/theme';
import { navRef, Rotas } from './src/nav';
import Ambientes from './src/screens/Ambientes';
import Camera from './src/screens/Camera';
import Foto from './src/screens/Foto';
import Home from './src/screens/Home';
import Novo from './src/screens/Novo';
import Preparo from './src/screens/Preparo';
import Projeto from './src/screens/Projeto';
import Revisao from './src/screens/Revisao';

const Pilha = createNativeStackNavigator<Rotas>();

export default function App() {
  const t = useTema();
  const escuro = useColorScheme() === 'dark';
  const base = escuro ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <NavigationContainer ref={navRef} theme={{ ...base, colors: { ...base.colors, background: t.bg, card: t.bg, text: t.ink, primary: t.accent, border: t.line } }}>
          <Pilha.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: t.bg },
              headerTintColor: t.ink,
              headerShadowVisible: false,
              headerBackTitle: 'Voltar',
              contentStyle: { backgroundColor: t.bg },
            }}>
            <Pilha.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Pilha.Screen name="Novo" component={Novo} options={{ title: 'Novo projeto' }} />
            <Pilha.Screen name="Projeto" component={Projeto} options={{ title: 'Projeto' }} />
            <Pilha.Screen name="Preparo" component={Preparo} options={{ title: 'Plano de captura' }} />
            <Pilha.Screen name="Ambientes" component={Ambientes} options={{ title: 'Ambientes' }} />
            <Pilha.Screen name="Foto" component={Foto} options={{ title: 'Foto' }} />
            <Pilha.Screen name="Camera" component={Camera} options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
            <Pilha.Screen name="Revisao" component={Revisao} options={{ title: 'Revisão' }} />
          </Pilha.Navigator>
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
