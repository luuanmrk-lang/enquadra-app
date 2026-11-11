import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

// Tolerâncias para liberar o disparo
export const TOL_INCLINACAO = 2; // graus de diferença do alvo 90° (celular em pé)
export const TOL_GIRO = 1.5; // graus de giro lateral (linha do horizonte)

export type Nivel = {
  inclinacao: number; // 90 = celular perfeitamente em pé
  giro: number; // 0 = horizonte reto (positivo/negativo indica o lado)
  horizontal: boolean; // celular deitado (paisagem)
  ok: boolean;
  disponivel: boolean;
};

const graus = (r: number) => (r * 180) / Math.PI;

/**
 * Lê o acelerômetro ~30x por segundo e calcula:
 * - inclinação: ângulo entre a tela e o chão (90° = em pé). Evita paredes "caindo".
 * - giro: rotação da linha do horizonte com o celular na horizontal.
 * Funciona igual em iOS e Android porque usa só razões e valores absolutos.
 */
export function useNivel(ativo = true): Nivel {
  const [n, setN] = useState<Nivel>({ inclinacao: 0, giro: 0, horizontal: false, ok: false, disponivel: true });
  const suave = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let sub: { remove: () => void } | null = null;
    let vivo = true;
    Accelerometer.isAvailableAsync().then(ok => {
      if (!vivo) return;
      if (!ok) { setN(v => ({ ...v, disponivel: false })); return; }
      Accelerometer.setUpdateInterval(33);
      sub = Accelerometer.addListener(({ x, y, z }) => {
        const a = 0.25; // filtro passa-baixa para o ponteiro não tremer
        const s = suave.current ?? { x, y, z };
        const f = { x: s.x + a * (x - s.x), y: s.y + a * (y - s.y), z: s.z + a * (z - s.z) };
        suave.current = f;
        const g = Math.hypot(f.x, f.y, f.z) || 1;
        const inclinacao = graus(Math.acos(Math.min(1, Math.abs(f.z) / g)));
        const horizontal = Math.abs(f.x) > Math.abs(f.y);
        const sx = Math.sign(f.x) || 1, sy = Math.sign(f.y) || 1;
        const giro = horizontal ? graus(Math.atan2(sx * f.y, sx * f.x)) : graus(Math.atan2(sy * f.x, sy * f.y));
        const ok = horizontal && Math.abs(inclinacao - 90) <= TOL_INCLINACAO && Math.abs(giro) <= TOL_GIRO;
        setN({ inclinacao, giro, horizontal, ok, disponivel: true });
      });
    });
    return () => { vivo = false; sub?.remove(); };
  }, [ativo]);

  return n;
}
