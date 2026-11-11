// Roteiro de captura: gera a lista de fotos a partir do imóvel e do plano escolhido.

export type Tipo = 'Apartamento' | 'Casa';
export type PlanoId = 'basico' | 'pro' | 'max';
export type Pose = 'diagonal' | 'inverso' | 'frontal' | 'externa' | 'detalhe';

export const PLANOS: { id: PlanoId; nome: string; fotos: number; desc: string }[] = [
  { id: 'basico', nome: 'Básico', fotos: 10, desc: 'Os ângulos essenciais para o anúncio' },
  { id: 'pro', nome: 'Pro', fotos: 25, desc: 'Todos os ambientes, com ângulo inverso' },
  { id: 'max', nome: 'Max', fotos: 65, desc: 'Cobertura completa, com detalhes e lazer' },
];

export type Detalhes = {
  quartos: number;
  suites: number;
  banheiros: number;
  varanda: boolean;
  servico: boolean;
  lavabo: boolean;
  vaga: boolean;
  lazer: boolean;
};

export type Foto = {
  key: string;
  ambiente: string;
  titulo: string;
  pose: Pose;
  angulo: string;
  zoom: string;
  dica: string;
  prioridade: 1 | 2 | 3; // 1 = essencial
};

export const PREPARO: { key: string; texto: string }[] = [
  { key: 'bateria', texto: 'Verifique a bateria do celular' },
  { key: 'lente', texto: 'Limpe a lente da câmera (use um pano ou a camiseta)' },
  { key: 'luzes', texto: 'Acenda todas as luzes, inclusive abajures' },
  { key: 'cortinas', texto: 'Abra cortinas e persianas' },
  { key: 'objetos', texto: 'Remova objetos indesejados (fios, lixeiras, tapetes de banheiro, controles)' },
  { key: 'vasos', texto: 'Abaixe as tampas dos vasos sanitários' },
  { key: 'camas', texto: 'Arrume as camas e tire roupas e bolsas de vista' },
];

const DIAG = '45° · diagonal';
const FRONT = '0° · frontal';
const T_BANHEIRO = 'Da porta, celular na altura do peito. Cuidado para você não aparecer no espelho.';

export function gerarRoteiro(tipo: Tipo, plano: PlanoId, d: Detalhes): Foto[] {
  const todas: Foto[] = [];
  const add = (f: Omit<Foto, 'zoom'> & { zoom?: string }) => todas.push({ zoom: '0,5x', ...f });
  const casa = tipo === 'Casa';

  add({ key: 'fachada', ambiente: 'Externa', titulo: 'Fachada', pose: 'externa', angulo: FRONT, prioridade: 1,
    dica: casa ? 'Da calçada oposta, enquadre a casa inteira sem cortar o telhado. Sem carros na frente.' : 'Da calçada oposta, enquadre o prédio inteiro sem cortar o topo.' });
  add({ key: 'acesso', ambiente: 'Externa', titulo: casa ? 'Entrada e jardim' : 'Portaria e hall', pose: 'frontal', angulo: FRONT, prioridade: 2,
    dica: 'Mostre o acesso de fora para dentro, com o portão aberto.' });
  if (casa) add({ key: 'quintal', ambiente: 'Externa', titulo: 'Quintal / área externa', pose: 'diagonal', angulo: DIAG, prioridade: 2,
    dica: 'Do canto da área, mostrando a maior extensão do terreno.' });

  add({ key: 'sala-1', ambiente: 'Sala de estar', titulo: 'Sala: ângulo principal', pose: 'diagonal', angulo: DIAG, prioridade: 1,
    dica: 'Posicione-se no canto oposto à janela para máxima amplitude.' });
  add({ key: 'sala-2', ambiente: 'Sala de estar', titulo: 'Sala: ângulo inverso', pose: 'inverso', angulo: DIAG, prioridade: 2,
    dica: 'Vá ao canto oposto e repita, com a janela às costas.' });
  add({ key: 'sala-3', ambiente: 'Sala de estar', titulo: 'Sala: integração', pose: 'frontal', angulo: FRONT, prioridade: 2,
    dica: 'Mostre a passagem para varanda ou cozinha.' });
  add({ key: 'sala-d', ambiente: 'Sala de estar', titulo: 'Sala: detalhe', pose: 'detalhe', angulo: FRONT, zoom: '1x', prioridade: 3,
    dica: 'Um ponto forte do ambiente: luminária, piso, rodapé, marcenaria.' });

  if (d.varanda) {
    add({ key: 'varanda-1', ambiente: 'Varanda', titulo: 'Varanda', pose: 'diagonal', angulo: DIAG, prioridade: 1,
      dica: 'Do canto interno, pegando piso, guarda-corpo e parte da vista.' });
    add({ key: 'varanda-2', ambiente: 'Varanda', titulo: 'Vista', pose: 'frontal', angulo: FRONT, zoom: '1x', prioridade: 2,
      dica: 'Celular reto, enquadre a paisagem. Evite o sol de frente.' });
  }

  add({ key: 'cozinha-1', ambiente: 'Cozinha', titulo: 'Cozinha: ângulo principal', pose: 'diagonal', angulo: DIAG, prioridade: 1,
    dica: 'Da porta ou do canto, mostrando bancada, armários e eletros.' });
  add({ key: 'cozinha-2', ambiente: 'Cozinha', titulo: 'Cozinha: bancada', pose: 'frontal', angulo: FRONT, prioridade: 2,
    dica: 'De frente para a bancada principal, a 1,2 m de altura.' });
  add({ key: 'cozinha-d', ambiente: 'Cozinha', titulo: 'Cozinha: detalhe', pose: 'detalhe', angulo: FRONT, zoom: '1x', prioridade: 3,
    dica: 'Cooktop, torneira ou acabamento da bancada.' });

  if (d.servico) add({ key: 'servico', ambiente: 'Área de serviço', titulo: 'Área de serviço', pose: 'frontal', angulo: FRONT, prioridade: 2,
    dica: 'Da porta, mostrando tanque e espaço da máquina. Varal sem roupas.' });

  const q = d.quartos, su = Math.min(d.suites, q);
  for (let i = 1; i <= q; i++) {
    const isSuite = i <= su;
    const nome = isSuite ? (su > 1 ? `Suíte ${i}` : 'Suíte') : `Quarto ${i - su}`;
    add({ key: `q${i}-1`, ambiente: nome, titulo: `${nome}: ângulo principal`, pose: 'diagonal', angulo: DIAG, prioridade: 1,
      dica: 'Do canto da porta, na diagonal, mostrando cama e janela.' });
    add({ key: `q${i}-2`, ambiente: nome, titulo: `${nome}: ângulo inverso`, pose: 'inverso', angulo: DIAG, prioridade: 2,
      dica: 'Do lado da janela em direção à porta, mostrando os armários.' });
    if (isSuite) add({ key: `q${i}-b`, ambiente: nome, titulo: `${nome}: banheiro`, pose: 'inverso', angulo: DIAG, prioridade: 1, dica: T_BANHEIRO });
    add({ key: `q${i}-d`, ambiente: nome, titulo: `${nome}: detalhe`, pose: 'detalhe', angulo: FRONT, zoom: '1x', prioridade: 3,
      dica: 'Armário, cabeceira ou vista da janela.' });
  }
  for (let j = 1; j <= d.banheiros; j++) {
    const nome = d.banheiros > 1 ? `Banheiro social ${j}` : 'Banheiro social';
    add({ key: `b${j}`, ambiente: 'Banheiros', titulo: nome, pose: 'inverso', angulo: DIAG, prioridade: j === 1 ? 1 : 2, dica: T_BANHEIRO });
  }
  if (d.lavabo) add({ key: 'lavabo', ambiente: 'Banheiros', titulo: 'Lavabo', pose: 'inverso', angulo: DIAG, prioridade: 2, dica: T_BANHEIRO });
  if (d.vaga) add({ key: 'vaga', ambiente: 'Garagem', titulo: 'Vaga de garagem', pose: 'frontal', angulo: FRONT, prioridade: 3,
    dica: 'Mostre a vaga e o acesso. Se for demarcada, enquadre a numeração.' });
  if (d.lazer) {
    for (const [k, n] of [['piscina', 'Piscina'], ['academia', 'Academia'], ['salao', 'Salão de festas'], ['gourmet', 'Espaço gourmet'], ['play', 'Playground'], ['quadra', 'Quadra']]) {
      add({ key: `lazer-${k}`, ambiente: 'Lazer', titulo: n, pose: 'diagonal', angulo: DIAG, prioridade: k === 'piscina' ? 2 : 3,
        dica: 'Ambiente vazio e luzes acesas. Do canto que mostra o espaço inteiro.' });
    }
  }

  const limite = PLANOS.find(p => p.id === plano)!.fotos;
  const ordem = new Map(todas.map((f, i) => [f.key, i]));
  const escolhidas = [...todas]
    .sort((a, b) => a.prioridade - b.prioridade || ordem.get(a.key)! - ordem.get(b.key)!)
    .slice(0, limite);
  return escolhidas.sort((a, b) => ordem.get(a.key)! - ordem.get(b.key)!);
}
