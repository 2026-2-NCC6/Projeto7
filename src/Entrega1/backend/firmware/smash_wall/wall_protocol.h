#pragma once

#include <Arduino.h>

#include "wall_sensors.h"

/**
 * Versão do protocolo. Campo novo e opcional não muda esse número; qualquer
 * coisa que quebre um app já publicado, muda.
 */
static const uint8_t WALL_PROTOCOL_VERSION = 1;

/** O contrato Impacto, sem `tipo` — é assim que o app reconhece um impacto. */
String impactFrame(const WallImpact& impact, const char* session);

String helloFrame(const char* session, uint8_t targets);

String statusFrame(const char* session, uint8_t clients, int rssi);

String errorFrame(const char* detail);

/**
 * Interpreta um comando do app. Devolve false e preenche `error` quando a
 * mensagem não presta — nunca derruba a parede por causa de um quadro inválido.
 */
bool applyCommand(const uint8_t* payload, size_t length, String& session, String& error);
