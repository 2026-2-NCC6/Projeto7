#include "wall_actuator.h"

#include <Arduino.h>

#include "config.h"

namespace {

const BlinkStep* steps = nullptr;
uint8_t stepCount = 0;
uint8_t stepIndex = 0;
uint32_t stepStartedAt = 0;

template <size_t N>
void load(const BlinkStep (&pattern)[N]) {
  steps = pattern;
  stepCount = N;
}

void startStep(uint32_t now) {
  stepStartedAt = now;
  digitalWrite(PIN_LED, steps[stepIndex].on ? HIGH : LOW);
}

void stop() {
  steps = nullptr;
  digitalWrite(PIN_LED, LOW);
}

}  // namespace

void actuatorBegin() {
  pinMode(PIN_LED, OUTPUT);
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
