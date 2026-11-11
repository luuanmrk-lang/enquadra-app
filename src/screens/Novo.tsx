import { router, useLocalSearchParams } from '../nav';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Botao, Cartao, Contador, Opcao, T } from '../components/ui';
import { Detalhes, gerarRoteiro, PlanoId, PLANOS, Tipo } from '../lib/roteiro';
import { useStore } from '../lib/store';
import { useTema } from '../lib/theme';

const HORAS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export default function Novo() {
  const t = useTema();
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const agendar = modo === 'agendar';
  const { criar } = useStore();

  const [ref, setRef] = useState('');
  const [endereco, setEndereco] = useState('');
  const [corretor, setCorretor] = useState('');
  const [tipo, setTipo] = useState<Tipo>('Apartamento');
  const [plano, setPlano] = useState<PlanoId>('pro');
  const [d, setD] = useState<Detalhes>({ quartos: 2, suites: 1, banheiros: 1, varanda: true, servico: true, lavabo: false, vaga: true, lazer: false });
  const dias = useMemo(() => Array.from({ length: 14 }, (_, i) => { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + i); return x; }), []);
  const [dia, setDia] = useState(1);
  const [hora, setHora] = useState(10);

  const roteiro = useMemo(() => gerarRoteiro(tipo, plano, d), [tipo, plano, d]);
  const limite = PLANOS.find(p => p.id === plano)!.fotos;
  const set = (patch: Partial<Detalhes>) => setD(v => {
    const n = { ...v, ...patch };
    if (n.suites > n.quartos) n.suites = n.quartos;
    return n;
  });

  const inputStyle = [s.input, { borderColor: t.line, backgroundColor: t.card, color: t.ink }];

  function salvar() {
    if (!ref.trim()) { Alert.alert('Falta o código', 'Informe o código ou nome do imóvel.'); return; }
    let agendadoPara: number | null = null;
    if (agendar) { const x = new Date(dias[dia]); x.setHours(hora, 0, 0, 0); agendadoPara = x.getTime(); }
    const p = criar({ ref: ref.trim(), endereco: endereco.trim(), corretor: corretor.trim(), tipo, plano, detalhes: d, agendadoPara });
    if (agendar) router.back();
    else router.replace(`/projeto/${p.id}/preparo`);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <T v="titulo">{agendar ? 'Agendar projeto' : 'Fotografar agora'}</T>

        <Cartao>
          <T v="mini">IMÓVEL</T>
          <TextInput placeholder="Código ou nome (ex.: AP-1203)" placeholderTextColor={t.muted} value={ref} onChangeText={setRef} style={inputStyle} maxLength={60} />
          <TextInput placeholder="Endereço ou bairro" placeholderTextColor={t.muted} value={endereco} onChangeText={setEndereco} style={inputStyle} maxLength={100} />
          <TextInput placeholder="Corretor responsável" placeholderTextColor={t.muted} value={corretor} onChangeText={setCorretor} style={inputStyle} maxLength={60} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['Casa', 'Apartamento'] as Tipo[]).map(x => <Opcao key={x} texto={x} ativo={tipo === x} onPress={() => setTipo(x)} estilo={{ flex: 1, alignItems: 'center' }} />)}
          </View>
        </Cartao>

        <Cartao>
          <T v="mini">SELECIONE O PLANO</T>
          {PLANOS.map(p => <Opcao key={p.id} texto={`${p.nome} · ${p.fotos} fotos`} sub={p.desc} ativo={plano === p.id} onPress={() => setPlano(p.id)} />)}
        </Cartao>

        <Cartao>
          <T v="mini">AMBIENTES</T>
          <Contador rotulo="Quartos (incluindo suítes)" valor={d.quartos} onChange={n => set({ quartos: n })} />
          <Contador rotulo="Destes, suítes" valor={d.suites} max={d.quartos} onChange={n => set({ suites: n })} />
          <Contador rotulo="Banheiros sociais" valor={d.banheiros} max={4} onChange={n => set({ banheiros: n })} />
          {([['varanda', 'Varanda'], ['servico', 'Área de serviço'], ['lavabo', 'Lavabo'], ['vaga', 'Vaga de garagem'], ['lazer', 'Área de lazer']] as [keyof Detalhes, string][]).map(([k, n]) => (
            <View key={k} style={s.linha}>
              <Text style={{ flex: 1, fontSize: 15, color: t.ink }}>{n}</Text>
              <Switch value={d[k] as boolean} onValueChange={v => set({ [k]: v } as Partial<Detalhes>)} trackColor={{ true: t.accent }} />
            </View>
          ))}
        </Cartao>

        {agendar ? (
          <Cartao>
            <T v="mini">QUANDO</T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {dias.map((x, i) => (
                <Pressable key={i} onPress={() => setDia(i)} style={[s.chip, { borderColor: dia === i ? t.accent : t.line, backgroundColor: dia === i ? t.accentSoft : t.card }]}>
                  <Text style={{ fontWeight: '800', fontSize: 17, color: dia === i ? t.accent : t.ink }}>{x.getDate()}</Text>
                  <Text style={{ fontSize: 11, color: t.muted }}>{i === 0 ? 'hoje' : DIAS[x.getDay()]}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {HORAS.map(h => (
                <Pressable key={h} onPress={() => setHora(h)} style={[s.hora, { borderColor: hora === h ? t.accent : t.line, backgroundColor: hora === h ? t.accentSoft : t.card }]}>
                  <Text style={{ fontWeight: '700', color: hora === h ? t.accent : t.ink }}>{h}:00</Text>
                </Pressable>
              ))}
            </View>
          </Cartao>
        ) : null}

        <T v="sub">
          Roteiro: {roteiro.length} fotos{roteiro.length < limite ? ` (o imóvel não tem ambientes para completar as ${limite} do plano)` : ''}, em {new Set(roteiro.map(f => f.ambiente)).size} ambientes.
        </T>
        <Botao titulo={agendar ? 'Agendar' : 'Criar projeto'} onPress={salvar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, minHeight: 48, fontSize: 16 },
  linha: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  chip: { width: 56, borderWidth: 1.5, borderRadius: 12, alignItems: 'center', paddingVertical: 8 },
  hora: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
});
