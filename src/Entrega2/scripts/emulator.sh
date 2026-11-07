#!/usr/bin/env bash
set -euo pipefail

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
EMULATOR="$SDK/emulator/emulator"
ADB="$SDK/platform-tools/adb"

if [ ! -x "$EMULATOR" ]; then
  echo "Emulador não encontrado em $EMULATOR"
  echo "Instale o Android Studio ou defina ANDROID_HOME."
  exit 1
fi

if "$ADB" devices | grep -q "^emulator-.*device$"; then
  echo "Emulador já está rodando."
  exit 0
fi

AVD="${AVD_NAME:-$("$EMULATOR" -list-avds | head -1)}"

if [ -z "$AVD" ]; then
  echo "Nenhum AVD encontrado. Crie um no Android Studio (Device Manager)."
  exit 1
fi

echo "Iniciando o emulador $AVD..."
nohup "$EMULATOR" -avd "$AVD" -no-boot-anim >/dev/null 2>&1 &

echo "Aguardando o Android terminar de iniciar..."
until [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
  sleep 3
done

echo "Emulador pronto."
