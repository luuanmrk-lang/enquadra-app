import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Botao, Cartao, T } from '../../../components/ui';
import { progresso, useProjeto, useStore } from '../../../lib/store';
import { useTema } from '../../../lib/theme';

export default function Revisao() {
  const t = useTema();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useProjeto(id);
  const { atualizar } = useStore();
  const [aberta, setAberta] = useState<string | null>(null);
  if (!p) return null;

  const pr = progresso(p);
  const faltando = p.roteiro.map((f, i) => ({ f, i })).filter(x => !p.fotos[x.f.key]);
  const feitas = p.roteiro.map((f, i) => ({ f, i })).filter(x => p.fotos[x.f.key]);
  const min = p.inicioCaptura && p.fimCaptura ? Math.max(1, Math.round((p.fimCaptura - p.inicioCaptura) / 60000)) : null;
  const col = (width - 32 - 10) / 2;
  const fotoAberta = aberta ? p.fotos[aberta] : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}>
      <T v="titulo">{p.ref}</T>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Cartao estilo={{ flex: 1, gap: 2 }}><T v="titulo">{pr.feitas}/{pr.total}</T><T v="sub">fotos</T></Cartao>
        <Cartao estilo={{ flex: 1, gap: 2 }}><T v="titulo">{min ?? '–'}{min ? ' min' : ''}</T><T v="sub">tempo de captura</T></Cartao>
      </View>

      {faltando.length ? (
        <Cartao>
          <T v="h3">Faltam {faltando.length} fotos</T>
          {faltando.slice(0, 6).map(({ f, i }) => (
            <Pressable key={f.key} onPress={() => router.push(`/projeto/${p.id}/foto?i=${i}`)}>
              <Text style={{ color: t.accent, fontSize: 15, paddingVertical: 4 }}>{String(i + 1).padStart(2, '0')} · {f.titulo} ›</Text>
            </Pressable>
          ))}
          {faltando.length > 6 ? <T v="sub">e mais {faltando.length - 6}…</T> : null}
        </Cartao>
      ) : null}

      <Cartao>
        <T v="h3">Edição</T>
        {p.status === 'enviado' ? (
          <T v="sub">Enviado em {new Date(p.enviadoEm!).toLocaleString('pt-BR')}. As fotos editadas aparecerão aqui ao lado das originais.</T>
        ) : (
          <>
            <T v="sub">Ao enviar, as fotos vão para a edição profissional: luz, cor, verticais e céu. A edição automática entra na próxima versão do app.</T>
            <Botao titulo="Enviar para edição" desativado={faltando.length > 0} onPress={() => Alert.alert('Enviar para edição?', `${pr.feitas} fotos de ${p.ref}.`, [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Enviar', onPress: () => atualizar(p.id, { status: 'enviado', enviadoEm: Date.now() }) },
            ])} />
            {faltando.length ? <T v="mini">Complete o roteiro para enviar.</T> : null}
          </>
        )}
      </Cartao>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {feitas.map(({ f, i }) => (
          <Pressable key={f.key} onPress={() => setAberta(f.key)} style={{ width: col }}>
            <Image source={{ uri: p.fotos[f.key].uri }} style={{ width: col, height: col * 0.75, borderRadius: 10, backgroundColor: t.line }} />
            <Text style={{ fontSize: 12, color: t.muted, marginTop: 4 }} numberOfLines={1}>{String(i + 1).padStart(2, '0')} · {f.titulo}</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={!!fotoAberta} transparent animationType="fade" onRequestClose={() => setAberta(null)} supportedOrientations={['portrait', 'landscape']}>
        <Pressable style={s.full} onPress={() => setAberta(null)}>
          {fotoAberta ? <Image source={{ uri: fotoAberta.uri }} style={{ width: '100%', height: '80%' }} resizeMode="contain" /> : null}
          <Text style={{ color: '#fff', marginTop: 12 }}>Toque para fechar</Text>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  full: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
});
