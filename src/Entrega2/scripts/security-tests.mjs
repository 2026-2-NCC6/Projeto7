#!/usr/bin/env node
/**
 * Testes de segurança do Smash — os ataques do relatório de Cibersegurança,
 * repetíveis. Cada teste tenta o que um cliente mal-intencionado faria e confere
 * que a API ou a parede recusa.
 *
 * Precisa da API e de uma parede no ar: o emulador (npm run wall) ou a placa.
 *
 *   npm run security:test
 *   API_URL=http://127.0.0.1:3000 WALL_URL=ws://127.0.0.1:8181 WALL_TOKEN=emulador-local npm run security:test
 *   WALL_URL=ws://192.168.4.1:81 WALL_TOKEN=<segredo do secrets.h> npm run security:test   (placa real)
 *
 * As contas criadas ficam em demo.smash.test; apague com npm --prefix backend run demo:clean.
 * O login tem limite de tentativas por endereço: espere 5 minutos entre duas execuções.
 */
import WebSocket from 'ws';

const API = process.env.API_URL ?? 'http://127.0.0.1:3000';
const WALL = process.env.WALL_URL ?? 'ws://127.0.0.1:8181';
const WALL_TOKEN = process.env.WALL_TOKEN ?? 'emulador-local';

const results = [];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function check(risk, attempt, ok, observed) {
  results.push({ risk, attempt, ok, observed });
  console.log(`${ok ? '[OK]    ' : '[FALHOU]'} ${risk}  ${attempt} -> ${observed}`);
}

async function call(method, path, { body, token, headers = {} } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  const message = Array.isArray(payload.message) ? payload.message[0] : payload.message;
  return { status: response.status, payload, message, headers: response.headers };
}

const stamp = Date.now().toString(36);
const emailFor = (who) => `seguranca-${who}-${stamp}@demo.smash.test`;
const PASSWORD = `Teste-${stamp}-senha`;

async function signUp(who) {
  const { payload } = await call('POST', '/auth/sign-up', {
    body: { name: `Teste ${who}`, email: emailFor(who), password: PASSWORD },
  });
  return payload.accessToken;
}

async function apiTests() {
  // R06 — limite de tentativas no login
  await signUp('senha');
  const statuses = [];
  for (let attempt = 1; attempt <= 7; attempt += 1) {
    statuses.push((await call('POST', '/auth/sign-in', { body: { email: emailFor('senha'), password: 'errada-123' } })).status);
  }
  check('R06', '7 logins com senha errada na mesma conta',
    statuses.slice(0, 5).every((s) => s === 401) && statuses.slice(5).every((s) => s === 429),
    statuses.join(', '));

  // R27 — o bloqueio por conta vale também para e-mail sem conta, então não revela quem tem conta.
  // A janela por endereço (10 por minuto) precisa recomeçar antes, ou ela bloquearia primeiro.
  await wait(61_000);
  const ghost = [];
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    ghost.push((await call('POST', '/auth/sign-in', { body: { email: emailFor('inexistente'), password: 'errada-123' } })).status);
  }
  check('R27', '6 logins num e-mail que não tem conta',
    ghost.slice(0, 5).every((s) => s === 401) && ghost[5] === 429, `${ghost.join(', ')} (igual a uma conta real)`);

  // R27 — o cadastro revela se o e-mail já tem conta (risco aceito, registrado)
  const duplicate = await call('POST', '/auth/sign-up', {
    body: { name: 'Teste repetido', email: emailFor('senha'), password: PASSWORD },
  });
  check('R27', 'cadastrar um e-mail que já existe', duplicate.status === 409,
    `${duplicate.status} "${duplicate.message}" (risco aceito)`);

  // R10 — sair da conta cancela o token
  const token = await signUp('saida');
  const before = (await call('GET', '/me/home', { token })).status;
  const out = (await call('POST', '/auth/sign-out', { token })).status;
  const after = (await call('GET', '/me/home', { token })).status;
  check('R10', 'usar o token depois de sair da conta', before === 200 && out === 204 && after === 401,
    `antes ${before}, saída ${out}, depois ${after}`);

  // R04 — o resultado só vale com o comprovante aberto pelo servidor
  const player = await signUp('partida');
  const locked = await call('POST', '/me/sessions/start', { token: player, body: { mode: 'level_color', level: 5 } });
  check('R04', 'começar o nível 5 sem ter passado do 4', locked.status === 400, `${locked.status} "${locked.message}"`);

  const result = (ticket, overrides = {}) => ({
    ticket, mode: 'level_color', level: 1, cleared: true, score: 100, hits: 6, misses: 1, bestStreak: 4, durationMs: 2500, ...overrides,
  });
  const opened = await call('POST', '/me/sessions/start', { token: player, body: { mode: 'level_color', level: 1 } });
  await wait(3000);
  const first = await call('POST', '/me/sessions', { token: player, body: result(opened.payload.ticket) });
  check('R04', 'enviar um resultado legítimo', first.status === 201, `${first.status}, ${first.payload.xpAwarded} XP`);
  const again = await call('POST', '/me/sessions', { token: player, body: result(opened.payload.ticket) });
  check('R04', 'enviar o mesmo resultado de novo', again.status === 409, `${again.status} "${again.message}"`);

  const { ticket: _unused, ...withoutTicket } = result('');
  const noTicket = await call('POST', '/me/sessions', { token: player, body: withoutTicket });
  check('R04', 'enviar resultado sem comprovante', noTicket.status === 400, `${noTicket.status} "${noTicket.message}"`);

  const fresh = (await call('POST', '/me/sessions/start', { token: player, body: { mode: 'level_color', level: 1 } })).payload.ticket;
  for (const [attempt, overrides] of [
    ['declarar 1 hora de jogo logo depois de começar', { durationMs: 3_600_000 }],
    ['trocar o nível no resultado', { level: 20, durationMs: 1000 }],
    ['declarar 999.999 pontos com 6 acertos', { score: 999_999, durationMs: 2000 }],
  ]) {
    const response = await call('POST', '/me/sessions', { token: player, body: result(fresh, overrides) });
    check('R04', attempt, response.status === 400, `${response.status} "${response.message}"`);
  }
  const ticketAsToken = (await call('GET', '/me/home', { token: fresh })).status;
  check('R04', 'usar o comprovante como token de acesso', ticketAsToken === 401, String(ticketAsToken));

  // R08 — nenhum site de fora recebe permissão
  const cors = await call('GET', '/rankings/xp', { headers: { Origin: 'https://site-qualquer.example' } });
  const allowed = cors.headers.get('access-control-allow-origin');
  check('R08', 'chamar a API a partir de um site qualquer', !allowed, allowed ? `liberado: ${allowed}` : 'sem permissão');

  // R23 — cabeçalhos de segurança
  const headers = cors.headers;
  const ok = headers.get('x-content-type-options') === 'nosniff' && !headers.get('x-powered-by')
    && headers.get('cache-control') === 'no-store';
  check('R23', 'conferir os cabeçalhos de segurança', ok,
    `nosniff=${headers.get('x-content-type-options')}, x-powered-by=${headers.get('x-powered-by') ?? 'ausente'}, cache=${headers.get('cache-control')}`);
}

/** Abre uma conexão com a parede e junta o que ela mandar. */
function connect(path) {
  return new Promise((resolve) => {
    const socket = new WebSocket(`${WALL.replace(/\/+$/, '')}${path}`);
    const frames = [];
    const state = { socket, frames, closed: false };
    socket.on('message', (data) => {
      try {
        frames.push(JSON.parse(String(data)));
      } catch {
        frames.push({ raw: String(data) });
      }
    });
    socket.on('close', () => {
      state.closed = true;
    });
    socket.on('open', () => resolve(state));
    socket.on('error', () => resolve(state));
  });
}

const detailOf = (state) => state.frames.find((frame) => frame.tipo === 'erro')?.detalhe;

async function wallTests() {
  const token = encodeURIComponent(WALL_TOKEN);

  const none = await connect('/');
  await wait(400);
  check('R02', 'conectar à parede sem senha de pareamento', detailOf(none) === 'nao autorizado' && none.closed,
    `"${detailOf(none)}", fechada: ${none.closed}`);

  const wrong = await connect('/?token=chute');
  await wait(400);
  check('R02', 'conectar com a senha de pareamento errada', detailOf(wrong) === 'nao autorizado' && wrong.closed,
    `"${detailOf(wrong)}", fechada: ${wrong.closed}`);

  const app = await connect(`/?token=${token}`);
  await wait(400);
  check('R02', 'conectar com a senha certa', app.frames[0]?.tipo === 'hello' && !app.closed, `${app.frames[0]?.tipo}`);

  const intruder = await connect(`/?token=${token}`);
  await wait(400);
  check('R05', 'conectar um segundo aplicativo com a senha certa', detailOf(intruder) === 'parede ocupada' && intruder.closed,
    `"${detailOf(intruder)}", fechada: ${intruder.closed}`);

  app.frames.length = 0;
  app.socket.send(JSON.stringify({ cmd: 'session', sessao: 'x'.repeat(400) }));
  await wait(400);
  check('R07', 'mandar uma mensagem de 400 bytes', detailOf(app) === 'comando grande demais', `"${detailOf(app)}"`);

  await wait(1100);
  app.frames.length = 0;
  for (let i = 0; i < 30; i += 1) {
    app.socket.send('{"cmd":"ping"}');
  }
  await wait(800);
  const refused = app.frames.filter((frame) => frame.detalhe === 'comandos demais').length;
  check('R07', 'mandar 30 comandos de uma vez', refused === 10, `${30 - refused} aceitos, ${refused} recusados`);

  app.socket.close();
  await wait(600);
  const next = await connect(`/?token=${token}`);
  await wait(400);
  check('R05', 'parear outro aplicativo depois que o primeiro saiu', next.frames[0]?.tipo === 'hello', `${next.frames[0]?.tipo}`);
  next.socket.close();
}

console.log(`API ${API} · parede ${WALL}\n`);
await apiTests();
await wallTests();

const failed = results.filter((result) => !result.ok).length;
console.log(`\n${results.length - failed} de ${results.length} testes passaram.`);
process.exitCode = failed > 0 ? 1 : 0;
setTimeout(() => process.exit(), 200);
