#include "wall_link.h"

#include <ESPmDNS.h>
#include <WebSocketsServer.h>
#include <WiFi.h>

#include "config.h"
#include "wall_protocol.h"

#if !WALL_MODE_SOFTAP
#include "secrets.h"
#endif

namespace {

WebSocketsServer server(WALL_WS_PORT);

/**
 * Identifica esta inicialização da parede. O app sobrescreve com o id da sessão
 * de treino assim que conecta; até lá, é este valor que vai em `sessao`.
 */
String session;
uint32_t statusSentAt = 0;

void onWebSocketEvent(uint8_t client, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED: {
      const String hello = helloFrame(session.c_str(), TARGET_COUNT);
      server.sendTXT(client, hello.c_str());
      Serial.printf("[ws] cliente %u conectado\n", client);
      break;
    }

    case WStype_DISCONNECTED:
      Serial.printf("[ws] cliente %u saiu\n", client);
      break;

    case WStype_TEXT: {
      String error;

      if (!applyCommand(payload, length, session, error)) {
        const String rejection = errorFrame(error.c_str());
        server.sendTXT(client, rejection.c_str());
        return;
      }

      // Tanto `session` quanto `ping` são respondidos com o estado atual.
      const String state =
          statusFrame(session.c_str(), server.connectedClients(), WiFi.RSSI());
      server.sendTXT(client, state.c_str());
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
    return;
  }

  Serial.println("[wifi] sem conexao, tentando de novo");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}
#endif

}  // namespace

void linkBegin() {
  session = String(WALL_ID) + "-" + String(millis()) + String(random(1000, 9999));

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

    if (server.connectedClients() > 0) {
      const String beat =
          statusFrame(session.c_str(), server.connectedClients(), WiFi.RSSI());
      server.broadcastTXT(beat.c_str());
    }
  }
}

void linkBroadcastImpact(const WallImpact& impact) {
  const String frame = impactFrame(impact, session.c_str());

  server.broadcastTXT(frame.c_str());

#if SERIAL_ECHO
  Serial.println(frame);
#endif
}

