# Firmware da parede — ESP32

Nove alvos de MDF, um piezo colado atrás de cada um. Este firmware lê os piezos,
decide **qual** alvo foi atingido, mede a intensidade e publica o evento para o
app por WebSocket. Ele não sabe o que é um jogo: só existe impacto, alvo e
intensidade.

```
backend/firmware/
  smash_wall/
    smash_wall.ino        setup() e loop() — só orquestra
    config.h              ← o único arquivo que você edita
    secrets_example.h     modelo das credenciais Wi-Fi (copie para secrets.h)
    wall_sensors.h/.cpp   varredura do ADC, janela de pico, máquina de estados
    wall_link.h/.cpp      Wi-Fi, mDNS, servidor WebSocket, reconexão
    wall_protocol.h/.cpp  monta as mensagens e interpreta os comandos
```

---

## 1. O caminho completo de uma batida

```
bola bate no alvo
  └─ piezo gera tensão
      └─ wall_sensors.cpp   cruza o limiar, mede o pico dos 9 canais por 20 ms,
      │                     escolhe o maior (argmax) e aplica o debounce
      └─ wall_protocol.cpp  monta {"alvo":5,"linha":2,"coluna":2,...}
      └─ wall_link.cpp      envia por WebSocket (e imprime no Serial)
          └─ app: device/adapters/websocket/websocket-device.ts   recebe o texto
          └─ app: device/parsing/impacto.schema.ts                valida com zod
          └─ app: device/runtime/event-pipeline.ts                descarta alvo
          │                                                       desconhecido,
          │                                                       evento repetido
          │                                                       e t_ms fora de ordem
          └─ app: gameplay/domain/game-session.ts                 aplica as regras
              └─ tela: pontuação, barra de tempo, vibração
              └─ fim da sessão: POST /me/sessions -> XP e ofensiva
```

O app **nunca** vê tensão, canal analógico ou limiar. Ele recebe eventos prontos.
Se algo assim aparecer no app, a fronteira foi violada.

---

## 2. Hardware

### Lista de material

| Item | Quantidade | Observação |
| --- | --- | --- |
| ESP32 (DevKit 38 pinos) | 1 | |
| Piezo de 27 mm | 9 | um por alvo |
| Multiplexador 74HC4051 | 1 | atende os alvos 1..8 |
| Resistor 1 MΩ | 9 | um por piezo, para GND |
| Diodo 1N4148 | 18 | dois por piezo |
| Placa de MDF | 9 | os alvos |

### Circuito de proteção — obrigatório, um por alvo

**Um piezo pode gerar dezenas de volts** ao ser golpeado. Ligado direto no pino,
ele mata a entrada do ESP32.

```
piezo (+) ──┬── 1 MΩ ── GND          descarrega a carga do piezo
            ├── 1N4148 ── 3,3 V      corta o que passar de 3,3 V
            ├── 1N4148 ── GND        corta o que descer abaixo de 0 V (cátodo no piezo)
            └── entrada do mux / GPIO 35
piezo (−) ──── GND
```

### Pinos

| Sinal | GPIO | Papel |
| --- | --- | --- |
| `S0` `S1` `S2` | 25, 26, 27 | seleção do canal do multiplexador |
| `MUX_Z` | 34 | saída do mux → alvos 1..8 |
| `ALVO_9` | 35 | nono alvo, ligado direto |

### Três coisas que queimam tempo (ou a placa)

- **ADC2 morre com o Wi-Fi ligado.** Use só ADC1: GPIO 32 a 39. Ler um pino do
  ADC2 com Wi-Fi ativo devolve lixo silenciosamente, sem nenhum erro.
- **GPIO 34 a 39 são só de entrada.** Não têm pull-up interno nem função de
  saída. Perfeitos para os piezos, inúteis para qualquer outra coisa.
- **Não alimente pelo pino 5V e pelo USB ao mesmo tempo.** As duas fontes brigam
  e podem levar o regulador junto.

E o maior risco do projeto não é software: **é isolamento mecânico**. Se a
vibração vazar demais entre placas vizinhas, nenhum algoritmo compensa. Valide
dois alvos lado a lado antes de montar os nove.

---

## 3. Instalar no Arduino IDE

1. **Suporte ao ESP32.** Em _Arquivo → Preferências → URLs adicionais para
   gerenciadores de placas_, adicione:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   Depois, em _Ferramentas → Placa → Gerenciador de placas_, instale **esp32**
   (Espressif Systems).
2. **Placa.** _Ferramentas → Placa → ESP32 Arduino → **ESP32 Dev Module**_.
3. **Bibliotecas.** _Ferramentas → Gerenciar bibliotecas_ e instale:

   | Biblioteca | Autor | Para quê |
   | --- | --- | --- |
   | **WebSockets** | Markus Sattler | servidor WebSocket no ESP32 |
   | **ArduinoJson** (v7) | Benoît Blanchon | montar e ler o JSON com segurança |

   `WiFi.h` e `ESPmDNS.h` já vêm com o core do ESP32.
4. **Abra** `smash_wall/smash_wall.ino`. O Arduino IDE exige que a pasta tenha o
   mesmo nome do `.ino`; os outros arquivos da pasta são compilados junto,
   automaticamente.

---

## 4. Configurar

Tudo o que você precisa mexer está em **`config.h`**.

| Valor | Padrão | O que é |
| --- | --- | --- |
| `WALL_MODE_SOFTAP` | `1` | `1` = a parede cria a própria rede. `0` = ela entra na sua rede |
| `WALL_ID` | `"wall-1"` | identifica esta parede |
| `WALL_HOSTNAME` | `"smash"` | nome no mDNS → `smash.local` |
| `WALL_WS_PORT` | `81` | porta do WebSocket |
| `SOFTAP_SSID` / `SOFTAP_PASSWORD` | `smash-wall` / `smash1234` | rede criada no modo SoftAP (senha ≥ 8 caracteres) |
| `WIFI_SSID` / `WIFI_PASSWORD` | — | **em `secrets.h`**, só no modo Station |
| `PIN_MUX_S0/S1/S2` | 25, 26, 27 | seleção do multiplexador |
| `PIN_MUX_Z` | 34 | entrada dos alvos 1..8 |
| `PIN_TARGET_9` | 35 | entrada do alvo 9 |
| `TARGET_COUNT` | 9 | número de alvos |
| `TARGET_THRESHOLD[9]` | 450 cada | **limiar por alvo — calibre (seção 5)** |
| `PEAK_WINDOW_MS` | 20 | janela em que o pico de todos os alvos é medido |
| `DEBOUNCE_MS` | 200 | silêncio depois de um impacto |
| `MUX_SETTLE_US` | 8 | espera para a saída do mux estabilizar |
| `STATUS_INTERVAL_MS` | 2000 | intervalo do batimento enviado ao app |
| `WIFI_RETRY_MS` | 3000 | intervalo entre tentativas de reconexão |
| `SERIAL_BAUD` | 115200 | velocidade do monitor serial |
| `SERIAL_ECHO` | `1` | imprime cada impacto no Serial |
| `CALIBRATION_MODE` | `0` | `1` = só imprime picos, não joga |

No modo Station, antes de compilar:

```bash
cd smash_wall
cp secrets_example.h secrets.h   # secrets.h não vai para o Git
```

**Nunca comite credenciais.** `secrets.h` está no `.gitignore`.

---

## 5. Calibrar os limiares

`TARGET_THRESHOLD` é um vetor de nove posições porque **cada alvo responde
diferente** — a espessura da cola do piezo varia. Um valor global não funciona.

1. Em `config.h`, coloque `#define CALIBRATION_MODE 1`.
2. Envie para a placa e abra o _Monitor Serial_ em **115200**.
3. Bata em cada alvo com a força de um treino normal. A cada 250 ms sai:

   ```
   picos: 1=812 2=95 3=41 4=120 5=38 6=22 7=31 8=17 9=25
   ```

   Aqui o alvo 1 foi golpeado (812) e os vizinhos só sentiram a vibração.
4. Para cada alvo, anote o pico do golpe e use **cerca de 60 %** dele como
   limiar. No exemplo, alvo 1 → `~490`.
5. Volte `CALIBRATION_MODE` para `0` e envie de novo.

Limiar muito **alto**: batidas não são detectadas. Muito **baixo**: aparecem
impactos fantasma. O ponto certo fica acima do ruído dos vizinhos e abaixo do
golpe mais fraco que você quer contar.

---

## 6. Enviar e testar

### Sem rede nenhuma (o plano B da apresentação)

Envie o sketch, abra o Monitor Serial em 115200 e bata na parede. Cada impacto
sai como uma linha JSON:

```
[smash] parede iniciando
[wifi] SoftAP smash-wall em ws://192.168.4.1:81
[ws] servidor na porta 81
{"alvo":5,"linha":2,"coluna":2,"intensidade":1873,"t_ms":41230,"sessao":"wall-1-04821"}
```

Um cabo USB e um terminal já provam que a detecção funciona.

### Com o app

**Modo SoftAP** (padrão, e o recomendado para demonstrar):

1. Ligue a parede.
2. No celular, conecte no Wi-Fi **`smash-wall`** (senha `smash1234`).
3. Rode o app apontando para a parede:

   ```bash
   cd src/Entrega1
   EXPO_PUBLIC_DEVICE_SOURCE=websocket EXPO_PUBLIC_DEVICE_URL=ws://192.168.4.1:81 npm run app
   ```

**Modo Station** (quando o backend também precisa dos dados): ponha
`WALL_MODE_SOFTAP 0`, preencha `secrets.h`, e use o IP que a parede imprime no
Serial — ou `ws://smash.local:81`, se o mDNS funcionar no seu aparelho.

Sem essas variáveis o app continua no **simulador**, que é o padrão. Elas estão
documentadas em `frontend/.env.example`.

---

## 7. O protocolo

WebSocket sobre Wi-Fi, **a parede é o servidor**, porta 81, uma mensagem JSON por
quadro de texto.

**Por que WebSocket:** o React Native tem `WebSocket` como global, então custa
zero módulo nativo e o projeto continua rodando no Expo Go no Android e no iOS.
Bluetooth SPP não funciona no iOS e o BLE exigiria módulo nativo e _dev build_.
O código específico do transporte vive só no adaptador: o motor do jogo continua
recebendo eventos normalizados e não sabe quem os produziu.

### Da parede para o app

**Impacto** — é o contrato `Impacto`, e **não leva `tipo`**. É assim que o app
reconhece um impacto.

```json
{"alvo":5,"linha":2,"coluna":2,"intensidade":1873,"t_ms":41230,"sessao":"wall-1-04821"}
```

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `alvo` | inteiro | sim | 1..9 |
| `linha` | inteiro | sim | 1..3 |
| `coluna` | inteiro | sim | 1..3 |
| `intensidade` | inteiro | sim | 0..4095, pico do ADC |
| `t_ms` | inteiro | sim | `millis()` desde o boot, sempre crescente |
| `sessao` | texto | sim | não vazio |

`intensidade` é uma medida **relativa**, não newtons, e só é comparável entre
batidas **no mesmo alvo** — cada piezo tem sua própria resposta. Não some
intensidade de alvos diferentes sem normalizar.

`t_ms` é tempo desde o boot, não relógio de parede. O app converte para hora real
somando `t_ms` ao instante em que a sessão começou, e é por isso que o firmware
não precisa de relógio sincronizado.

**Quadros de controle** — sempre com `tipo`:

| Quadro | Quando | Conteúdo |
| --- | --- | --- |
| `hello` | ao conectar | `protocolo`, `parede`, `alvos`, `sessao`, `t_ms` |
| `status` | a cada 2 s | `sessao`, `clientes`, `rssi`, `t_ms` |
| `erro` | comando recusado | `detalhe`, `t_ms` |

### Do app para a parede

| Comando | Para quê |
| --- | --- |
| `{"cmd":"session","sessao":"app-1789015370"}` | o app manda o id da sessão de treino ao conectar; a parede passa a repetir esse valor em `sessao` |
| `{"cmd":"ping"}` | respondido com um `status` na hora |

### Confirmação de recebimento: não existe

De propósito. Num jogo de reação, um evento **atrasado é pior que um perdido**.
O envio é _fire-and-forget_, no máximo uma entrega. Duplicata e reordenação são
tratadas do lado do app, que já descarta evento repetido (mesma combinação de
`sessao`, `t_ms` e `alvo`) e `t_ms` fora de ordem.

### Estado da conexão

`conectando` → `conectado` → `perdido` (socket caiu, deu erro, ou o batimento
atrasou mais de 7 s) → `desconectado` (só quando o app pede). O batimento de 2 s
é o que permite detectar um link mudo, em que o socket não chegou a fechar.

### Mensagem inválida

Nenhum dos dois lados quebra. O app transforma o problema em um evento de falha
(`malformedMessage`, `unknownTarget`, `duplicateEvent`, `staleEvent`,
`transport`); a parede responde `{"tipo":"erro","detalhe":"..."}`.

### Reconexão

- **App:** tenta de novo com espera crescente (0,5 s → 8 s) e, a cada conexão
  aberta, **zera o controle de duplicatas** — o `millis()` da parede reinicia do
  zero quando ela reinicia, e sem isso todo evento novo pareceria atrasado.
- **Parede:** no modo Station, tenta reconectar a cada 3 s sem travar a leitura
  dos sensores; o servidor continua de pé e clientes mortos são descartados.

### Como crescer sem quebrar

O app **ignora campos desconhecidos**. Então um sensor novo entra como **campo
opcional** numa mensagem de impacto e nenhum app já publicado quebra:

```json
{"alvo":5, ..., "temperatura":24.5}
```

A regra é: **acrescentar campo opcional pode; renomear ou remover campo, não.**
Qualquer mudança que quebre um app publicado aumenta `hello.protocolo`.

### MQTT

Requisito da disciplina e o caminho para o backend. O mesmo JSON será publicado
em `smash/{wall_id}/impacto` num broker Mosquitto, com o backend assinando e
persistindo. **Ainda não está implementado** — não existe broker nem assinante —
e WebSocket e MQTT não são alternativas: são destinos diferentes do mesmo evento.

---

## 8. A máquina de estados

Modelagem que é entregável da disciplina (`/docs/TC e MF`). O código em
`wall_sensors.cpp` segue o diagrama, com os mesmos nomes:

```
IDLE ──(algum canal cruza o limiar)──> ARMED
ARMED ──(abre a janela de pico)──────> MEASURING_PEAK
MEASURING_PEAK ──(20 ms)─────────────> EVENT_EMITTED
EVENT_EMITTED ──(evento publicado)───> DEBOUNCE
DEBOUNCE ──(200 ms)──────────────────> IDLE
```

As transições dependem só de duas coisas: cruzar o limiar e o tempo passar.

**Por que a janela de pico existe.** Quando a bola bate no alvo 5, a vibração
vaza para o 4 e o 6, que também cruzam o limiar. Durante 20 ms o firmware mede o
pico dos **nove** canais e escolhe o maior (`argmax`): o alvo golpeado tem o
maior pico, os vizinhos só o eco. É isso que resolve o falso positivo.

Complexidade `O(n)` por varredura, com `n = 9`. Uma varredura completa leva menos
de 1 ms, com folga confortável para não perder nenhum impacto — e nada no `loop()`
bloqueia: não existe `delay()`, todas as transições comparam `millis()`, e o
servidor WebSocket é atendido a cada volta.

---

## 9. Quando der errado

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Nenhuma batida é detectada | limiar alto demais, ou piezo/mux mal ligado | `CALIBRATION_MODE 1` e confira se o pico sobe ao bater |
| Impactos fantasma, sem ninguém bater | limiar baixo demais, ou falta o diodo de proteção | suba o limiar; confira o grampeamento em 3,3 V |
| **Toda batida é atribuída ao mesmo alvo** | vibração vazando entre as placas | isolamento mecânico: separe as placas, use borracha nos apoios. Nenhum ajuste de software resolve |
| Uma batida vira dois eventos | `DEBOUNCE_MS` curto para a sua montagem | aumente para 250–300 ms |
| Leituras aleatórias, mesmo sem bater | pino do ADC2 com Wi-Fi ligado | use só GPIO 32..39 (ADC1) |
| A placa reinicia ao ligar o Wi-Fi | fonte fraca (brownout) | alimente por uma USB de 1 A ou mais; não use 5V e USB juntos |
| O app não acha a parede | celular na rede errada | no SoftAP, o celular tem que estar no Wi-Fi `smash-wall` |
| `smash.local` não resolve | o Android resolve mDNS mal | use o IP direto: `EXPO_PUBLIC_DEVICE_URL=ws://192.168.4.1:81` |
| O app conecta e cai sozinho | batimento não chega | confira se o `loop()` roda; qualquer `delay()` longo derruba o link |
| Enxurrada de eventos descartados como atrasados | a parede reiniciou no meio da sessão | é esperado: o app zera o controle a cada reconexão. Se persistir, veja brownout |
| O app mostra "—" no impacto | você está no simulador | leitura simulada nunca vira número na tela; use `EXPO_PUBLIC_DEVICE_SOURCE=websocket` |
