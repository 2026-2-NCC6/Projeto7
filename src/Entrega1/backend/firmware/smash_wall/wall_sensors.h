#pragma once

#include <stdint.h>

/** Um impacto já atribuído a um alvo, pronto para virar mensagem. */
struct WallImpact {
  uint8_t target;      // 1..9
  uint8_t row;         // 1..3
  uint8_t column;      // 1..3
  uint16_t intensity;  // pico do ADC, 0..4095
  uint32_t atMs;       // millis() no momento do impacto
};

/**
 * Máquina de estados por varredura (diagrama de Teoria da Computação):
 *
 *   IDLE -> ARMED -> MEASURING_PEAK -> EVENT_EMITTED -> DEBOUNCE -> IDLE
 *
 * As transições dependem só do limiar e do tempo decorrido. Nada bloqueia:
 * cada chamada faz uma varredura dos nove canais e volta.
 */
enum WallState : uint8_t {
  WALL_IDLE,
  WALL_ARMED,
  WALL_MEASURING_PEAK,
  WALL_EVENT_EMITTED,
  WALL_DEBOUNCE,
};

void sensorsBegin();

/** Devolve true, uma vez, quando um impacto foi identificado. */
bool sensorsPoll(WallImpact& impact);

/** Imprime o pico de cada alvo no Serial, para calibrar os limiares. */
void sensorsCalibrationTick();
