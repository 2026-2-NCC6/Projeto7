#pragma once

#include <stdint.h>

/** O que a parede pode tocar. CUE_NONE é "nenhum comando de som". */
enum WallCue : uint8_t {
  CUE_NONE,
  CUE_IMPACT,
  CUE_HIT,
  CUE_MISS,
  CUE_LEVEL_CLEARED,
  CUE_LEVEL_FAILED,
};

void actuatorBegin();

/** Começa um som agora, interrompendo o que estiver tocando. */
void actuatorPlay(WallCue cue);

/**
 * Avança o som em andamento. Não bloqueia: compara millis(), como a máquina
 * de detecção, para nunca atrasar a leitura dos piezos.
 */
void actuatorLoop();
