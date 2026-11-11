import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Status } from '../lib/store';
import { Tema, useTema } from '../lib/theme';

export function Botao({ titulo, onPress, variante = 'primario', desativado, carregando, estilo }: {
  titulo: string; onPress?: () => void; variante?: 'primario' | 'secundario' | 'perigo' | 'texto';
  desativado?: boolean; carregando?: boolean; estilo?: ViewStyle;
}) {
  const t = useTema();
  const bg = variante === 'primario' ? t.accent : variante === 'perigo' ? t.badSoft : variante === 'texto' ? 'transparent' : t.card;
  const fg = variante === 'primario' ? t.accentInk : variante === 'perigo' ? t.bad : variante === 'texto' ? t.accent : t.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!desativado }}
      onPress={desativado || carregando ? undefined : onPress}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderColor: variante === 'secundario' ? t.line : 'transparent', opacity: desativado ? 0.45 : pressed ? 0.8 : 1 },
        estilo,
      ]}>
      {carregando ? <ActivityIndicator color={fg} /> : <Text style={[s.btnTxt, { color: fg }]}>{titulo}</Text>}
    </Pressable>
  );
}

export function Cartao({ children, estilo }: { children: React.ReactNode; estilo?: ViewStyle }) {
  const t = useTema();
  return <View style={[s.card, { backgroundColor: t.card, borderColor: t.line }, estilo]}>{children}</View>;
}

export function T({ children, v = 'corpo', estilo, linhas }: {
  children: React.ReactNode; v?: 'titulo' | 'h2' | 'h3' | 'corpo' | 'sub' | 'mini'; estilo?: TextStyle; linhas?: number;
}) {
  const t = useTema();
  const base: Record<string, TextStyle> = {
    titulo: { fontSize: 26, fontWeight: '800', color: t.ink, letterSpacing: -0.3 },
    h2: { fontSize: 19, fontWeight: '700', color: t.ink },
    h3: { fontSize: 16, fontWeight: '700', color: t.ink },
    corpo: { fontSize: 15, color: t.ink, lineHeight: 21 },
    sub: { fontSize: 14, color: t.muted, lineHeight: 20 },
    mini: { fontSize: 12, color: t.muted, fontWeight: '600' },
  };
  return <Text numberOfLines={linhas} style={[base[v], estilo]}>{children}</Text>;
}

export function Barra({ pct }: { pct: number }) {
  const t = useTema();
  return (
    <View style={[s.barra, { backgroundColor: t.line }]}>
      <View style={{ width: `${Math.round(pct * 100)}%`, height: '100%', backgroundColor: t.accent, borderRadius: 99 }} />
    </View>
  );
}

export function corStatus(t: Tema, st: Status) {
  if (st === 'agendado') return { bg: t.warnSoft, fg: t.warn };
  if (st === 'em_captura') return { bg: t.accentSoft, fg: t.accent };
  return { bg: t.okSoft, fg: t.ok };
}

export function Pilula({ texto, bg, fg }: { texto: string; bg: string; fg: string }) {
  return <Text style={[s.pill, { backgroundColor: bg, color: fg }]}>{texto}</Text>;
}

export function Opcao({ texto, sub, ativo, onPress, estilo }: { texto: string; sub?: string; ativo: boolean; onPress: () => void; estilo?: ViewStyle }) {
  const t = useTema();
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: ativo }}
      style={[s.opcao, { borderColor: ativo ? t.accent : t.line, backgroundColor: ativo ? t.accentSoft : t.card }, estilo]}>
      <Text style={{ fontWeight: '700', fontSize: 15, color: ativo ? t.accent : t.ink }}>{texto}</Text>
      {sub ? <Text style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>{sub}</Text> : null}
    </Pressable>
  );
}

export function Contador({ rotulo, valor, onChange, min = 0, max = 6 }: { rotulo: string; valor: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const t = useTema();
  const b = (txt: string, d: number) => (
    <Pressable onPress={() => onChange(Math.max(min, Math.min(max, valor + d)))} accessibilityLabel={`${d > 0 ? 'Aumentar' : 'Diminuir'} ${rotulo}`}
      style={[s.cBtn, { borderColor: t.line, backgroundColor: t.card }]}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: t.ink }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={s.contador}>
      <Text style={{ flex: 1, fontSize: 15, color: t.ink }}>{rotulo}</Text>
      {b('−', -1)}
      <Text style={{ width: 34, textAlign: 'center', fontSize: 17, fontWeight: '700', color: t.ink, fontVariant: ['tabular-nums'] }}>{valor}</Text>
      {b('+', 1)}
    </View>
  );
}

const s = StyleSheet.create({
  btn: { minHeight: 50, borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnTxt: { fontSize: 16, fontWeight: '700' },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  barra: { height: 8, borderRadius: 99, overflow: 'hidden' },
  pill: { fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, overflow: 'hidden', alignSelf: 'flex-start' },
  opcao: { borderWidth: 1.5, borderRadius: 12, padding: 14 },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  cBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
