import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Barra, Cartao, corStatus, Pilula, T } from '../components/ui';
import { PLANOS } from '../lib/roteiro';
import { progresso, STATUS_LABEL, useStore } from '../lib/store';
import { useTema } from '../lib/theme';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export default function Home() {
  const t = useTema();
  const ins = useSafeAreaInsets();
  const { projetos, pronto } = useStore();
  const [menu, setMenu] = useState(false);
  const hoje = new Date();
  const [dia, setDia] = useState<Date | null>(null);

  const semana = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; }), []);
  const agendados = projetos.filter(p => p.status === 'agendado' && p.agendadoPara);
  const lista = dia ? projetos.filter(p => p.agendadoPara && mesmoDia(new Date(p.agendadoPara), dia)) : projetos;
  const ativos = projetos.filter(p => p.status === 'em_captura').length;
  const fotos = projetos.reduce((a, p) => a + Object.keys(p.fotos).length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: ins.top + 12, paddingBottom: 120, gap: 16 }}>
        <View>
          <T v="mini">ENQUADRA</T>
          <T v="titulo">Seus imóveis, bem fotografados</T>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Cartao estilo={{ flex: 1, gap: 2 }}><T v="titulo">{ativos}</T><T v="sub">em captura</T></Cartao>
          <Cartao estilo={{ flex: 1, gap: 2 }}><T v="titulo">{agendados.length}</T><T v="sub">agendados</T></Cartao>
          <Cartao estilo={{ flex: 1, gap: 2 }}><T v="titulo">{fotos}</T><T v="sub">fotos</T></Cartao>
        </View>

        <View style={[s.agenda, { backgroundColor: t.ink }]}>
          <Text style={{ color: t.bg, fontWeight: '700', marginBottom: 10 }}>{MESES[hoje.getMonth()]}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {semana.map(d => {
              const tem = agendados.some(p => mesmoDia(new Date(p.agendadoPara!), d));
              const sel = dia && mesmoDia(dia, d);
              return (
                <Pressable key={d.toISOString()} onPress={() => setDia(sel ? null : d)} accessibilityLabel={`Dia ${d.getDate()}`}
                  style={[s.dia, { backgroundColor: sel ? t.bg : 'transparent', borderColor: mesmoDia(d, hoje) ? t.accent : 'rgba(255,255,255,0.18)' }]}>
                  <Text style={{ color: sel ? t.ink : t.bg, fontSize: 18, fontWeight: '800' }}>{d.getDate()}</Text>
                  <Text style={{ color: sel ? t.muted : 'rgba(255,255,255,0.6)', fontSize: 11 }}>{DIAS[d.getDay()]}</Text>
                  <View style={{ width: 6, height: 6, borderRadius: 3, marginTop: 4, backgroundColor: tem ? t.accent : 'transparent' }} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T v="h2">{dia ? `Agendados para ${dia.getDate()}/${dia.getMonth() + 1}` : 'Seus projetos'}</T>
          {dia ? <Pressable onPress={() => setDia(null)}><T v="sub" estilo={{ color: t.accent }}>Ver todos</T></Pressable> : null}
        </View>

        {pronto && lista.length === 0 ? (
          <Cartao>
            <T v="h3">{dia ? 'Nada agendado neste dia' : 'Nenhum projeto ainda'}</T>
            <T v="sub">Toque em + para fotografar um imóvel agora ou agendar a sessão de fotos.</T>
          </Cartao>
        ) : null}

        {lista.map(p => {
          const pr = progresso(p); const c = corStatus(t, p.status);
          const plano = PLANOS.find(x => x.id === p.plano)!;
          return (
            <Pressable key={p.id} onPress={() => router.push(`/projeto/${p.id}`)}>
              <Cartao>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <T v="h3" linhas={1} estilo={{ flex: 1 }}>{p.ref}</T>
                  <Pilula texto={STATUS_LABEL[p.status]} bg={c.bg} fg={c.fg} />
                </View>
                <T v="sub" linhas={1}>{p.tipo} · Plano {plano.nome} · {p.endereco || 'sem endereço'}</T>
                {p.status === 'agendado' && p.agendadoPara ? (
                  <T v="sub">📅 {new Date(p.agendadoPara).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</T>
                ) : (
                  <>
                    <Barra pct={pr.pct} />
                    <T v="mini">{pr.feitas} de {pr.total} fotos</T>
                  </>
                )}
              </Cartao>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable onPress={() => setMenu(true)} accessibilityLabel="Novo projeto"
        style={[s.fab, { backgroundColor: t.accent, bottom: ins.bottom + 20 }]}>
        <Text style={{ color: t.accentInk, fontSize: 32, fontWeight: '400', marginTop: -2 }}>+</Text>
      </Pressable>

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={s.fundo} onPress={() => setMenu(false)}>
          <View style={[s.menu, { backgroundColor: t.card, marginBottom: ins.bottom + 90 }]}>
            <Pressable style={s.item} onPress={() => { setMenu(false); router.push('/novo?modo=agora'); }}>
              <Text style={{ fontSize: 22 }}>📷</Text>
              <View><T v="h3">Fotografar agora</T><T v="sub">Criar projeto e começar a captura</T></View>
            </Pressable>
            <View style={{ height: 1, backgroundColor: t.line }} />
            <Pressable style={s.item} onPress={() => { setMenu(false); router.push('/novo?modo=agendar'); }}>
              <Text style={{ fontSize: 22 }}>🗓️</Text>
              <View><T v="h3">Agendar projeto</T><T v="sub">Marcar a sessão de fotos para outro dia</T></View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  agenda: { borderRadius: 16, padding: 14 },
  dia: { width: 52, borderRadius: 12, borderWidth: 1, alignItems: 'center', paddingVertical: 8 },
  fab: { position: 'absolute', right: 20, width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 16 },
  menu: { borderRadius: 16, width: 300, overflow: 'hidden' },
  item: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16 },
});
