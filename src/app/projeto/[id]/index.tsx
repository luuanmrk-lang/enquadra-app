import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Barra, Botao, Cartao, corStatus, Pilula, T } from '../../../components/ui';
import { PLANOS, PREPARO } from '../../../lib/roteiro';
import { progresso, STATUS_LABEL, useProjeto, useStore } from '../../../lib/store';
import { useTema } from '../../../lib/theme';

export default function ProjetoHub() {
  const t = useTema();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useProjeto(id);
  const { atualizar, excluir } = useStore();
  if (!p) return <View style={{ padding: 16 }}><T v="sub">Projeto não encontrado.</T></View>;

  const pr = progresso(p);
  const prep = PREPARO.every(i => p.preparo[i.key]);
  const c = corStatus(t, p.status);
  const plano = PLANOS.find(x => x.id === p.plano)!;
  const proxima = p.roteiro.findIndex(f => !p.fotos[f.key]);

  function continuar() {
    if (p!.status === 'agendado') atualizar(p!.id, { status: 'em_captura' });
    if (!prep) router.push(`/projeto/${p!.id}/preparo`);
    else router.push(`/projeto/${p!.id}/foto?i=${Math.max(0, proxima)}`);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}>
      <View style={{ gap: 6 }}>
        <Pilula texto={STATUS_LABEL[p.status]} bg={c.bg} fg={c.fg} />
        <T v="titulo">{p.ref}</T>
        <T v="sub">{p.tipo} · Plano {plano.nome} · {p.endereco || 'sem endereço'}{p.corretor ? ` · ${p.corretor}` : ''}</T>
        {p.agendadoPara ? <T v="sub">📅 {new Date(p.agendadoPara).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</T> : null}
      </View>

      <Cartao>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T v="h3">Progresso</T><T v="sub">{pr.feitas}/{pr.total} fotos</T>
        </View>
        <Barra pct={pr.pct} />
        {pr.feitas < pr.total
          ? <Botao titulo={p.status === 'agendado' ? 'Iniciar sessão agora' : pr.feitas ? 'Continuar fotografando' : prep ? 'Começar a fotografar' : 'Começar pelo plano de captura'} onPress={continuar} />
          : <Botao titulo="Revisar fotos" onPress={() => router.push(`/projeto/${p.id}/revisao`)} />}
      </Cartao>

      <Cartao estilo={{ gap: 4 }}>
        <Botao variante="secundario" titulo={`Plano de captura ${prep ? '✓' : ''}`} onPress={() => router.push(`/projeto/${p.id}/preparo`)} />
        <Botao variante="secundario" titulo="Ambientes e fotos" onPress={() => router.push(`/projeto/${p.id}/ambientes`)} estilo={{ marginTop: 8 }} />
        <Botao variante="secundario" titulo="Revisão" onPress={() => router.push(`/projeto/${p.id}/revisao`)} estilo={{ marginTop: 8 }} />
      </Cartao>

      <Botao variante="perigo" titulo="Excluir projeto" onPress={() => Alert.alert('Excluir projeto?', 'O projeto e todas as fotos dele serão apagados deste celular. Não dá para desfazer.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => { excluir(p.id); router.back(); } },
      ])} />
    </ScrollView>
  );
}
