#pragma once

// ===========================================================================
//  Smash — parede instrumentada de treino de tênis
//  Este é o ÚNICO arquivo que você precisa editar.
// ===========================================================================

#include <stddef.h>
#include <stdint.h>

// ---------------------------------------------------------------------------
//  Rede
// ---------------------------------------------------------------------------

// 1 = a parede cria a própria rede Wi-Fi (SoftAP). O celular se conecta nela e
//     a parede sempre responde em ws://192.168.4.1:81. É o modo da apresentação:
//     não depende do Wi-Fi do local.
// 0 = a parede entra na rede local (Station). Necessário quando o backend também
//     precisa receber os dados.
//
// Senhas e o segredo de pareamento ficam em secrets.h, nunca aqui: este arquivo
// vai para o Git.
#define WALL_MODE_SOFTAP 1

static const char* WALL_ID = "wall-1";

// Nome usado no mDNS: com WALL_HOSTNAME "smash", a parede responde em smash.local.
static const char* WALL_HOSTNAME = "smash";

static const uint16_t WALL_WS_PORT = 81;

// Só usado quando WALL_MODE_SOFTAP é 1. A senha está em secrets.h.
static const char* SOFTAP_SSID = "smash-wall";

// ---------------------------------------------------------------------------
//  Limites da conexão
// ---------------------------------------------------------------------------
//  A parede atende um app por vez: o primeiro que conecta com o segredo de
//  pareamento certo fica com ela até sair; os outros são desconectados na hora.

// Maior comando aceito, em bytes. O maior comando real tem uns 60.
static const size_t MAX_COMMAND_BYTES = 256;

// Comandos por segundo do app. Um jogo manda no máximo uns 5.
static const uint8_t MAX_COMMANDS_PER_SECOND = 20;

// Ping do WebSocket: um app que não responde 2 vezes seguidas é desconectado.
static const uint32_t PING_INTERVAL_MS = 5000;
static const uint32_t PONG_TIMEOUT_MS = 3000;
static const uint8_t PONG_MISSES_TO_DROP = 2;

// ---------------------------------------------------------------------------
//  Pinos
// ---------------------------------------------------------------------------
//  Só ADC1 (GPIO 32..39): com o Wi-Fi ligado o ADC2 devolve lixo sem avisar.
//  GPIO 34..39 são apenas de entrada — perfeitos para os piezos.
//
//  Cada alvo tem o seu pino, sem multiplexador. Parede vista de frente:
//
//      A1 · IO32    A2 · IO33    A3 · IO34
//      A4 · IO36    A5 · IO39    A6 · IO35
//
//  IO36 e IO39 aparecem na placa como VP e VN (ou SVP e SVN).

// ---------------------------------------------------------------------------
//  Alvos
// ---------------------------------------------------------------------------

static const uint8_t TARGET_COUNT = 6;

// Alvos por linha da parede. A1..A3 são a linha de cima, A4..A6 a de baixo.
static const uint8_t TARGET_COLUMNS = 3;

// Pino de cada alvo, na ordem A1..A6.
static const uint8_t TARGET_PIN[TARGET_COUNT] = {
    32,  // A1 · cima, esquerda
    33,  // A2 · cima, centro
    34,  // A3 · cima, direita
    36,  // A4 · baixo, esquerda   (VP)
    39,  // A5 · baixo, centro     (VN)
    35,  // A6 · baixo, direita
};

// Limiar de cada alvo, em contagens do ADC (0..4095). NÃO use um valor único:
// a espessura da cola muda a resposta de cada piezo. Ligue CALIBRATION_MODE
// abaixo, bata em cada alvo e use ~60% do pico observado.
static const uint16_t TARGET_THRESHOLD[TARGET_COUNT] = {
    150,  // A1
    150,  // A2
    150,  // A3
    150,  // A4
    150,  // A5
    150,  // A6
};

// ---------------------------------------------------------------------------
//  Atuador: o LED azul da própria placa
// ---------------------------------------------------------------------------
//  Nas placas ESP32 com LED azul além do vermelho de energia, ele fica no
//  GPIO 2. Sem esse LED na placa, um LED com resistor de 220 Ω entre o GPIO 2 e
//  o GND faz o mesmo papel.

static const uint8_t PIN_LED = 2;

// Cada sinal é uma lista de passos: LED aceso ou apagado, por quantos ms.
struct BlinkStep {
  bool on;
  uint16_t ms;
};

// Batida detectada sem app conectado: o firmware responde sozinho.
static const BlinkStep CUE_IMPACT_STEPS[] = {{true, 80}};

// Os quatro abaixo vêm do app, pelo comando `feedback`.
static const BlinkStep CUE_HIT_STEPS[] = {{true, 250}};
static const BlinkStep CUE_MISS_STEPS[] = {
    {true, 60}, {false, 60}, {true, 60}, {false, 60}, {true, 60},
};
static const BlinkStep CUE_LEVEL_CLEARED_STEPS[] = {
    {true, 250}, {false, 120}, {true, 250}, {false, 120}, {true, 600},
};
static const BlinkStep CUE_LEVEL_FAILED_STEPS[] = {
    {true, 80}, {false, 80}, {true, 80}, {false, 80},
    {true, 80}, {false, 80}, {true, 80}, {false, 80},
};

// ---------------------------------------------------------------------------
//  Tempos (ms, exceto onde indicado)
// ---------------------------------------------------------------------------

// Janela em que o pico de TODOS os alvos é medido antes de decidir quem foi.
static const uint32_t PEAK_WINDOW_MS = 20;

// Silêncio depois de um impacto, para o mesmo golpe não virar dois eventos.
static const uint32_t DEBOUNCE_MS = 200;

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
