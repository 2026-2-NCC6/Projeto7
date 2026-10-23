#!/usr/bin/env node
/**
 * Emulador da parede Smash — o mesmo protocolo do firmware, sem ESP32.
 *
 * Sobe um servidor WebSocket que se comporta como backend/firmware/smash_wall:
 * manda `hello` ao conectar, `status` a cada 2 s, responde `session`, `ping` e
 * `feedback` e publica impactos no formato `Impacto`. O que o LED da placa
 * faria aparece no terminal como `[atuador] ...`. Serve para testar o app pela rede,
 * do mesmo jeito que ele vai falar com a parede de verdade.
 *
 *   npm run wall               porta 8181 (a 81 do ESP32 exige root no Linux)
 *   WALL_PORT=9000 npm run wall
 *
 * Teclas: 1..6 batem no alvo · r alvo aleatório · m mensagem malformada
 *         b reinicia a parede · q sai
 */
import { networkInterfaces } from 'node:os';
import { WebSocketServer } from 'ws';

const PROTOCOL_VERSION = 2;
const WALL_ID = 'wall-emulador';
const COLUMNS = 3;
const TARGETS = 6;
const STATUS_INTERVAL_MS = 2000;
const PORT = Number(process.env.WALL_PORT ?? 8181);

let bootedAt = Date.now();
let session = newSession();

const millis = () => Date.now() - bootedAt;

/** Como o LED da placa (GPIO 2) pisca em cada sinal (config.h). */
const CUES = {
  impacto: 'LED pisca curto',
  acerto: 'LED acende 250 ms',
  erro: 'LED pisca 3× rápido',
  nivel_concluido: 'LED pisca 3× longo',
  nivel_falhou: 'LED pisca 4× rápido',
};

function play(cue) {
  console.log(`[atuador] ${cue} · ${CUES[cue]}`);
}

function newSession() {
  return `${WALL_ID}-${Math.floor(1000 + Math.random() * 9000)}`;
}

const server = new WebSocketServer({ port: PORT });

function send(client, frame) {
  client.send(typeof frame === 'string' ? frame : JSON.stringify(frame));
}

function broadcast(frame) {
  server.clients.forEach((client) => send(client, frame));
}

function statusFrame() {
  return { tipo: 'status', sessao: session, clientes: server.clients.size, rssi: -42, t_ms: millis() };
}

/** Mesmas regras de applyCommand em wall_protocol.cpp. */
function applyCommand(raw) {
  let doc;

  try {
    doc = JSON.parse(raw);
  } catch {
    return 'JSON invalido';
  }

  if (typeof doc?.cmd !== 'string') {
    return 'comando ausente';
  }

  if (doc.cmd === 'session') {
    if (typeof doc.sessao !== 'string' || doc.sessao.length === 0) {
      return 'sessao ausente';
    }
    session = doc.sessao;
    return null;
  }

  if (doc.cmd === 'feedback') {
    if (typeof doc.resultado !== 'string') {
      return 'resultado ausente';
    }
    if (doc.resultado === 'impacto' || !(doc.resultado in CUES)) {
      return 'resultado desconhecido';
    }
    play(doc.resultado);
    return null;
  }

  return doc.cmd === 'ping' ? null : 'comando desconhecido';
}

server.on('connection', (client) => {
  send(client, { tipo: 'hello', protocolo: PROTOCOL_VERSION, parede: WALL_ID, alvos: TARGETS, sessao: session, t_ms: millis() });
  console.log(`[ws] cliente conectado (${server.clients.size})`);

  client.on('message', (data) => {
    const error = applyCommand(String(data));

    if (error) {
      send(client, { tipo: 'erro', detalhe: error, t_ms: millis() });
      console.log(`[ws] comando recusado: ${error}`);
      return;
    }

    send(client, statusFrame());
  });

  client.on('close', () => console.log(`[ws] cliente saiu (${server.clients.size})`));
});

setInterval(() => {
  if (server.clients.size > 0) {
    broadcast(statusFrame());
  }
}, STATUS_INTERVAL_MS);

function hit(target) {
  const index = target - 1;
  const impact = {
    alvo: target,
    linha: Math.floor(index / COLUMNS) + 1,
    coluna: (index % COLUMNS) + 1,
    intensidade: Math.floor(800 + Math.random() * 2800),
    t_ms: millis(),
    sessao: session,
  };

  broadcast(impact);
  console.log(JSON.stringify(impact));

  // Sem app, a parede responde sozinha; com app, quem decide o sinal é o jogo.
  if (server.clients.size === 0) {
    play('impacto');
  }
}

/** Como um brownout: os sockets caem e o relógio volta para zero. */
function reboot() {
  server.clients.forEach((client) => client.terminate());
  bootedAt = Date.now();
  session = newSession();
  console.log('[smash] parede reiniciada: t_ms voltou a zero');
}

function onKey(key) {
  if (key >= '1' && key <= String(TARGETS)) {
    hit(Number(key));
  } else if (key === 'r') {
    hit(1 + Math.floor(Math.random() * TARGETS));
  } else if (key === 'm') {
    broadcast('{"alvo":');
    console.log('[ws] mensagem malformada enviada');
  } else if (key === 'b') {
    reboot();
  } else if (key === 'q' || key === '\u0003') {
    process.exit(0);
  }
}

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => [...chunk].forEach(onKey));

server.on('listening', () => {
  const lan = Object.values(networkInterfaces())
    .flat()
    .filter((net) => net?.family === 'IPv4' && !net.internal)
    .map((net) => `ws://${net.address}:${PORT}`);

  console.log(`[smash] emulador da parede 3×2 na porta ${PORT}`);
  console.log(`  emulador Android: ws://10.0.2.2:${PORT}`);
  lan.forEach((url) => console.log(`  celular na mesma rede: ${url}`));
  console.log('  teclas: 1..6 alvo · r aleatório · m malformada · b reinicia · q sai');
});
