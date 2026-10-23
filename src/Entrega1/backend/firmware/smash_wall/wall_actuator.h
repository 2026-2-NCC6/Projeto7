#pragma once

#include <stdint.h>

/** Os sinais que o LED da placa sabe dar. CUE_NONE é "nenhum sinal". */
enum WallCue : uint8_t {
  CUE_NONE,
  CUE_IMPACT,
  CUE_HIT,
  CUE_MISS,
  CUE_LEVEL_CLEARED,
  CUE_LEVEL_FAILED,
};

void actuatorBegin();

/** Começa um sinal agora, interrompendo o que estiver piscando. */
void actuatorPlay(WallCue cue);

/**
 * Avança o sinal em andamento. Não bloqueia: compara millis(), como a máquina
 * de detecção, para nunca atrasar a leitura dos piezos.
 */
void actuatorLoop();
