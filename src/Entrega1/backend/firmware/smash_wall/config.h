#pragma once

// ===========================================================================
//  Smash — parede instrumentada de treino de tênis
//  Este é o ÚNICO arquivo que você precisa editar.
// ===========================================================================

#include <stdint.h>

// ---------------------------------------------------------------------------
//  Rede
// ---------------------------------------------------------------------------

// 1 = a parede cria a própria rede Wi-Fi (SoftAP). O celular se conecta nela e
//     a parede sempre responde em ws://192.168.4.1:81. É o modo da apresentação:
//     não depende do Wi-Fi do local.
// 0 = a parede entra na rede local (Station). Necessário quando o backend também
//     precisa receber os dados. As credenciais vêm de secrets.h.
#define WALL_MODE_SOFTAP 1

static const char* WALL_ID = "wall-1";

// Nome usado no mDNS: com WALL_HOSTNAME "smash", a parede responde em smash.local.
static const char* WALL_HOSTNAME = "smash";

static const uint16_t WALL_WS_PORT = 81;

// Só usados quando WALL_MODE_SOFTAP é 1. A senha precisa de 8 caracteres ou mais.
static const char* SOFTAP_SSID = "smash-wall";
static const char* SOFTAP_PASSWORD = "smash1234";

// ---------------------------------------------------------------------------
//  Pinos
// ---------------------------------------------------------------------------
//  Só ADC1 (GPIO 32..39): com o Wi-Fi ligado o ADC2 devolve lixo sem avisar.
//  GPIO 34..39 são apenas de entrada — perfeitos para os piezos.

static const uint8_t PIN_MUX_S0 = 25;  // seleção do multiplexador 74HC4051
static const uint8_t PIN_MUX_S1 = 26;
static const uint8_t PIN_MUX_S2 = 27;
static const uint8_t PIN_MUX_Z = 34;   // saída do mux -> alvos 1..8
static const uint8_t PIN_TARGET_9 = 35;  // nono alvo, ligado direto

// ---------------------------------------------------------------------------
//  Alvos
// ---------------------------------------------------------------------------

static const uint8_t TARGET_COUNT = 9;

// Limiar de cada alvo, em contagens do ADC (0..4095). NÃO use um valor único:
// a espessura da cola muda a resposta de cada piezo. Ligue CALIBRATION_MODE
// abaixo, bata em cada alvo e use ~60% do pico observado.
static const uint16_t TARGET_THRESHOLD[TARGET_COUNT] = {
    450,  // alvo 1
    450,  // alvo 2
    450,  // alvo 3
    450,  // alvo 4
    450,  // alvo 5
    450,  // alvo 6
    450,  // alvo 7
    450,  // alvo 8
    450,  // alvo 9
};

// ---------------------------------------------------------------------------
//  Tempos (ms, exceto onde indicado)
// ---------------------------------------------------------------------------

// Janela em que o pico de TODOS os alvos é medido antes de decidir quem foi.
static const uint32_t PEAK_WINDOW_MS = 20;

// Silêncio depois de um impacto, para o mesmo golpe não virar dois eventos.
static const uint32_t DEBOUNCE_MS = 200;

// Tempo para a saída do mux estabilizar depois de trocar de canal.
static const uint16_t MUX_SETTLE_US = 8;

// Batimento enviado ao app; é assim que ele sabe que a parede continua viva.
static const uint32_t STATUS_INTERVAL_MS = 2000;

// Intervalo entre tentativas de reconexão no modo Station.
static const uint32_t WIFI_RETRY_MS = 3000;

// ---------------------------------------------------------------------------
//  Serial
// ---------------------------------------------------------------------------

static const uint32_t SERIAL_BAUD = 115200;

// 1 = imprime cada impacto no Serial. É a prova de que a detecção funciona sem
//     nenhuma rede envolvida — o plano B da apresentação.
#define SERIAL_ECHO 1

// 1 = não joga: só imprime o pico de cada alvo, para você preencher
//     TARGET_THRESHOLD acima. Volte para 0 depois de calibrar.
#define CALIBRATION_MODE 0

static const uint32_t CALIBRATION_INTERVAL_MS = 250;
