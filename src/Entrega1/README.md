# Smash — Entrega 1

Autenticação, Home, Perfil, Estatísticas e Ranking com dados reais do PostgreSQL,
e o gameplay: **Color Mode**, **Score Mode**, **Infinite Color** e **Infinite
Score**, com o motor de jogo separado do hardware — e o firmware da parede.

```
backend/            NestJS + TypeORM + PostgreSQL (Clean Architecture)
backend/firmware/   firmware do ESP32 (C++/Arduino) — veja o README de lá
frontend/           React Native (Expo) + TypeScript + styled-components
scripts/            utilitários (emulador Android)
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
| `npm run lint` | ESLint dos dois projetos |
| `npm test` | testes (Jest) dos dois projetos — veja a nota sobre o Node 22 |

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
                      tempo de resposta médio e melhor, dispositivo
                      (simulated|websocket), quando
training_session_targets  telemetria por alvo de cada treino: tentativas,
                      acertos, impacto médio e pico — PK (session_id, target_id)
```

Ao criar uma conta, o backend grava numa **transação** o usuário, as duas
trilhas de progressão (nível 0, 0 XP) e a ofensiva zerada.

O "Resumo" da Home é agregado por consulta sobre `training_sessions`
(`COUNT`, `MAX(best_streak)`, `SUM(score)`) — nada é desnormalizado, então
os números nunca saem de sincronia com as sessões.

### Modos de jogo

| Modo | Ícone | Trilha | Níveis |
| --- | --- | --- | --- |
| Color Mode | sequência de blocos | `color` | 20 |
| Score Mode | alvo | `score` | 20 |
| Infinite Color | infinito | `color` | — |
| Infinite Score | cronômetro | `score` | — |

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
devolvem `null`, e a conquista aparece bloqueada e sem barra de progresso.
`leaderboardPosition` vem do ranking de XP.

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

### Infinite Color e Infinite Score

Não têm níveis nem meta: têm um **banco de tempo**. O relógio corre, cada acerto
devolve tempo, e o tempo devolvido **encolhe conforme a pontuação sobe**. A série
acaba quando o banco zera, e a barra no topo é esse banco.

A curva é dados, em `modes/infinite-color/` e `modes/infinite-score/`
(`TimeBudget`: tempo inicial, bônus base, piso do bônus, decaimento por degrau,
pontuação por degrau e penalidade por erro). Duas regras a mantêm honesta:

- o banco **nunca guarda mais do que o tamanho inicial**, senão quem joga rápido
  acumula uma reserva invisível e a série deixa de terminar;
- o **piso do bônus** fica abaixo do ciclo mais rápido que alguém consegue manter,
  então até o piloto automático acaba perdendo terreno.

Uma série termina em ~35 s para quem está começando e ~90 s para quem joga bem —
quem separa os dois é a **pontuação**, não a duração.

O XP é do backend (`domain/progression/session-reward.ts`): modo com nível paga
pelo nível, modo infinito paga pela pontuação, com teto. Uma série terminada conta
o dia na ofensiva, já que "concluir" não existe nesses modos.

### A parede

`device/contracts/` define o que é um evento de impacto (`TargetHitEvent`,
`DeviceStatusEvent`, `DeviceFaultEvent`) e a porta `TargetDevice`. Mensagem crua
nunca chega ao motor: `device/parsing/` valida o formato `Impacto` com zod e
`device/runtime/event-pipeline.ts` descarta alvo desconhecido, evento duplicado e
`t_ms` fora de ordem, emitindo `DeviceFaultEvent` em vez de quebrar a sessão.

O `SimulatedTargetDevice` monta exatamente a mesma mensagem que o firmware
publica e a manda pelo mesmo parser e pipeline — o motor não tem como distinguir
os dois. O `WebSocketTargetDevice` é a parede de verdade: mesma porta, mesmo
parser, mesmo pipeline. Trocar um pelo outro é uma variável de ambiente, e nada
em `gameplay/` muda.

```bash
# simulador (padrão)
npm run app

# a parede de verdade, no modo SoftAP
EXPO_PUBLIC_DEVICE_SOURCE=websocket EXPO_PUBLIC_DEVICE_URL=ws://192.168.4.1:81 npm run app
```

As variáveis estão em `frontend/.env.example`. O firmware, o protocolo completo e
a calibração dos sensores estão em **`backend/firmware/README.md`**.

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
| GET | `/me/statistics` | Bearer | `200` · `401` sem token/expirado |
| GET | `/rankings/:category` | opcional | `200` · `400` categoria inválida |

`/me/home` devolve nome do jogador, ofensiva diária, progressão por trilha e o
resumo das sessões.

`/me/profile` devolve os dados do jogador, progressão, estatísticas (incluindo
precisão), recordes pessoais, modo favorito e as 28 conquistas avaliadas.
Recordes, precisão e modo favorito são agregados por consulta sobre
`training_sessions`. `rank` é a posição no ranking de XP, ou `null` para quem
ainda não pontuou.

`POST /me/sessions` grava o treino, credita XP e marca o dia na ofensiva — tudo
numa transação — e devolve `xpAwarded`, a progressão da trilha e a ofensiva
atualizada. A regra de XP é do backend (`domain/progression/session-reward.ts`):
o app conta o que aconteceu, o servidor decide quanto vale. O corpo aceita,
opcionalmente, `deviceKind` e `targets` (tentativas, acertos e impacto por alvo);
o impacto só é enviado quando veio da parede real, nunca do simulador.

`/me/statistics` devolve o painel do jogador: resumo (precisão, tempo jogado,
respostas, XP, sessões na parede real), atividade diária dos últimos 30 dias,
desempenho por modo, acertos e impacto por alvo, as 10 sessões mais recentes,
ofensiva, progressão e posição no ranking. As consultas recebem um
`StatisticsScope` (`player` ou `all`), o mesmo recorte que o painel web geral vai
usar para agregar todos os jogadores.

`/rankings/:category` é público: `xp`, `bestScore`, `totalScore`,
`infiniteColor`, `infiniteScore` ou `dailyStreak`. Devolve os 50 primeiros, o
total de classificados e, com um token válido, a posição de quem pediu (`viewer`),
mesmo fora do top 50. Empates dividem a posição (`RANK()`), e ids de usuário não
saem na resposta. O ranking confia nas sessões que o app envia — é o risco R04 do
relatório de cibersegurança, ainda em aberto.

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

Os testes do app (`jest-expo`) esbarram na mesma regressão: no Node 22.17.1 o
Babel deixa de encontrar plugins já instalados. Rode `npm test` do `frontend` com
o Node 20 (ou 22.6); os testes do backend e o Metro funcionam no 22.17.1.

---

## Escopo desta entrega

Login e cadastro funcionais, persistindo no PostgreSQL. Home e Perfil mostram
dados reais do jogador, agora alimentados pelo gameplay. O Perfil traz
estatísticas, recordes, progressão, conquistas e as configurações (tema e sair da
conta). O avatar no topo da Home abre um menu com "Ver perfil" e "Sair da conta".

A aba Jogar traz Color Mode e Score Mode com 20 níveis cada, seleção de nível,
tutorial por modo, resultados com métricas e gravação da sessão no backend.

A aba Estatísticas mostra o painel do jogador — gráficos de atividade e de
precisão, mapa de acertos da parede, precisão por cor, impacto por alvo, modos,
sessões recentes e recordes — e a telemetria da parede, dos sensores e do sistema.
Campos de hardware que o firmware ainda não envia aparecem como "Indisponível". O
botão do painel geral na web já está na tela, desabilitado até o site existir.

A aba Ranking tem seis categorias, pódio, lista dos 50 primeiros e a posição do
jogador fixada no rodapé quando ele está fora da lista. Visitantes veem o ranking
com um convite para entrar.

Fora do escopo por enquanto: o painel web geral e o Desafio Diário como modo
próprio. O firmware do ESP32 já existe em `backend/firmware/`; sem a
parede montada, o app continua usando o dispositivo simulado.
