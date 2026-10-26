#pragma once

// Copie este arquivo para secrets.h (no mesmo diretório) e troque TODOS os
// valores. secrets.h não vai para o Git, e o firmware não compila sem ele.
//
//     cp secrets_example.h secrets.h
//
// Uma senha forte por parede, gerada na hora, por exemplo:
//
//     openssl rand -base64 18

// Senha do Wi-Fi que a parede cria no modo SoftAP. Mínimo de 8 caracteres;
// use 16 ou mais. Troque antes de cada apresentação.
static const char* SOFTAP_PASSWORD = "troque-esta-senha-do-wifi";

// Segredo de pareamento: só o app que conecta com ws://<parede>:81/?token=<este
// valor> recebe impactos e manda comandos. O mesmo valor vai em
// EXPO_PUBLIC_DEVICE_TOKEN no app (frontend/.env).
static const char* WALL_PAIRING_TOKEN = "troque-este-segredo-de-pareamento";

// Só usados quando WALL_MODE_SOFTAP é 0 (modo Station).
static const char* WIFI_SSID = "sua-rede";
static const char* WIFI_PASSWORD = "sua-senha";
