# Firmware da parede — ESP32

Seis alvos de MDF numa grade 3×2, um piezo colado atrás de cada um e cada piezo
no seu próprio pino do ESP32. Este firmware lê os piezos,
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
    wall_actuator.h/.cpp  LED da placa: pisca os sinais sem bloquear o loop()
    wall_link.h/.cpp      Wi-Fi, mDNS, servidor WebSocket, reconexão
    wall_protocol.h/.cpp  monta as mensagens e interpreta os comandos
```

---

## 1. O caminho completo de uma batida

```
bola bate no alvo
  └─ piezo gera tensão
      └─ wall_sensors.cpp   cruza o limiar, mede o pico dos 6 canais por 20 ms,
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
              └─ app → parede: {"cmd":"feedback","resultado":"acerto"}
                  └─ wall_actuator.cpp  LED da placa acende (ou pisca 3× rápido no erro)
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
| Piezo de 27 mm | 6 | um por alvo |
| Resistor 1 MΩ | 6 | um por piezo, para GND |
| Diodo 1N4148 | 12 | dois por piezo |
| Placa de MDF | 6 | os alvos |
| Cabo de rede (par trançado) | 2 trechos | cabo 1 leva A1..A4, cabo 2 leva o A5; o A6 tem o seu |

Não há multiplexador. Cada alvo funcionava sozinho e o problema só aparecia
quando o mux trocava de canal, então cada piezo foi para um pino próprio — e o
ESP32 tem exatamente seis entradas ADC1 que funcionam com o Wi-Fi ligado. É por
isso que a parede é 3×2, e não 3×3.

### Circuito de proteção — obrigatório, um por alvo

**Um piezo pode gerar dezenas de volts** ao ser golpeado. Ligado direto no pino,
ele mata a entrada do ESP32.

```
piezo (+) ──┬── 1 MΩ ── GND          descarrega a carga do piezo
            ├── 1N4148 ── 3,3 V      corta o que passar de 3,3 V
            ├── 1N4148 ── GND        corta o que descer abaixo de 0 V (cátodo no piezo)
            └── pino do alvo (tabela abaixo)
piezo (−) ──── GND
```

### Pinos

A parede vista de frente:

| | Esquerda | Centro | Direita |
| --- | --- | --- | --- |
| **Cima** (linha 1) | A1 · GPIO 32 | A2 · GPIO 33 | A3 · GPIO 34 |
| **Baixo** (linha 2) | A4 · GPIO 36 (VP) | A5 · GPIO 39 (VN) | A6 · GPIO 35 |

Na serigrafia da placa, o 36 e o 39 podem aparecer como `VP`/`VN` ou
`SVP`/`SVN`. O número do alvo é o `alvo` que vai no protocolo.

### Atuador — o LED da própria placa

O atuador é o **LED azul da placa do ESP32**, ligado no GPIO 2. Nenhuma peça
nova: o firmware acende e apaga esse LED para dar retorno ao jogador. Muitas
placas ESP32 têm esse LED ao lado do vermelho de energia, perto do USB.

Se a sua placa só tiver o LED vermelho (que fica sempre aceso e não é
controlável), um LED comum resolve: perna longa no GPIO 2, perna curta num
resistor de 220 Ω até o GND. O firmware não muda.

| Sinal | Quando | O LED |
| --- | --- | --- |
| impacto | batida detectada, sem app conectado | pisca curto (80 ms) |
| acerto | o app avisa que a batida foi certa | acende 250 ms |
| erro | o app avisa que a batida foi errada | pisca 3× rápido |
| nível concluído | fim do nível, venceu | pisca 3× longo |
| nível falhou | fim do nível, perdeu | pisca 4× rápido |

### Três coisas que queimam tempo (ou a placa)

- **ADC2 morre com o Wi-Fi ligado.** Use só ADC1: GPIO 32 a 39. Ler um pino do
  ADC2 com Wi-Fi ativo devolve lixo silenciosamente, sem nenhum erro.
- **GPIO 34 a 39 são só de entrada.** Não têm pull-up interno nem função de
  saída. Perfeitos para os piezos, inúteis para qualquer outra coisa.
- **Não alimente pelo pino 5V e pelo USB ao mesmo tempo.** As duas fontes brigam
  e podem levar o regulador junto.

E o maior risco do projeto não é software: **é isolamento mecânico**. Se a
vibração vazar demais entre placas vizinhas, nenhum algoritmo compensa. Valide
dois alvos lado a lado antes de montar os seis.

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
| `TARGET_COUNT` | 6 | número de alvos |
| `TARGET_COLUMNS` | 3 | alvos por linha da parede |
| `TARGET_PIN[6]` | 32, 33, 34, 36, 39, 35 | pino de cada alvo, na ordem A1..A6 |
| `TARGET_THRESHOLD[6]` | 150 cada | **limiar por alvo — calibre (seção 5)** |
| `PIN_LED` | 2 | o LED azul da placa, o atuador |
| `CUE_*_STEPS` | — | cada sinal: LED aceso ou apagado e por quantos ms, passo a passo |
| `PEAK_WINDOW_MS` | 20 | janela em que o pico de todos os alvos é medido |
| `DEBOUNCE_MS` | 200 | silêncio depois de um impacto |
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

`TARGET_THRESHOLD` é um vetor de seis posições porque **cada alvo responde
diferente** — a espessura da cola do piezo varia. Um valor global não funciona.

1. Em `config.h`, coloque `#define CALIBRATION_MODE 1`.
2. Envie para a placa e abra o _Monitor Serial_ em **115200**.
3. Bata em cada alvo com a força de um treino normal. A cada 250 ms sai:

   ```
   picos: 1=812 2=95 3=41 4=120 5=38 6=22
   ```

   Aqui o alvo 1 foi golpeado (812) e os vizinhos só sentiram a vibração. O
   repouso deve ficar bem abaixo de 100; o 150 de fábrica é só para começar.
4. Para cada alvo, anote o pico do golpe e use **cerca de 60 %** dele como
   limiar. No exemplo, alvo 1 → `~490`.
5. Volte `CALIBRATION_MODE` para `0` e envie de novo.

Limiar muito **alto**: batidas não são detectadas. Muito **baixo**: aparecem
impactos fantasma. O ponto certo fica acima do ruído dos vizinhos e abaixo do
golpe mais fraco que você quer contar.

---

## 6. Teste ponta a ponta

Duas trilhas. A primeira roda hoje, sem a parede; a segunda é o checklist do dia
em que a parede estiver na mesa. Em cada passo: o que fazer, o que tem que
aparecer e, se não aparecer, onde olhar.

### 6.1 Sem a parede: o emulador

`npm run wall` sobe um servidor WebSocket que fala **exatamente** o protocolo
desta pasta (`hello` v2 com 6 alvos, `status` a cada 2 s, `session`, `ping`,
`erro`). Ele prova o caminho pela rede, que o simulador do app nunca percorre.

1. **Backend e emulador da parede**, cada um num terminal, em `src/Entrega1`:

   ```bash
   npm run backend
   npm run wall
   ```

   O `wall` imprime as URLs: `ws://10.0.2.2:8181` para o emulador Android e
   `ws://<ip-do-notebook>:8181` para um celular na mesma rede.
2. **App apontando para o emulador da parede** (emulador Android):

   ```bash
   EXPO_PUBLIC_DEVICE_SOURCE=websocket EXPO_PUBLIC_DEVICE_URL=ws://10.0.2.2:8181 npm run app
   ```

   No terminal do `wall` tem que aparecer `[ws] cliente conectado (1)`.
   _Se não aparecer:_ o emulador Android pode estar sem rede (ícone do Wi-Fi com
   "!"). Use `adb reverse tcp:8181 tcp:8181` (e `8081`, `3000`) e troque os
   endereços por `127.0.0.1` — veja o CLAUDE.md.
3. **Jogue um nível do Color Mode** com as teclas do `wall`. As cores da parede:

   ```
   1 âmbar     2 azul      3 vermelho
   4 vermelho  5 âmbar     6 azul
   ```

   Cada tecla certa avança a sequência. No fim, a tela de resultado mostra um
   número em **Impacto médio** — só leitura da parede vira número; no simulador
   aparece `—`.
4. **Reinicie a parede** com `b` no meio de um nível. O app mostra a conexão
   perdida, reconecta sozinho (`[ws] cliente conectado` de novo) e as batidas
   seguintes continuam valendo, mesmo com o `t_ms` de volta perto de zero.
5. **Mensagem quebrada** com `m`: o app não cai, conta uma falha em
   Estatísticas → Hardware e sistema.

### 6.2 Com a parede: checklist

Antes de tudo, as bibliotecas da seção 3 instaladas e a parede montada como no
guia de montagem 3×2.

1. **Repouso.** `CALIBRATION_MODE 1`, envie, Monitor Serial em 115200, sem
   tocar em nada. Os seis valores de `picos:` ficam baixos (bem abaixo de 100).
   _Se um alvo ficar alto parado:_ a ligação dele está aberta (pino flutuando).
2. **Um alvo por vez.** Bata em cada um com força de jogo, 5 vezes. Só ele sobe
   bastante; os vizinhos ficam baixos. Anote o pico de cada um.
   _Se o vizinho sobe quase igual:_ vazamento mecânico — veja a seção 9.
3. **Limiares.** Em `TARGET_THRESHOLD`, cerca de 60 % do pico de cada alvo.
   Volte `CALIBRATION_MODE 0` e envie de novo.
4. **Detecção sem rede.** Ainda no Serial, bata em cada alvo: sai uma linha
   JSON com o `alvo` certo (`"alvo":6,"linha":2,"coluna":3` para o canto de
   baixo à direita). Bata 20 vezes em cada um e conte os acertos — esse número
   vai para o relatório de validação.
5. **Rede.** No celular, entre no Wi-Fi **`smash-wall`** (senha `smash1234`) e
   aceite ficar conectado "sem internet". Desligue os dados móveis, senão o
   Android manda o tráfego pelo 4G. **O notebook também entra no `smash-wall`**:
   é ele que roda o backend e o Metro. Anote o IP que o notebook recebeu
   (`192.168.4.x`).
6. **App na parede.**

   ```bash
   npm run backend
   ```

   E, num segundo terminal, em `src/Entrega1/frontend`:

   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.4.x:3000 EXPO_PUBLIC_DEVICE_SOURCE=websocket EXPO_PUBLIC_DEVICE_URL=ws://192.168.4.1:81 npx expo start --offline
   ```

   Abra no Expo Go pelo QR code. No Serial da parede aparece
   `[ws] cliente 0 conectado`. `--offline` porque o `smash-wall` não tem
   internet. _Se em Estatísticas → Hardware e sistema a "Última falha" for
   "Parede incompatível":_ a placa está com um firmware antigo (protocolo 1 ou
   9 alvos) — grave este de novo.
7. **Uma sessão de verdade.** Entre com uma conta, jogue um nível do Color Mode
   na parede e termine. O resultado mostra **Impacto médio**, e em Estatísticas o
   mapa da parede 3×2 marca os alvos que você acertou — sinal de que a sessão
   chegou no backend.

**Plano B da apresentação:** se a rede falhar, o passo 4 sozinho — um cabo USB e
o Monitor Serial — já prova que a detecção funciona.

**Modo Station** (a parede entra numa rede existente): ponha
`WALL_MODE_SOFTAP 0`, preencha `secrets.h` e use o IP que a parede imprime no
Serial — ou `ws://smash.local:81`, se o mDNS funcionar no seu aparelho. Redes de
faculdade costumam isolar os aparelhos entre si; por isso o SoftAP é o padrão.

Sem as variáveis `EXPO_PUBLIC_DEVICE_*` o app continua no **simulador**, que é o
padrão. Elas estão documentadas em `frontend/.env.example`.

---

### 6.3 Evidência em vídeo

Duas cenas curtas, cada uma provando uma exigência do enunciado:

1. **Sensor → atuador, sem rede** (Sistemas Embarcados, Entrega 2: ler um sensor
   e controlar um atuador). Só o USB ligado, nenhum app conectado. Bata em
   alvos diferentes: cada batida pisca o LED azul da placa, e a linha
   JSON aparece no Monitor Serial. Filme a parede e a tela do Serial juntas.
2. **Orientar e recompensar** (RF08). App conectado, um nível do Color Mode.
   Acerte uma cor e erre a seguinte: o acerto acende o LED, o erro faz ele
   piscar 3× rápido. Termine o nível e o LED pisca 3× longo.
   Filme o celular e a parede no mesmo quadro.

Sem a parede, o `npm run wall` mostra no terminal o que o atuador faria
(`[atuador] acerto · LED acende 250 ms`).

---

## 7. O protocolo

WebSocket sobre Wi-Fi, **a parede é o servidor**, porta 81, uma mensagem JSON por
quadro de texto. Versão atual: **2** (a parede 3×2).

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
| `alvo` | inteiro | sim | 1..6 |
| `linha` | inteiro | sim | 1..2 |
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

O app confere o `hello`: com `protocolo` diferente de 2 ou `alvos` diferente de
6, ele registra a falha `incompatibleWall` ("Parede incompatível") sem derrubar a
conexão.
| `status` | a cada 2 s | `sessao`, `clientes`, `rssi`, `t_ms` |
| `erro` | comando recusado | `detalhe`, `t_ms` |

### Do app para a parede

| Comando | Para quê |
| --- | --- |
| `{"cmd":"session","sessao":"app-1789015370"}` | o app manda o id da sessão de treino ao conectar; a parede passa a repetir esse valor em `sessao` |
| `{"cmd":"ping"}` | respondido com um `status` na hora |
| `{"cmd":"feedback","resultado":"acerto"}` | toca o retorno da jogada: `acerto`, `erro`, `nivel_concluido` ou `nivel_falhou` |

O `feedback` é acréscimo, por isso o protocolo continua na versão 2: um firmware
sem atuador só responde `erro` com `comando desconhecido`, e o app ignora. O app
nunca guarda um `feedback` para mandar depois — um sinal atrasado é pior que
nenhum.

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

**Não é exigido e não está no plano.** O enunciado do PI cita MQTT só como uma
das opções de comunicação (ao lado de HTTP/HTTPS, WebSocket, BLE e Wi-Fi), com
justificativa técnica; nenhuma entrega pede MQTT. A parede fala WebSocket com o
app, e o app manda cada sessão terminada ao backend por HTTP.

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

O atuador (`wall_actuator.cpp`) fica **fora** desta máquina: é um sequenciador
à parte, que só pisca o sinal que recebe. Detecção e retorno não se misturam, e o
diagrama de Teoria da Computação continua valendo.

**Por que a janela de pico existe.** Quando a bola bate no alvo 5, a vibração
vaza para o 4 e o 6, que também cruzam o limiar. Durante 20 ms o firmware mede o
pico dos **seis** canais e escolhe o maior (`argmax`): o alvo golpeado tem o
maior pico, os vizinhos só o eco. É isso que resolve o falso positivo.

Complexidade `O(n)` por varredura, com `n = 6`. Uma varredura completa leva menos
de 1 ms, com folga confortável para não perder nenhum impacto — e nada no `loop()`
bloqueia: não existe `delay()`, todas as transições comparam `millis()`, e o
servidor WebSocket é atendido a cada volta.

---

## 9. Quando der errado

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Nenhuma batida é detectada | limiar alto demais, ou piezo mal ligado | `CALIBRATION_MODE 1` e confira se o pico sobe ao bater |
| Impactos fantasma, sem ninguém bater | limiar baixo demais, ou falta o diodo de proteção | suba o limiar; confira o grampeamento em 3,3 V |
| **Toda batida é atribuída ao mesmo alvo** | vibração vazando entre as placas | isolamento mecânico: separe as placas, use borracha nos apoios. Nenhum ajuste de software resolve |
| Uma batida vira dois eventos | `DEBOUNCE_MS` curto para a sua montagem | aumente para 250–300 ms |
| Leituras aleatórias, mesmo sem bater | pino do ADC2 com Wi-Fi ligado | use só GPIO 32..39 (ADC1) |
| A placa reinicia ao ligar o Wi-Fi | fonte fraca (brownout) | alimente por uma USB de 1 A ou mais; não use 5V e USB juntos |
| O app não acha a parede | celular na rede errada | no SoftAP, o celular tem que estar no Wi-Fi `smash-wall` |
| `smash.local` não resolve | o Android resolve mDNS mal | use o IP direto: `EXPO_PUBLIC_DEVICE_URL=ws://192.168.4.1:81` |
| O app conecta e cai sozinho | batimento não chega | confira se o `loop()` roda; qualquer `delay()` longo derruba o link |
| Enxurrada de eventos descartados como atrasados | a parede reiniciou no meio da sessão | é esperado: o app zera o controle a cada reconexão. Se persistir, veja brownout |
| Estatísticas mostram "Parede incompatível" | a placa roda um firmware antigo (protocolo 1, 9 alvos) | grave o firmware desta pasta de novo |
| O LED não pisca nunca | a placa não tem o LED azul no GPIO 2 | ligue um LED com resistor de 220 Ω no GPIO 2 (seção 2) |
| A batida pisca, mas acerto e erro não | o app não está conectado, ou é o simulador | com o app conectado é ele quem manda; confira `EXPO_PUBLIC_DEVICE_SOURCE=websocket` |
| O app mostra "—" no impacto | você está no simulador | leitura simulada nunca vira número na tela; use `EXPO_PUBLIC_DEVICE_SOURCE=websocket` |
