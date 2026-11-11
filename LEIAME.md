# Enquadra — app de captura guiada de fotos de imóveis

## Rodar no seu celular (sem publicar em loja)

1. Instale o **Node.js LTS** no computador: https://nodejs.org
2. Descompacte esta pasta, abra o Terminal (Mac) ou PowerShell (Windows) dentro dela e rode:
   ```
   npm install
   npx expo start
   ```
3. No celular, instale o app **Expo Go** (App Store ou Google Play).
4. Escaneie o QR code que aparece no terminal:
   - iPhone: com a câmera do próprio iPhone.
   - Android: pelo botão "Scan QR code" dentro do Expo Go.
5. Celular e computador precisam estar no mesmo Wi-Fi. Se não conectar, rode `npx expo start --tunnel`.

> Projeto em Expo SDK 54, a versão aceita pelo Expo Go da App Store.

## O que tem nesta versão
- Início com agenda de 14 dias, contadores e lista de projetos
- Botão + com "Fotografar agora" e "Agendar projeto"
- Novo projeto: tipo (Casa/Apartamento), plano (Básico 10 / Pro 25 / Max 65 fotos) e ambientes
- Plano de captura: checklist que libera o botão só quando tudo está marcado
- Roteiro foto a foto: ângulo, zoom, altura, recomendação e ilustração 3D da posição
- Câmera travada na horizontal, com grade, linha de horizonte, leitura "Atual × Alvo 90°",
  vibração ao nivelar e **disparo bloqueado até o celular ficar reto**
- Lente 0,5x automática no iPhone (quando o aparelho tem ultra-grande-angular)
- Avanço automático para a próxima foto e revisão com galeria e tempo de captura

## Ajustes rápidos
- Tolerância do nível: `src/lib/nivel.ts` (TOL_INCLINACAO e TOL_GIRO)
- Roteiro, planos e dicas: `src/lib/roteiro.ts`
- Cores: `src/lib/theme.ts`

## Próximas etapas
- Fase 2: edição automática por IA ao enviar (antes/depois)
- Login, nuvem (Supabase) e painel do gestor
- Publicação nas lojas com EAS Build
