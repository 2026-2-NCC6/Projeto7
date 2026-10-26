#include "wall_link.h"

#include <ESPmDNS.h>
#include <WebSocketsServer.h>
#include <WiFi.h>

#include "config.h"

#if !__has_include("secrets.h")
#error "Falta secrets.h: copie secrets_example.h para secrets.h e troque as senhas."
#endif
#include "secrets.h"
#include "wall_protocol.h"

namespace {

WebSocketsServer server(WALL_WS_PORT);

/** Nenhum app pareado. */
const int16_t NO_CLIENT = -1;

/**
 * Identifica esta inicialização da parede. O app pareado sobrescreve com o id da
 * sessão de treino assim que conecta; até lá, é este valor que vai em `sessao`.
 */
String bootSession;
String session;
uint32_t statusSentAt = 0;

/** O único app que recebe impactos e manda comandos. */
int16_t pairedClient = NO_CLIENT;
uint32_t commandWindowStartedAt = 0;
uint8_t commandsInWindow = 0;

/** O valor de `token=` no caminho da conexão (`/?token=...`), ou vazio. */
String tokenFrom(const uint8_t* url, size_t length) {
  const String path(reinterpret_cast<const char*>(url), length);
  const int start = path.indexOf("token=");

  if (start < 0) {
    return "";
  }

  const int end = path.indexOf('&', start);
  return path.substring(start + 6, end < 0 ? path.length() : end);
}

/** Compara sem parar no primeiro caractere diferente, para o tempo não revelar o segredo. */
bool matchesPairingToken(const String& given) {
  const size_t expectedLength = strlen(WALL_PAIRING_TOKEN);
  uint8_t diff = given.length() == expectedLength ? 0 : 1;

  for (size_t i = 0; i < expectedLength; i++) {
    const char actual = i < given.length() ? given[i] : 0;
    diff |= actual ^ WALL_PAIRING_TOKEN[i];
  }

  return diff == 0;
}

void refuse(uint8_t client, const char* reason) {
  const String rejection = errorFrame(reason);
  server.sendTXT(client, rejection.c_str());
  Serial.printf("[ws] cliente %u recusado: %s\n", client, reason);
  server.disconnect(client);
}

/**
 * O primeiro app com o segredo certo fica com a parede até sair. Um segundo app
 * não toma o lugar dele no meio do treino; um app que caiu sem avisar é
 * derrubado pelo ping e libera a parede.
 */
void pair(uint8_t client) {
  pairedClient = client;
  session = bootSession;
  commandsInWindow = 0;

  const String hello = helloFrame(session.c_str(), TARGET_COUNT);
  server.sendTXT(client, hello.c_str());
  Serial.printf("[ws] cliente %u pareado\n", client);
}

/** Janela de 1 s: acima do limite, o comando é recusado sem ser interpretado. */
bool withinCommandRate() {
  const uint32_t now = millis();

  if (now - commandWindowStartedAt >= 1000) {
    commandWindowStartedAt = now;
    commandsInWindow = 0;
  }

  commandsInWindow++;
  return commandsInWindow <= MAX_COMMANDS_PER_SECOND;
}

void onWebSocketEvent(uint8_t client, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      // No CONNECTED, o payload é o caminho pedido pelo app: /?token=...
      if (!matchesPairingToken(tokenFrom(payload, length))) {
        refuse(client, "nao autorizado");
      } else if (pairedClient != NO_CLIENT) {
        refuse(client, "parede ocupada");
      } else {
        pair(client);
      }
      break;

    case WStype_DISCONNECTED:
      Serial.printf("[ws] cliente %u saiu\n", client);

      // A sessão era do app que saiu: a parede volta ao id da inicialização.
      if (client == pairedClient) {
        pairedClient = NO_CLIENT;
        session = bootSession;
      }
      break;

    case WStype_TEXT: {
      if (client != pairedClient) {
        refuse(client, "nao autorizado");
        return;
      }

      String error;
      WallCue cue;

      if (length > MAX_COMMAND_BYTES) {
        error = "comando grande demais";
      } else if (!withinCommandRate()) {
        error = "comandos demais";
      } else if (applyCommand(payload, length, session, cue, error)) {
        actuatorPlay(cue);

        // Todo comando aceito é respondido com o estado atual.
        const String state = statusFrame(session.c_str(), 1, WiFi.RSSI());
        server.sendTXT(client, state.c_str());
        return;
      }

      const String rejection = errorFrame(error.c_str());
      server.sendTXT(client, rejection.c_str());
      break;
    }

    default:
      break;
  }
}

void startSoftAp() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(SOFTAP_SSID, SOFTAP_PASSWORD);
  Serial.print("[wifi] SoftAP ");
  Serial.print(SOFTAP_SSID);
  Serial.print(" em ws://");
  Serial.print(WiFi.softAPIP());
  Serial.printf(":%u\n", WALL_WS_PORT);
}

#if !WALL_MODE_SOFTAP
uint32_t wifiCheckedAt = 0;
bool stationAnnounced = false;

void startStation() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[wifi] entrando na rede ");
  Serial.println(WIFI_SSID);
}

/** Reconexão sem bloquear: nenhuma espera trava a leitura dos sensores. */
void keepStationAlive() {
  const uint32_t now = millis();

  if (now - wifiCheckedAt < WIFI_RETRY_MS) {
    return;
  }

  wifiCheckedAt = now;

  if (WiFi.status() == WL_CONNECTED) {
    // O app precisa deste IP em EXPO_PUBLIC_DEVICE_URL: o Android resolve mal o smash.local.
    if (!stationAnnounced) {
      stationAnnounced = true;
      Serial.print("[wifi] conectado em ws://");
      Serial.print(WiFi.localIP());
      Serial.printf(":%u\n", WALL_WS_PORT);
    }
    return;
  }

  stationAnnounced = false;
  Serial.println("[wifi] sem conexao, tentando de novo");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}
#endif

}  // namespace

void linkBegin() {
  bootSession = String(WALL_ID) + "-" + String(millis()) + String(random(1000, 9999));
  session = bootSession;

#if WALL_MODE_SOFTAP
  startSoftAp();
#else
  startStation();
#endif

  if (MDNS.begin(WALL_HOSTNAME)) {
    MDNS.addService("smash", "tcp", WALL_WS_PORT);
    Serial.printf("[mdns] %s.local\n", WALL_HOSTNAME);
  }

  server.begin();
  server.onEvent(onWebSocketEvent);
  server.enableHeartbeat(PING_INTERVAL_MS, PONG_TIMEOUT_MS, PONG_MISSES_TO_DROP);
  Serial.printf("[ws] servidor na porta %u\n", WALL_WS_PORT);
}

void linkLoop() {
  server.loop();

#if !WALL_MODE_SOFTAP
  keepStationAlive();
#endif

  const uint32_t now = millis();

  if (now - statusSentAt >= STATUS_INTERVAL_MS) {
    statusSentAt = now;

    if (pairedClient != NO_CLIENT) {
      const String beat = statusFrame(session.c_str(), 1, WiFi.RSSI());
      server.sendTXT(pairedClient, beat.c_str());
    }
  }
}

void linkBroadcastImpact(const WallImpact& impact) {
  const String frame = impactFrame(impact, session.c_str());

  // Só o app pareado recebe: um aparelho qualquer na rede não ouve o jogo.
  if (pairedClient != NO_CLIENT) {
    server.sendTXT(pairedClient, frame.c_str());
  }

#if SERIAL_ECHO
  Serial.println(frame);
#endif
}


bool linkHasClients() {
  return pairedClient != NO_CLIENT;
}
