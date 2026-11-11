import React from 'react';
import Svg, { Circle, G, Line, Polygon, Rect } from 'react-native-svg';
import { Pose } from '../lib/roteiro';
import { Tema } from '../lib/theme';

// Projeção isométrica simples: (x, y no chão, z altura) → tela
const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
const U = 13; // escala
const OX = 160, OY = 70;
const p = (x: number, y: number, z = 0) => `${OX + (x - y) * C * U},${OY + (x + y) * S * U - z * U}`;
const pts = (...a: [number, number, number?][]) => a.map(([x, y, z]) => p(x, y, z ?? 0)).join(' ');

const W = 10, D = 8, H = 4.6;

type Cena = { pessoa: [number, number]; alvo: [[number, number], [number, number]] };
const CENAS: Record<Exclude<Pose, 'externa'>, Cena> = {
  diagonal: { pessoa: [9.2, 7.2], alvo: [[0.4, 3.5], [5, 0.4]] },
  inverso: { pessoa: [0.9, 7.2], alvo: [[9.6, 0.6], [9.6, 5.5]] },
  frontal: { pessoa: [5, 7.4], alvo: [[1.5, 0.3], [8.5, 0.3]] },
  detalhe: { pessoa: [4.5, 3], alvo: [[3, 0.3], [6, 0.3]] },
};

function Pessoa({ x, y, t }: { x: number; y: number; t: Tema }) {
  const [px, py] = p(x, y).split(',').map(Number);
  return (
    <G>
      <Circle cx={px} cy={py} r={7} fill={t.accent} opacity={0.25} />
      <Line x1={px} y1={py} x2={px} y2={py - 26} stroke={t.ink} strokeWidth={5} strokeLinecap="round" />
      <Circle cx={px} cy={py - 33} r={5.5} fill={t.ink} />
      <Rect x={px - 4} y={py - 30} width={8} height={5} rx={1} fill={t.accent} />
    </G>
  );
}

export function Ilustracao({ pose, t, largura = 320 }: { pose: Pose; t: Tema; largura?: number }) {
  const altura = largura * 0.62;
  if (pose === 'externa') {
    return (
      <Svg width={largura} height={altura} viewBox="0 0 320 200">
        <Polygon points={pts([0, -2], [10, -2], [10, 8], [0, 8])} fill={t.line} opacity={0.5} />
        <Polygon points={pts([2, 0, 0], [8, 0, 0], [8, 0, 6], [2, 0, 6])} fill={t.card} stroke={t.muted} strokeWidth={1} />
        <Polygon points={pts([2, 0, 0], [2, 4, 0], [2, 4, 6], [2, 0, 6])} fill={t.bg} stroke={t.muted} strokeWidth={1} />
        <Polygon points={pts([2, 0, 6], [8, 0, 6], [8, 4, 6], [2, 4, 6])} fill={t.line} stroke={t.muted} strokeWidth={1} />
        {[1.2, 2.8, 4.4].map(z => [3, 5, 6.5].map(x => (
          <Polygon key={`${x}-${z}`} points={pts([x, 0, z], [x + 0.9, 0, z], [x + 0.9, 0, z + 1], [x, 0, z + 1])} fill={t.accentSoft} />
        )))}
        <Polygon points={pts([5, 9.5], [1.5, 0.2], [8.5, 0.2])} fill={t.accent} opacity={0.16} />
        <Pessoa x={5} y={9.5} t={t} />
      </Svg>
    );
  }
  const c = CENAS[pose];
  return (
    <Svg width={largura} height={altura} viewBox="0 0 320 200">
      {/* piso */}
      <Polygon points={pts([0, 0], [W, 0], [W, D], [0, D])} fill={t.bg} stroke={t.line} strokeWidth={1.5} />
      {/* paredes do fundo */}
      <Polygon points={pts([0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H])} fill={t.card} stroke={t.line} strokeWidth={1.5} />
      <Polygon points={pts([0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H])} fill={t.card} stroke={t.line} strokeWidth={1.5} opacity={0.92} />
      {/* janela */}
      <Polygon points={pts([3, 0, 1.4], [7, 0, 1.4], [7, 0, 3.6], [3, 0, 3.6])} fill={t.accentSoft} stroke={t.muted} strokeWidth={0.8} />
      {/* tapete e móvel */}
      <Polygon points={pts([2.5, 2.5], [6.5, 2.5], [6.5, 5.5], [2.5, 5.5])} fill={t.warnSoft} />
      <Polygon points={pts([0.3, 2.2, 1], [1.6, 2.2, 1], [1.6, 6, 1], [0.3, 6, 1])} fill={t.line} />
      <Polygon points={pts([1.6, 2.2, 0], [1.6, 6, 0], [1.6, 6, 1], [1.6, 2.2, 1])} fill={t.muted} opacity={0.5} />
      {/* campo de visão */}
      <Polygon points={pts(c.pessoa, c.alvo[0], c.alvo[1])} fill={t.accent} opacity={0.18} />
      <Line x1={Number(p(...c.pessoa).split(',')[0])} y1={Number(p(...c.pessoa).split(',')[1])}
        x2={Number(p(...c.alvo[0]).split(',')[0])} y2={Number(p(...c.alvo[0]).split(',')[1])} stroke={t.accent} strokeWidth={1.2} strokeDasharray="4 3" />
      <Line x1={Number(p(...c.pessoa).split(',')[0])} y1={Number(p(...c.pessoa).split(',')[1])}
        x2={Number(p(...c.alvo[1]).split(',')[0])} y2={Number(p(...c.alvo[1]).split(',')[1])} stroke={t.accent} strokeWidth={1.2} strokeDasharray="4 3" />
      <Pessoa x={c.pessoa[0]} y={c.pessoa[1]} t={t} />
    </Svg>
  );
}
