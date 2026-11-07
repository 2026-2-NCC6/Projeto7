/**
 * Smash — firmware da parede instrumentada de treino de tênis.
 *
 * Seis alvos de MDF numa grade 3×2, um piezo atrás de cada um, cada piezo no
 * seu próprio pino. Este sketch lê os piezos,
 * identifica qual alvo foi atingido e publica o evento no formato que o app
 * espera. Ele não sabe o que é um jogo: só existe impacto, alvo e intensidade.
 *
 * Configure tudo em config.h. No modo Station, copie secrets_example.h para
 * secrets.h antes de compilar.
 *
 * Placa: ESP32 Dev Module. Bibliotecas: WebSockets (Markus Sattler) e
 * ArduinoJson (Benoît Blanchon). Veja ../README.md.
 */

#include "config.h"
#include "wall_actuator.h"
#include "wall_link.h"
#include "wall_sensors.h"

void setup() {
  Serial.begin(SERIAL_BAUD);
  delay(200);  // dá tempo do monitor serial abrir antes do primeiro log
  Serial.println();
  Serial.println("[smash] parede iniciando");

  sensorsBegin();
  actuatorBegin();
  linkBegin();

#if CALIBRATION_MODE
  Serial.println("[smash] MODO CALIBRACAO: batendo em cada alvo, anote os picos");
#endif
}

void loop() {
  // O socket é servido em toda iteração: uma falha de rede não pode travar a
  // leitura dos sensores, e a leitura não pode atrasar a rede.
  linkLoop();
  actuatorLoop();

#if CALIBRATION_MODE
  sensorsCalibrationTick();
#else
  WallImpact impact;

  if (sensorsPoll(impact)) {
    linkBroadcastImpact(impact);

    // Sem app, a parede responde sozinha; com app, quem decide o sinal é o jogo.
    if (!linkHasClients()) {
      actuatorPlay(CUE_IMPACT);
    }
  }
#endif
}
