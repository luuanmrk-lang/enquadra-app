// Navegação simples baseada em caminhos ("/projeto/ID/foto?i=2") sobre o React Navigation.
import { CommonActions, createNavigationContainerRef, StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useLayoutEffect } from 'react';

export type Rotas = {
  Home: undefined;
  Novo: { modo?: string };
  Projeto: { id: string };
  Preparo: { id: string };
  Ambientes: { id: string };
  Foto: { id: string; i?: string };
  Camera: { id: string; i?: string };
  Revisao: { id: string };
};

export const navRef = createNavigationContainerRef<Rotas>();

function resolver(caminho: string): { nome: keyof Rotas; params: Record<string, string> } {
  const [path, query = ''] = caminho.split('?');
  const params: Record<string, string> = {};
  for (const par of query.split('&').filter(Boolean)) {
    const [k, v = ''] = par.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  const partes = path.split('/').filter(Boolean);
  if (partes[0] === 'novo') return { nome: 'Novo', params };
  if (partes[0] === 'projeto' && partes[1]) {
    params.id = partes[1];
    const mapa: Record<string, keyof Rotas> = {
      preparo: 'Preparo', ambientes: 'Ambientes', foto: 'Foto', camera: 'Camera', revisao: 'Revisao',
    };
    return { nome: partes[2] ? mapa[partes[2]] ?? 'Projeto' : 'Projeto', params };
  }
  return { nome: 'Home', params };
}

export const router = {
  push(caminho: string) {
    if (!navRef.isReady()) return;
    const { nome, params } = resolver(caminho);
    navRef.dispatch(StackActions.push(nome, params));
  },
  replace(caminho: string) {
    if (!navRef.isReady()) return;
    const { nome, params } = resolver(caminho);
    navRef.dispatch(StackActions.replace(nome, params));
  },
  back() {
    if (navRef.isReady() && navRef.canGoBack()) navRef.goBack();
  },
  setParams(params: Record<string, string>) {
    if (navRef.isReady()) navRef.dispatch(CommonActions.setParams(params));
  },
};

export function useLocalSearchParams<T extends Record<string, string | undefined>>(): T {
  const route = useRoute();
  return (route.params ?? {}) as T;
}

// Permite que uma tela ajuste o próprio título: <Stack.Screen options={{ title }} />
function TelaOpcoes({ options }: { options: Record<string, unknown> }) {
  const nav = useNavigation();
  const chave = JSON.stringify(options);
  useLayoutEffect(() => { nav.setOptions(options); }, [nav, chave]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
export const Stack = { Screen: TelaOpcoes };
