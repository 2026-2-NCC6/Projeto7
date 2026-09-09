# Smash — Entrega 1

Autenticação, Home e Perfil com dados reais do PostgreSQL, e o gameplay: **Color
Mode** e **Score Mode**, 20 níveis cada, com o motor de jogo separado do hardware.

```
backend/    NestJS + TypeORM + PostgreSQL (Clean Architecture)
frontend/   React Native (Expo) + TypeScript + styled-components
scripts/    utilitários (emulador Android)
```

---

## Começando do zero

### 1. Banco de dados (só uma vez)

O cluster local do PostgreSQL 18 roda na porta **5433**:

```bash
sudo -u postgres psql -p 5433 \
  -c "CREATE ROLE smash LOGIN PASSWORD 'smash';" \
  -c "CREATE DATABASE smash_entrega1 OWNER smash;"
```

### 2. Instalar tudo e criar as tabelas (só uma vez)

```bash
cd src/Entrega1
cp backend/.env.example backend/.env
npm install
npm run setup
```

### 3. Rodar

```bash
npm start
```

Esse comando sozinho: abre o emulador Android (e espera ele iniciar), sobe o
backend na porta 3000 e o app no emulador. Na primeira vez o Expo instala o
Expo Go no emulador automaticamente.

Para parar tudo: `Ctrl+C`.

---

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm start` | emulador + backend + app (o normal do dia a dia) |
| `npm run dev` | backend + app, sem mexer no emulador |
| `npm run backend` | só o backend |
| `npm run app` | só o Metro (aperte `a` para abrir no Android) |
| `npm run emulator` | só abre o emulador e espera o boot |
| `npm run db:migrate` | aplica as migrations pendentes |
| `npm run typecheck` | TypeScript dos dois projetos |

No Metro: `a` abre no Android · `r` recarrega · `j` abre o debugger.

### Rodar no celular

```bash
npm run backend      # terminal 1
npm run app          # terminal 2
```

Leia o QR code pelo Expo Go, com o celular no **mesmo Wi-Fi** do computador.
Para forçar outro endereço de API:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000 npm run app
```

---

## Banco de dados

```
users                 conta: id, name, email, password_hash, created_at
user_progressions     nível e XP por trilha (color, score) — PK (user_id, track)
daily_streaks         ofensiva diária: atual, recorde, último dia concluído
training_sessions     uma linha por treino: modo, nível, concluído, score,
                      acertos, erros, melhor sequência, duração, XP ganho,
                      tempo de resposta médio e melhor, quando
```

Ao criar uma conta, o backend grava numa **transação** o usuário, as duas
trilhas de progressão (nível 0, 0 XP) e a ofensiva zerada.

O "Resumo" da Home é agregado por consulta sobre `training_sessions`
(`COUNT`, `MAX(best_streak)`, `SUM(score)`) — nada é desnormalizado, então
os números nunca saem de sincronia com as sessões.

### Modos de jogo

| Modo | Ícone | Trilha | Jogável hoje |
| --- | --- | --- | --- |
| Color Mode | sequência de blocos | `color` | sim |
| Score Mode | alvo | `score` | sim |
| Infinite Color | infinito | `color` | não |
| Infinite Score | cronômetro | `score` | não |

Os identificadores no banco continuam `level_color`, `level_score`,
`infinite_color` e `infinite_score` — só os rótulos da interface mudaram.

Os ícones são SVG desenhados em `src/components/Icon`, sem fonte de ícones.
A chama da ofensiva usa o mesmo ícone em dois estados: preenchida quando a
ofensiva é maior que zero, só contorno (e em cinza) quando está zerada.

Regra de XP em `domain/progression/level-rules.ts`:
`xpDoNível(n) = 500 + n * 250`. O jogador começa no nível 0.

### Conquistas

O catálogo (28 conquistas em 9 categorias) e as regras de desbloqueio ficam em
`domain/achievement/`, sem persistência: cada conquista é **avaliada** a cada
requisição sobre os dados que já existem (progressão, ofensiva e sessões).

Uma conquista é uma `AchievementCriterion` declarativa — uma métrica, um alvo e
uma comparação. `evaluateAchievements` resolve a métrica e devolve
`{ current, progress, unlocked }`. Métricas que ainda não têm origem de dados
devolvem `null` (hoje só `leaderboardPosition`, porque não existe ranking), e a
conquista aparece bloqueada e sem barra de progresso.

Com o gameplay gravando sessões, nada aqui mudou: as conquistas passaram a
desbloquear sozinhas. Adicionar uma conquista nova é uma entrada no catálogo mais
o texto em `frontend/src/content/texts.ts`.

O backend define identidade e regra (id, categoria, nível, critério); o app
define aparência e texto (título, descrição, ícone, cor). Nenhum texto de
interface vem da API.

---

## Gameplay

Duas camadas, e a fronteira entre elas é o ponto principal:

```
frontend/src/device/     tudo que sabe que existe uma parede
frontend/src/gameplay/   motor, regras, níveis e métricas
```

O motor (`gameplay/domain/game-session.ts`) é um reducer puro sobre os estados
`preparing → awaitingHit → resolving → levelCleared / levelFailed`, mais `paused`
e `deviceLost`. Ele cuida do ciclo de vida, do tempo, das métricas e do estado do
dispositivo. Cada modo só decide o que é acerto e quando o nível termina, por trás
de `GameRules`. Registrar um modo novo é uma pasta em `gameplay/modes/` mais uma
linha em `modes/registry.ts` — não existe `if (mode === ...)` em lugar nenhum.

Os níveis são **dados**: `modes/color/color-levels.ts` e
`modes/score/score-levels.ts`, 20 entradas cada. Ajustar a dificuldade é editar a
tabela.

### Color Mode

A tela fica da cor do próximo alvo. Errar a cor — ou estourar a janela de reação —
devolve a sequência para o começo e conta um erro. A dificuldade cresce em
comprimento da sequência, janela de reação, tempo de recuperação e erros tolerados.

### Score Mode

Cada cor vale pontos e o nível termina ao atingir a meta. Níveis mais altos têm
limite de tempo, multiplicador por sequência de acertos, penalidade por erro,
paleta reduzida (acertar fora da paleta é erro) e precisão mínima.

### A parede ainda não existe

`device/contracts/` define o que é um evento de impacto (`TargetHitEvent`,
`DeviceStatusEvent`, `DeviceFaultEvent`) e a porta `TargetDevice`. Mensagem crua
nunca chega ao motor: `device/parsing/` valida o formato `Impacto` com zod e
`device/runtime/event-pipeline.ts` descarta alvo desconhecido, evento duplicado e
`t_ms` fora de ordem, emitindo `DeviceFaultEvent` em vez de quebrar a sessão.

O `SimulatedTargetDevice` monta exatamente a mesma mensagem que o firmware vai
publicar e a manda pelo mesmo parser e pipeline — o motor não tem como distinguir
os dois. **Quando o ESP32 existir, é uma classe nova implementando `TargetDevice`
e um `case` em `device/runtime/device-factory.ts`.** Nada em `gameplay/` muda.

Impacto simulado nunca vira número na tela: as leituras carregam
`impact.simulated: true` e a tela de resultado mostra `—`.

### Simulador durante o desenvolvimento

Em `__DEV__`, um painel flutuante ("sim", canto inferior direito da tela de jogo)
permite disparar alvos específicos, ligar o **piloto automático** (joga o nível
sozinho, útil para demonstrar sem a parede), derrubar e refazer a conexão, e
mandar uma mensagem inválida. Fora de `__DEV__` o painel não renderiza nada.

### Métricas

Cada tentativa vira um `AttemptRecord`. No fim, `metrics-collector.ts` produz
duração, precisão, acertos e erros, maior sequência, pontuação, conclusão, tempo
de resposta (médio, melhor, pior), estatísticas por alvo e impacto — cada métrica
sem origem de dados aparece como `—` em vez de um número inventado.

---

## API

| Método | Rota | Auth | Respostas |
| --- | --- | --- | --- |
| POST | `/auth/sign-up` | — | `201` · `409` e-mail em uso · `400` validação |
| POST | `/auth/sign-in` | — | `200` · `401` credenciais inválidas |
| GET | `/me/home` | Bearer | `200` · `401` sem token/expirado |
| GET | `/me/profile` | Bearer | `200` · `401` sem token/expirado |
| POST | `/me/sessions` | Bearer | `201` · `400` validação · `401` sem token |

`/me/home` devolve nome do jogador, ofensiva diária, progressão por trilha e o
resumo das sessões.

`/me/profile` devolve os dados do jogador, progressão, estatísticas (incluindo
precisão), recordes pessoais, modo favorito e as 28 conquistas avaliadas.
Recordes, precisão e modo favorito são agregados por consulta sobre
`training_sessions`. `rank` é sempre `null` até existir ranking.

`POST /me/sessions` grava o treino, credita XP e marca o dia na ofensiva — tudo
numa transação — e devolve `xpAwarded`, a progressão da trilha e a ofensiva
atualizada. A regra de XP é do backend (`domain/progression/session-reward.ts`):
o app conta o que aconteceu, o servidor decide quanto vale.

---

## Arquitetura

**Backend** — a dependência aponta sempre para dentro:

```
domain/          entidades, portas de repositório, regras (XP, ofensiva), erros
application/     casos de uso e portas (hasher, token, id) — sem framework
infrastructure/  TypeORM, bcrypt, JWT, migrations, composition root
presentation/    controllers, DTOs, guard JWT, filtro de exceções
```

`domain` e `application` não importam NestJS, TypeORM, bcrypt nem jsonwebtoken.

**Frontend**

```
src/theme/       tokens dos temas claro e escuro, espaçamento, raio, tipografia
src/content/     todos os textos da interface (pt-BR) e a saudação por horário
src/components/  componentes compartilhados
src/screens/     Login, SignUp, Home, Play, LevelSelect, ModeIntro, ColorGame,
                 ScoreGame, GameResults, Profile, Achievements
src/navigation/  stack de autenticação, stack do app, tabs, stack de jogo e perfil
src/device/      contratos, parser, pipeline e adaptador simulado da parede
src/gameplay/    motor, regras, níveis, métricas, serviços e ferramentas de dev
src/services/    cliente HTTP e serviços de autenticação, Home e perfil
src/hooks/       formulários, carregamento de dados e tema efetivo
src/store/       sessão e preferência de tema (zustand)
```

### Tema claro e escuro

`theme/colors.ts` exporta dois conjuntos com os mesmos nomes de token
(`lightColors` e `darkColors`); `App.tsx` escolhe um e entrega ao
`ThemeProvider`. Os componentes não sabem qual tema está ativo — não existe
condicional de tema fora de `theme/`.

A preferência é **Claro · Escuro · Sistema**, salva em AsyncStorage. `Sistema`
segue o aparelho. O verde-limão da marca é idêntico nos dois temas; o que muda
são as superfícies e os textos.

`primary` é **preenchimento** e carrega `onPrimary` (grafite — texto branco sobre
o limão não se lê). `primaryDark` é o acento quando ele mesmo é o texto ou o
ícone sobre `background`/`surface`: limão escuro no tema claro, limão claro no
escuro. Qualquer elemento fino (ícone da tab, link, barra de progresso, borda de
foco) usa `primaryDark`.

Os `index.tsx` só compõem componentes: nenhuma cor, tamanho ou espaçamento
literal fora de `theme/` e dos arquivos `styles.ts`.

---

## Nota sobre o Node 22 e caminhos com acento

No Node 22 há uma regressão de resolução de módulos quando o projeto está em um
caminho com caracteres não-ASCII (acentos, por exemplo): depois que a aplicação Nest é
criada, `Module._stat` passa a falhar para o diretório `node_modules`, e pacotes
carregados sob demanda (como o `class-validator` do `ValidationPipe`) deixam de
ser encontrados. O Node 20 não tem esse problema.

Por isso o `ValidationPipe` é instanciado antes de `NestFactory.create` em
`src/main.ts`. Com esse cuidado o backend roda normalmente no Node 22.17.1.

---

## Escopo desta entrega

Login e cadastro funcionais, persistindo no PostgreSQL. Home e Perfil mostram
dados reais do jogador, agora alimentados pelo gameplay. O Perfil traz
estatísticas, recordes, progressão, conquistas e as configurações (tema e sair da
conta). O avatar no topo da Home abre um menu com "Ver perfil" e "Sair da conta".

A aba Jogar traz Color Mode e Score Mode com 20 níveis cada, seleção de nível,
tutorial por modo, resultados com métricas e gravação da sessão no backend.

Fora do escopo por enquanto: as abas Estatísticas e Ranking, os modos Infinite, o
Desafio Diário como modo próprio e o firmware do ESP32 — a parede é representada
pelo dispositivo simulado.
