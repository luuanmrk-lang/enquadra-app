import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Detalhes, Foto, gerarRoteiro, PlanoId, Tipo } from './roteiro';

export type Status = 'agendado' | 'em_captura' | 'concluido' | 'enviado';

export type Captura = { uri: string; t: number; w: number; h: number };

export type Projeto = {
  id: string;
  ref: string;
  endereco: string;
  corretor: string;
  tipo: Tipo;
  plano: PlanoId;
  detalhes: Detalhes;
  roteiro: Foto[];
  agendadoPara: number | null;
  criadoEm: number;
  status: Status;
  preparo: Record<string, boolean>;
  fotos: Record<string, Captura>;
  inicioCaptura?: number;
  fimCaptura?: number;
  enviadoEm?: number;
};

type NovoProjeto = Pick<Projeto, 'ref' | 'endereco' | 'corretor' | 'tipo' | 'plano' | 'detalhes' | 'agendadoPara'>;

type Ctx = {
  pronto: boolean;
  projetos: Projeto[];
  criar: (p: NovoProjeto) => Projeto;
  atualizar: (id: string, patch: Partial<Projeto>) => void;
  salvarFoto: (id: string, key: string, tmpUri: string, w: number, h: number) => Promise<void>;
  removerFoto: (id: string, key: string) => void;
  excluir: (id: string) => void;
};

const KEY = 'enquadra.projetos.v1';
const StoreCtx = createContext<Ctx | null>(null);

function pastaProjeto(id: string) {
  const root = new Directory(Paths.document, 'enquadra');
  if (!root.exists) root.create({ intermediates: true, idempotent: true });
  const dir = new Directory(root, id);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [pronto, setPronto] = useState(false);
  const ref = useRef(projetos);
  ref.current = projetos;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => { if (raw) setProjetos(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setPronto(true));
  }, []);

  useEffect(() => {
    if (pronto) AsyncStorage.setItem(KEY, JSON.stringify(projetos)).catch(() => {});
  }, [projetos, pronto]);

  const atualizar = useCallback((id: string, patch: Partial<Projeto>) => {
    setProjetos(ps => ps.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const criar = useCallback((n: NovoProjeto) => {
    const p: Projeto = {
      ...n,
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      roteiro: gerarRoteiro(n.tipo, n.plano, n.detalhes),
      criadoEm: Date.now(),
      status: n.agendadoPara ? 'agendado' : 'em_captura',
      preparo: {},
      fotos: {},
    };
    setProjetos(ps => [p, ...ps]);
    return p;
  }, []);

  const salvarFoto = useCallback(async (id: string, key: string, tmpUri: string, w: number, h: number) => {
    const dir = pastaProjeto(id);
    const destino = new File(dir, `${key}-${Date.now()}.jpg`);
    await new File(tmpUri).copy(destino);
    const antigo = ref.current.find(p => p.id === id)?.fotos[key];
    if (antigo) { try { new File(antigo.uri).delete(); } catch {} }
    const t = Date.now();
    setProjetos(ps => ps.map(p => {
      if (p.id !== id) return p;
      const fotos = { ...p.fotos, [key]: { uri: destino.uri, t, w, h } };
      const completo = p.roteiro.every(f => fotos[f.key]);
      return {
        ...p,
        fotos,
        inicioCaptura: p.inicioCaptura ?? t,
        fimCaptura: t,
        status: p.status === 'enviado' ? 'enviado' : completo ? 'concluido' : 'em_captura',
      };
    }));
  }, []);

  const removerFoto = useCallback((id: string, key: string) => {
    setProjetos(ps => ps.map(p => {
      if (p.id !== id) return p;
      const atual = p.fotos[key];
      if (atual) { try { new File(atual.uri).delete(); } catch {} }
      const fotos = { ...p.fotos };
      delete fotos[key];
      return { ...p, fotos, status: p.status === 'enviado' ? 'enviado' : 'em_captura' };
    }));
  }, []);

  const excluir = useCallback((id: string) => {
    try { const d = new Directory(Paths.document, 'enquadra', id); if (d.exists) d.delete(); } catch {}
    setProjetos(ps => ps.filter(p => p.id !== id));
  }, []);

  const value = useMemo(() => ({ pronto, projetos, criar, atualizar, salvarFoto, removerFoto, excluir }),
    [pronto, projetos, criar, atualizar, salvarFoto, removerFoto, excluir]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('StoreProvider ausente');
  return c;
}

export function useProjeto(id: string | undefined) {
  const { projetos } = useStore();
  return projetos.find(p => p.id === id);
}

export function progresso(p: Projeto) {
  const feitas = p.roteiro.filter(f => p.fotos[f.key]).length;
  return { feitas, total: p.roteiro.length, pct: p.roteiro.length ? feitas / p.roteiro.length : 0 };
}

export const STATUS_LABEL: Record<Status, string> = {
  agendado: 'Agendado',
  em_captura: 'Em captura',
  concluido: 'Fotos concluídas',
  enviado: 'Enviado para edição',
};
