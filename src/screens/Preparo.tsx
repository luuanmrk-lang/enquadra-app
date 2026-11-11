import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from '../nav';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao, T } from '../components/ui';
import { PREPARO } from '../lib/roteiro';
import { useProjeto, useStore } from '../lib/store';
import { useTema } from '../lib/theme';

export default function Preparo() {
  const t = useTema();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useProjeto(id);
  const { atualizar } = useStore();
  if (!p) return null;
  const feitos = PREPARO.filter(i => p.preparo[i.key]).length;
  const tudo = feitos === PREPARO.length;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
      <T v="titulo">Antes de fotografar</T>
      <T v="sub">Marque cada item. O botão para começar só libera com tudo pronto: preparo bem feito vale mais que qualquer edição.</T>
      <View style={[s.lista, { backgroundColor: t.card, borderColor: t.line }]}>
        {PREPARO.map((i, n) => {
          const on = !!p.preparo[i.key];
          return (
            <Pressable key={i.key} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); atualizar(p.id, { preparo: { ...p.preparo, [i.key]: !on } }); }}
              style={[s.item, n > 0 && { borderTopWidth: 1, borderTopColor: t.line }]}>
              <View style={[s.check, { borderColor: on ? t.accent : t.muted, backgroundColor: on ? t.accent : 'transparent' }]}>
                {on ? <Text style={{ color: t.accentInk, fontWeight: '900' }}>✓</Text> : null}
              </View>
              <Text style={{ flex: 1, fontSize: 15, color: t.ink, textDecorationLine: on ? 'line-through' : 'none', opacity: on ? 0.6 : 1 }}>{i.texto}</Text>
            </Pressable>
          );
        })}
      </View>
      <T v="mini">{feitos} de {PREPARO.length} itens</T>
      <Botao titulo="Comece a fotografar" desativado={!tudo} onPress={() => {
        const i = p.roteiro.findIndex(f => !p.fotos[f.key]);
        router.replace(`/projeto/${p.id}/foto?i=${Math.max(0, i)}`);
      }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  lista: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 56 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
