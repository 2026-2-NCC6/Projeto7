#include "wall_sensors.h"

#include <Arduino.h>

#include "config.h"

namespace {

WallState state = WALL_IDLE;
uint16_t peak[TARGET_COUNT];
uint32_t windowStartedAt = 0;
uint32_t debounceStartedAt = 0;
uint32_t calibrationPrintedAt = 0;

/** Alvos 1..8 passam pelo multiplexador; o nono tem pino próprio. */
uint16_t readTarget(uint8_t index) {
  if (index >= TARGET_COUNT - 1) {
    return analogRead(PIN_TARGET_9);
  }

  digitalWrite(PIN_MUX_S0, index & 0x01 ? HIGH : LOW);
  digitalWrite(PIN_MUX_S1, index & 0x02 ? HIGH : LOW);
  digitalWrite(PIN_MUX_S2, index & 0x04 ? HIGH : LOW);
  delayMicroseconds(MUX_SETTLE_US);

  return analogRead(PIN_MUX_Z);
}

void resetPeaks() {
  for (uint8_t i = 0; i < TARGET_COUNT; i++) {
    peak[i] = 0;
  }
}

/** Guarda o maior valor visto em cada canal durante a janela. */
void trackPeaks() {
  for (uint8_t i = 0; i < TARGET_COUNT; i++) {
    const uint16_t raw = readTarget(i);

    if (raw > peak[i]) {
      peak[i] = raw;
    }
  }
}

bool anyAboveThreshold() {
  for (uint8_t i = 0; i < TARGET_COUNT; i++) {
    if (readTarget(i) >= TARGET_THRESHOLD[i]) {
      return true;
    }
  }

  return false;
}

/**
 * O alvo real é o de maior pico. É isso que resolve o falso positivo causado
 * pela vibração que vaza para as placas vizinhas: a vizinha também cruza o
 * limiar, mas com pico menor.
 */
uint8_t loudestTarget() {
  uint8_t winner = 0;

  for (uint8_t i = 1; i < TARGET_COUNT; i++) {
    if (peak[i] > peak[winner]) {
      winner = i;
    }
  }

  return winner;
}

}  // namespace

void sensorsBegin() {
  pinMode(PIN_MUX_S0, OUTPUT);
  pinMode(PIN_MUX_S1, OUTPUT);
  pinMode(PIN_MUX_S2, OUTPUT);

  // 12 bits e atenuação máxima: 0..4095 sobre a faixa inteira de 0..3,3 V,
  // exatamente a escala que o contrato Impacto declara.
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_MUX_Z, ADC_11db);
  analogSetPinAttenuation(PIN_TARGET_9, ADC_11db);

  resetPeaks();
  state = WALL_IDLE;
}

bool sensorsPoll(WallImpact& impact) {
  const uint32_t now = millis();

  switch (state) {
    case WALL_IDLE:
      if (anyAboveThreshold()) {
        resetPeaks();
        windowStartedAt = now;
        state = WALL_ARMED;
      }
      return false;

    case WALL_ARMED:
      // A janela de pico abriu; a partir daqui todos os canais são medidos.
      trackPeaks();
      state = WALL_MEASURING_PEAK;
      return false;

    case WALL_MEASURING_PEAK:
      trackPeaks();

      if (now - windowStartedAt >= PEAK_WINDOW_MS) {
        state = WALL_EVENT_EMITTED;
      }
      return false;

    case WALL_EVENT_EMITTED: {
      const uint8_t index = loudestTarget();

      impact.target = index + 1;
      impact.row = index / 3 + 1;
      impact.column = index % 3 + 1;
      impact.intensity = peak[index];
      impact.atMs = now;

      debounceStartedAt = now;
      state = WALL_DEBOUNCE;
      return true;
    }

    case WALL_DEBOUNCE:
      if (now - debounceStartedAt >= DEBOUNCE_MS) {
        state = WALL_IDLE;
      }
      return false;
  }

  return false;
}

void sensorsCalibrationTick() {
  const uint32_t now = millis();

  for (uint8_t i = 0; i < TARGET_COUNT; i++) {
    const uint16_t raw = readTarget(i);

    if (raw > peak[i]) {
      peak[i] = raw;
    }
  }

  if (now - calibrationPrintedAt < CALIBRATION_INTERVAL_MS) {
    return;
  }

  calibrationPrintedAt = now;
  Serial.print("picos:");

  for (uint8_t i = 0; i < TARGET_COUNT; i++) {
    Serial.print(' ');
    Serial.print(i + 1);
    Serial.print('=');
    Serial.print(peak[i]);
  }

  Serial.println();
  resetPeaks();
}
