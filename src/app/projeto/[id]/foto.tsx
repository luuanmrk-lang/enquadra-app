import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ilustracao } from '../../../components/Ilustracao';
import { Botao, Cartao, T } from '../../../components/ui';
import { useProjeto, useStore } from '../../../lib/store';
import { useTema } from '../../../lib/theme';

export default function FotoDetalhe() {
  const t = useTema();
  const { width } = useWindowDimensions();
  const { id, i } = useLocalSearchParams<{ id: string; i?: string }>();
  const p = useProjeto(id);
  const { removerFoto } = useStore();
  const idxBruto = Math.max(0, Number(i) || 0);
  const chave = p?.roteiro[Math.min(idxBruto, (p?.roteiro.length ?? 1) - 1)]?.key;
  const temFoto = !!(chave && p?.fotos[chave]);
  const anterior = useRef<{ chave?: string; tinha: boolean }>({ chave, tinha: temFoto });
  const projRef = useRef(p);
  projRef.current = p;

  // Depois de capturar, mostra a foto por um instante e avança para a próxima pendente
  useEffect(() => {
    const a = anterior.current;
    const p = projRef.current;
    if (p && a.chave === chave && !a.tinha && temFoto) {
      const prox = p.roteiro.findIndex((x, n) => n > idxBruto && !p.fotos[x.key]);
      const t1 = setTimeout(() => {
        if (prox >= 0) router.setParams({ i: String(prox) });
        else router.push(`/projeto/${p.id}/revisao`);
      }, 900);
      anterior.current = { chave, tinha: temFoto };
      return () => clearTimeout(t1);
    }
    anterior.current = { chave, tinha: temFoto };
  }, [chave, temFoto, idxBruto]);

  if (!p) return null;
  const idx = Math.min(idxBruto, p.roteiro.length - 1);
  const f = p.roteiro[idx];
  const doAmbiente = p.roteiro.filter(x => x.ambiente === f.ambiente);
  const posNoAmbiente = doAmbiente.findIndex(x => x.key === f.key) + 1;
  const cap = p.fotos[f.key];
  const ir = (n: number) => router.setParams({ i: String(n) });
  const ultima = idx === p.roteiro.length - 1;

  return (
    <>
      <Stack.Screen options={{ title: f.ambiente }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T v="mini">FOTO {idx + 1} DE {p.roteiro.length}</T>
          <T v="mini">{posNoAmbiente} de {doAmbiente.length} neste ambiente</T>
        </View>

        <Cartao>
          <T v="h2">{f.titulo}</T>
          <View style={s.specs}>
            <View style={[s.spec, { backgroundColor: t.bg }]}><T v="mini">ÂNGULO</T><T v="h3">{f.angulo}</T></View>
            <View style={[s.spec, { backgroundColor: t.bg }]}><T v="mini">ZOOM</T><T v="h3">{f.zoom}</T></View>
            <View style={[s.spec, { backgroundColor: t.bg }]}><T v="mini">ALTURA</T><T v="h3">1,2–1,5 m</T></View>
          </View>
          <View style={[s.dica, { backgroundColor: t.accentSoft }]}>
            <Text style={{ color: t.accent, fontWeight: '800', fontSize: 12 }}>RECOMENDAÇÃO</Text>
            <Text style={{ color: t.ink, fontSize: 15, lineHeight: 21 }}>{f.dica}</Text>
          </View>
        </Cartao>

        <View style={[s.ilu, { backgroundColor: t.card, borderColor: t.line }]}>
          {cap ? (
            <Image source={{ uri: cap.uri }} style={{ width: '100%', aspectRatio: cap.w && cap.h ? cap.w / cap.h : 4 / 3, borderRadius: 10 }} />
          ) : (
            <Ilustracao pose={f.pose} t={t} largura={Math.min(width - 64, 420)} />
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Botao variante="secundario" titulo="← Anterior" desativado={idx === 0} onPress={() => ir(idx - 1)} estilo={{ flex: 1 }} />
          <Botao variante="secundario" titulo={ultima ? 'Revisão' : 'Próxima →'} onPress={() => (ultima ? router.push(`/projeto/${p.id}/revisao`) : ir(idx + 1))} estilo={{ flex: 1 }} />
        </View>
        <Botao titulo={cap ? 'Refazer foto' : 'Capturar'} onPress={() => router.push(`/projeto/${p.id}/camera?i=${idx}`)} />
        {cap ? <Botao variante="texto" titulo="Remover esta foto" onPress={() => Alert.alert('Remover foto?', 'Você pode fotografar de novo depois.', [
          { text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => removerFoto(p.id, f.key) },
        ])} /> : null}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  specs: { flexDirection: 'row', gap: 8 },
  spec: { flex: 1, borderRadius: 10, padding: 10, gap: 2 },
  dica: { borderRadius: 10, padding: 12, gap: 4 },
  ilu: { borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center' },
});
