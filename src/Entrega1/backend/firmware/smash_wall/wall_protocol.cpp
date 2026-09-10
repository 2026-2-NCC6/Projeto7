#include "wall_protocol.h"

#include <ArduinoJson.h>

#include "config.h"

namespace {

String serialize(const JsonDocument& doc) {
  String out;
  serializeJson(doc, out);
  return out;
}

}  // namespace

String impactFrame(const WallImpact& impact, const char* session) {
  JsonDocument doc;

  doc["alvo"] = impact.target;
  doc["linha"] = impact.row;
  doc["coluna"] = impact.column;
  doc["intensidade"] = impact.intensity;
  doc["t_ms"] = impact.atMs;
  doc["sessao"] = session;

  return serialize(doc);
}

String helloFrame(const char* session, uint8_t targets) {
  JsonDocument doc;

  doc["tipo"] = "hello";
  doc["protocolo"] = WALL_PROTOCOL_VERSION;
  doc["parede"] = WALL_ID;
  doc["alvos"] = targets;
  doc["sessao"] = session;
  doc["t_ms"] = millis();

  return serialize(doc);
}

String statusFrame(const char* session, uint8_t clients, int rssi) {
  JsonDocument doc;

  doc["tipo"] = "status";
  doc["sessao"] = session;
  doc["clientes"] = clients;
  doc["rssi"] = rssi;
  doc["t_ms"] = millis();

  return serialize(doc);
}

String errorFrame(const char* detail) {
  JsonDocument doc;

  doc["tipo"] = "erro";
  doc["detalhe"] = detail;
  doc["t_ms"] = millis();

  return serialize(doc);
}

bool applyCommand(const uint8_t* payload, size_t length, String& session, String& error) {
  JsonDocument doc;
  const DeserializationError failure = deserializeJson(doc, payload, length);

  if (failure) {
    error = "JSON invalido";
    return false;
  }

  const char* command = doc["cmd"];

  if (command == nullptr) {
    error = "comando ausente";
    return false;
  }

  // O app manda o id da sessão de treino ao conectar; a parede passa a repeti-lo
  // em `sessao`, que é o que o contrato pede.
  if (strcmp(command, "session") == 0) {
    const char* value = doc["sessao"];

    if (value == nullptr || strlen(value) == 0) {
      error = "sessao ausente";
      return false;
    }

    session = value;
    return true;
  }

  if (strcmp(command, "ping") == 0) {
    return true;
  }

  error = "comando desconhecido";
  return false;
}
