#pragma once

#include <Arduino.h>

#include "wall_sensors.h"

/** Sobe o Wi-Fi (SoftAP ou Station), o mDNS e o servidor WebSocket. */
void linkBegin();

/** Serve o socket, mantém o Wi-Fi de pé e manda o batimento. Não bloqueia. */
void linkLoop();

/** Manda o impacto ao app pareado e, com SERIAL_ECHO, ao Serial. */
void linkBroadcastImpact(const WallImpact& impact);

/** Algum app está pareado agora? */
bool linkHasClients();
