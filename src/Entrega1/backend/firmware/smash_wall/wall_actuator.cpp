#include "wall_actuator.h"

#include <Arduino.h>

#include "config.h"

namespace {

const ToneStep* steps = nullptr;
uint8_t stepCount = 0;
uint8_t stepIndex = 0;
uint32_t stepStartedAt = 0;

template <size_t N>
void load(const ToneStep (&pattern)[N]) {
  steps = pattern;
  stepCount = N;
}

void sound(uint16_t hz) {
#if BUZZER_PASSIVO
  ledcWriteTone(PIN_BUZZER, hz);
#else
  digitalWrite(PIN_BUZZER, hz > 0 ? HIGH : LOW);
#endif
}

void light(uint8_t led) {
  digitalWrite(PIN_LED_GREEN, led == LED_GREEN ? HIGH : LOW);
  digitalWrite(PIN_LED_RED, led == LED_RED ? HIGH : LOW);
}

void startStep(uint32_t now) {
  stepStartedAt = now;
  sound(steps[stepIndex].hz);
  light(steps[stepIndex].led);
}

void stop() {
  steps = nullptr;
  sound(0);
  light(LED_NONE);
}

}  // namespace

void actuatorBegin() {
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);

#if BUZZER_PASSIVO
  ledcAttach(PIN_BUZZER, 2000, 8);
#else
  pinMode(PIN_BUZZER, OUTPUT);
#endif

  stop();
}

void actuatorPlay(WallCue cue) {
  switch (cue) {
    case CUE_IMPACT: load(CUE_IMPACT_STEPS); break;
    case CUE_HIT: load(CUE_HIT_STEPS); break;
    case CUE_MISS: load(CUE_MISS_STEPS); break;
    case CUE_LEVEL_CLEARED: load(CUE_LEVEL_CLEARED_STEPS); break;
    case CUE_LEVEL_FAILED: load(CUE_LEVEL_FAILED_STEPS); break;
    case CUE_NONE: return;
  }

  stepIndex = 0;
  startStep(millis());
}

void actuatorLoop() {
  if (steps == nullptr) {
    return;
  }

  const uint32_t now = millis();

  if (now - stepStartedAt < steps[stepIndex].ms) {
    return;
  }

  stepIndex++;

  if (stepIndex >= stepCount) {
    stop();
    return;
  }

  startStep(now);
}
