import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../lib/store';
import { useTema } from '../lib/theme';

export default function Layout() {
  const t = useTema();
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: t.bg },
            headerTintColor: t.ink,
            headerShadowVisible: false,
            headerBackTitle: 'Voltar',
            contentStyle: { backgroundColor: t.bg },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="novo" options={{ title: 'Novo projeto' }} />
          <Stack.Screen name="projeto/[id]/index" options={{ title: 'Projeto' }} />
          <Stack.Screen name="projeto/[id]/preparo" options={{ title: 'Plano de captura' }} />
          <Stack.Screen name="projeto/[id]/ambientes" options={{ title: 'Ambientes' }} />
          <Stack.Screen name="projeto/[id]/foto" options={{ title: 'Foto' }} />
          <Stack.Screen name="projeto/[id]/camera" options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="projeto/[id]/revisao" options={{ title: 'Revisão' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
