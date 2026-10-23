#pragma once

#include <Arduino.h>

#include "wall_actuator.h"
#include "wall_sensors.h"

/**
 * Versão do protocolo. Campo novo e opcional não muda esse número; qualquer
 * coisa que quebre um app já publicado, muda. A versão 2 é a parede 3×2:
 * `alvo` 1..6, `linha` 1..2, `coluna` 1..3.
 */
static const uint8_t WALL_PROTOCOL_VERSION = 2;

/** O contrato Impacto, sem `tipo` — é assim que o app reconhece um impacto. */
String impactFrame(const WallImpact& impact, const char* session);

String helloFrame(const char* session, uint8_t targets);

String statusFrame(const char* session, uint8_t clients, int rssi);

String errorFrame(const char* detail);

/**
 * Interpreta um comando do app. Devolve false e preenche `error` quando a
 * mensagem não presta — nunca derruba a parede por causa de um quadro inválido.
 * Um `feedback` válido preenche `cue` com o sinal a dar; os outros deixam CUE_NONE.
 */
bool applyCommand(const uint8_t* payload, size_t length, String& session, WallCue& cue,
                  String& error);
