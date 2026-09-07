# Smash — Entrega 1

Autenticação (login e cadastro) com persistência real em PostgreSQL, e a Home
com os dados do jogador vindos do backend.

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
training_sessions     uma linha por treino: modo, score, acertos, erros,
                      melhor sequência, duração, quando
```

Ao criar uma conta, o backend grava numa **transação** o usuário, as duas
trilhas de progressão (nível 0, 0 XP) e a ofensiva zerada.

O "Resumo" da Home é agregado por consulta sobre `training_sessions`
(`COUNT`, `MAX(best_streak)`, `SUM(score)`) — nada é desnormalizado, então
os números nunca saem de sincronia com as sessões.

### Modos de jogo

| Modo | Ícone | Trilha | Tem nível? |
| --- | --- | --- | --- |
| Level Color Mode | sequência de blocos | `color` | sim |
| Level Score Mode | alvo | `score` | sim |
| Infinite Color Mode | infinito | `color` | não |
| Infinite Score Mode | cronômetro | `score` | não |

Os ícones são SVG desenhados em `src/components/Icon`, sem fonte de ícones.
A chama da ofensiva usa o mesmo ícone em dois estados: preenchida quando a
ofensiva é maior que zero, só contorno (e em cinza) quando está zerada.

Regra de XP em `domain/progression/level-rules.ts`:
`xpDoNível(n) = 500 + n * 250`. O jogador começa no nível 0.

---

## API

| Método | Rota | Auth | Respostas |
| --- | --- | --- | --- |
| POST | `/auth/sign-up` | — | `201` · `409` e-mail em uso · `400` validação |
| POST | `/auth/sign-in` | — | `200` · `401` credenciais inválidas |
| GET | `/me/home` | Bearer | `200` · `401` sem token/expirado |

`/me/home` devolve nome do jogador, ofensiva diária, progressão por trilha e o
resumo das sessões.

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
src/theme/       tokens de cor, espaçamento, raio, tipografia e sombra
src/content/     todos os textos da interface (pt-BR) e a saudação por horário
src/components/  componentes compartilhados
src/screens/     Login, SignUp, Home (com componentes próprios em components/)
src/navigation/  stack de autenticação, tabs e tab bar customizada
src/services/    cliente HTTP, serviço de autenticação e da Home
src/hooks/       formulários e carregamento da Home
src/store/       sessão (zustand)
```

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

Login e cadastro funcionais, persistindo no PostgreSQL. A Home mostra dados
reais do jogador (todos começam zerados, porque ainda não existe gameplay que
grave sessões). As abas Jogar, Estatísticas, Ranking e Perfil mostram um
placeholder — fazem parte de entregas futuras, assim como os minigames e a
integração com o ESP32.
