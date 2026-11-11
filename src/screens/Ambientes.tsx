import { router, useLocalSearchParams } from '../nav';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { T } from '../components/ui';
import { useProjeto } from '../lib/store';
import { useTema } from '../lib/theme';

export default function Ambientes() {
  const t = useTema();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useProjeto(id);
  if (!p) return null;
  const ambientes = [...new Set(p.roteiro.map(f => f.ambiente))];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 48 }}>
      <T v="sub">Toque em uma foto para ver as instruções e fotografar.</T>
      {ambientes.map(a => {
        const fotos = p.roteiro.map((f, i) => ({ f, i })).filter(x => x.f.ambiente === a);
        const ok = fotos.filter(x => p.fotos[x.f.key]).length;
        return (
          <View key={a} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="h2">{a}</T>
              <T v="sub" estilo={{ color: ok === fotos.length ? t.ok : t.muted }}>{ok}/{fotos.length}</T>
            </View>
            {fotos.map(({ f, i }) => {
              const c = p.fotos[f.key];
              return (
                <Pressable key={f.key} onPress={() => router.push(`/projeto/${p.id}/foto?i=${i}`)}
                  style={[s.row, { backgroundColor: t.card, borderColor: c ? t.ok : t.line }]}>
                  {c ? <Image source={{ uri: c.uri }} style={s.thumb} /> : (
                    <View style={[s.thumb, { backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ color: t.muted, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{String(i + 1).padStart(2, '0')}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <T v="h3" linhas={1}>{f.titulo}</T>
                    <T v="sub">{f.angulo} · zoom {f.zoom}</T>
                  </View>
                  <Text style={{ color: c ? t.ok : t.muted, fontSize: 18 }}>{c ? '✓' : '›'}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 10 },
  thumb: { width: 64, height: 48, borderRadius: 8 },
});
