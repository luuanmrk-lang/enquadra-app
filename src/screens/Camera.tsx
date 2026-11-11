import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from '../nav';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Botao } from '../components/ui';
import { TOL_GIRO, TOL_INCLINACAO, useNivel } from '../lib/nivel';
import { useProjeto, useStore } from '../lib/store';

const VERDE = '#3DDC84', VERMELHO = '#FF4D4D';

export default function Camera() {
  const ins = useSafeAreaInsets();
  const { id, i } = useLocalSearchParams<{ id: string; i?: string }>();
  const p = useProjeto(id);
  const { salvarFoto } = useStore();
  const [perm, pedir] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [pronta, setPronta] = useState(false);
  const [ultra, setUltra] = useState<string | null>(null);
  const [wide, setWide] = useState<string | null>(null);
  const [lente, setLente] = useState<string | undefined>(undefined);
  const [salvando, setSalvando] = useState(false);
  const [girado, setGirado] = useState(false);
  const nivel = useNivel(true);
  const okAntes = useRef(false);

  const idx = Math.max(0, Number(i) || 0);
  const f = p?.roteiro[idx];

  // Câmera sempre na horizontal: padrão de foto de anúncio
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).then(() => setGirado(true)).catch(() => setGirado(true));
    return () => { ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {}); };
  }, []);

  // Vibra quando o celular "encaixa" no nível
  useEffect(() => {
    if (nivel.ok && !okAntes.current) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    okAntes.current = nivel.ok;
  }, [nivel.ok]);

  async function aoFicarPronta() {
    setPronta(true);
    if (Platform.OS !== 'ios') return;
    try {
      const ls: string[] = ((await cam.current?.getAvailableLensesAsync()) ?? []).map((l: unknown) => (typeof l === 'string' ? l : String((l as { deviceType?: string }).deviceType ?? '')));
      const u = ls.find(l => /ultra/i.test(l)) ?? null;
      const w = ls.find(l => /wide/i.test(l) && !/ultra/i.test(l)) ?? ls.find(l => !/ultra|tele|front|dual|triple/i.test(l)) ?? null;
      setUltra(u); setWide(w);
      if (f?.zoom === '0,5x' && u) setLente(u);
      else if (w) setLente(w);
    } catch {}
  }

  async function disparar() {
    if (!cam.current || !p || !f || salvando || !nivel.ok) return;
    setSalvando(true);
    try {
      const foto = await cam.current.takePictureAsync({ quality: 0.92 });
      if (!foto?.uri) throw new Error('sem foto');
      await salvarFoto(p.id, f.key, foto.uri, foto.width, foto.height);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setSalvando(false);
    }
  }

  if (!p || !f) return null;

  if (!perm) return <View style={s.preto} />;
  if (!perm.granted) {
    return (
      <View style={[s.preto, { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }]}>
        <Text style={s.txtGrande}>O Enquadra precisa da câmera para fotografar o imóvel.</Text>
        <Botao titulo="Permitir câmera" onPress={pedir} />
        <Botao variante="texto" titulo="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  const cor = nivel.ok ? VERDE : VERMELHO;
  const incl = Math.round(nivel.inclinacao);
  const giro = Math.max(-25, Math.min(25, nivel.giro));
  const temUltra = !!(ultra && wide);

  return (
    <View style={s.preto}>
      {girado ? (
        <CameraView
          ref={cam}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="picture"
          selectedLens={lente}
          onCameraReady={aoFicarPronta}
        />
      ) : null}

      {/* Grade de terços */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {[1, 2].map(n => <View key={'v' + n} style={[s.gradeV, { left: `${(n * 100) / 3}%` }]} />)}
        {[1, 2].map(n => <View key={'h' + n} style={[s.gradeH, { top: `${(n * 100) / 3}%` }]} />)}
      </View>

      {/* Linha do horizonte */}
      <View pointerEvents="none" style={s.centro}>
        <View style={[s.horizonte, { backgroundColor: cor, transform: [{ rotate: `${-giro}deg` }] }]} />
        <View style={[s.mira, { borderColor: cor }]} />
      </View>

      {/* Topo: qual foto */}
      <View style={[s.topo, { paddingTop: Math.max(ins.top, 10), paddingLeft: Math.max(ins.left, 16), paddingRight: Math.max(ins.right, 110) }]}>
        <Pressable onPress={() => router.back()} style={s.voltar} accessibilityLabel="Voltar">
          <Text style={{ color: '#fff', fontSize: 22 }}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.titulo} numberOfLines={1}>{f.titulo}</Text>
          <Text style={s.sub} numberOfLines={2}>Foto {idx + 1} de {p.roteiro.length} · {f.angulo} · {f.dica}</Text>
        </View>
      </View>

      {/* Leitura do nível */}
      <View style={[s.leitura, { bottom: Math.max(ins.bottom, 14), left: Math.max(ins.left, 16) }]}>
        {!nivel.disponivel ? (
          <Text style={s.sub}>Sensor de nível indisponível neste aparelho.</Text>
        ) : !nivel.horizontal ? (
          <Text style={[s.alerta]}>Gire o celular para a horizontal</Text>
        ) : (
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={s.caixa}>
              <Text style={s.mini}>Atual</Text>
              <Text style={[s.valor, { color: Math.abs(nivel.inclinacao - 90) <= TOL_INCLINACAO ? VERDE : '#fff' }]}>{incl}°</Text>
            </View>
            <Text style={{ color: cor, fontSize: 18, fontWeight: '900' }}>{nivel.ok ? '✓' : '→'}</Text>
            <View style={s.caixa}>
              <Text style={s.mini}>Alvo</Text>
              <Text style={s.valor}>90°</Text>
            </View>
            <View style={[s.caixa, { marginLeft: 6 }]}>
              <Text style={s.mini}>Horizonte</Text>
              <Text style={[s.valor, { color: Math.abs(nivel.giro) <= TOL_GIRO ? VERDE : '#fff' }]}>{nivel.giro.toFixed(1)}°</Text>
            </View>
          </View>
        )}
      </View>

      {/* Lateral: lente e disparo */}
      <View style={[s.lateral, { right: Math.max(ins.right, 16) }]}>
        {temUltra ? (
          <View style={s.lentes}>
            {([[ultra!, '0,5x'], [wide!, '1x']] as [string, string][]).map(([tipo, rot]) => (
              <Pressable key={tipo} onPress={() => setLente(tipo)} style={[s.lente, lente === tipo && { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                <Text style={{ color: lente === tipo ? '#000' : '#fff', fontWeight: '800', fontSize: 13 }}>{rot}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={[s.mini, { textAlign: 'center', maxWidth: 90 }]}>Use a lente mais aberta</Text>
        )}
        <Pressable onPress={disparar} disabled={!nivel.ok || salvando || !pronta}
          accessibilityLabel={nivel.ok ? 'Tirar foto' : 'Disparo bloqueado: nivele o celular'}
          style={[s.disparo, { borderColor: cor }]}>
          <View style={[s.disparoMiolo, { backgroundColor: nivel.ok ? '#fff' : 'rgba(255,255,255,0.25)' }]}>
            {salvando ? <ActivityIndicator color="#000" /> : !nivel.ok ? <Text style={{ fontSize: 22 }}>🔒</Text> : null}
          </View>
        </Pressable>
        <Text style={[s.mini, { color: cor }]}>{nivel.ok ? 'Liberado' : 'Nivele'}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  preto: { flex: 1, backgroundColor: '#000' },
  txtGrande: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: '600' },
  gradeV: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.45)' },
  gradeH: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.45)' },
  centro: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  horizonte: { position: 'absolute', width: '46%', height: 3, borderRadius: 2 },
  mira: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  topo: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.35)' },
  voltar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  titulo: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 16 },
  leitura: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  alerta: { color: '#FFD166', fontWeight: '800', fontSize: 15 },
  caixa: { alignItems: 'center' },
  mini: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700' },
  valor: { color: '#fff', fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  lateral: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', gap: 14, width: 90 },
  lentes: { flexDirection: 'column', gap: 6, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, padding: 4 },
  lente: { width: 44, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  disparo: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  disparoMiolo: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
});
