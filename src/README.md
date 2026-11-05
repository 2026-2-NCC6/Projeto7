# Entregas do PI
### **DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL**

Todo o código das duas entregas fica em `src/Entrega1`; a pasta `src/Entrega2` continua vazia. O uso de IA nos documentos de cada disciplina está declarado em [`documentos/README.md`](../documentos/README.md).

## Entrega 1
<br><br>

### Módulo do sistema 1 — Backend (`src/Entrega1/backend/src`)

| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Claude Code) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Projeto Interdisciplinar: IoT e Robótica — Entrega 1 (código do sistema) |
| **Finalidade de uso** | Geração e revisão de código da API NestJS em camadas (domínio, casos de uso, infraestrutura e rotas), das migrations do PostgreSQL e dos testes unitários |
| ***Prompts* principais utilizados** | Pedidos de implementação do cadastro e login com JWT, da progressão por XP, da ofensiva diária, das conquistas avaliadas sobre as sessões, do registro de sessões com telemetria por alvo, das estatísticas e do ranking |
| **Trechos ou entregas afetadas** | `domain/`, `application/`, `infrastructure/` e `presentation/` do backend, migrations e `backend/test` |

### Módulo do sistema 2 — Aplicativo (`src/Entrega1/frontend`)

| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Claude Code) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Projeto Interdisciplinar: IoT e Robótica — Entrega 1 (código do sistema) |
| **Finalidade de uso** | Geração e revisão de código das telas em React Native, do motor de jogo, da camada de dispositivo (simulador e adaptador WebSocket) e dos testes |
| ***Prompts* principais utilizados** | Pedidos de implementação das telas de login, cadastro, Início, Perfil, Estatísticas e Ranking a partir do protótipo, do motor de jogo com os modos Color, Score, Infinite Color e Infinite Score, e da fronteira entre o jogo e a parede |
| **Trechos ou entregas afetadas** | `frontend/src/screens`, `components`, `gameplay`, `device`, `theme` e os testes `*.test.ts(x)` |

### Módulo do sistema 3 — Firmware do ESP32 (`src/Entrega1/backend/firmware`)

| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Claude Code) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Sistemas Embarcados e Robótica / Projeto Interdisciplinar — Entrega 1 |
| **Finalidade de uso** | Primeira versão do firmware em C++ (Arduino), do protocolo JSON do impacto e do README de montagem |
| ***Prompts* principais utilizados** | Pedidos de implementação da varredura dos piezos com limiar por alvo, da janela de pico com debounce e do servidor WebSocket que publica o contrato `Impacto` |
| **Trechos ou entregas afetadas** | `firmware/smash_wall` (primeira versão) e `firmware/README.md` |

## Entrega 2
<br><br>

Os trechos de *prompts* entre aspas são cópias dos comandos enviados, com a grafia corrigida.

### Módulo do sistema 1 — Backend (`src/Entrega1/backend/src`)

| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Claude Code) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Redes de Computadores e Cibersegurança e Projeto Interdisciplinar — Entrega 2 |
| **Finalidade de uso** | Implementação das mitigações do relatório de riscos e dos seus testes |
| ***Prompts* principais utilizados** | 1. "Dá uma lida na nossa antiga entrega, que foi feita na entrega 1 […] e avalie, do estado do código atual e do que a gente entregou, o que tem que fazer: já dá para a gente fazer agora ou está faltando alguma coisa?"<br>2. "Eu quero que você leia o que foi requisitado na segunda entrega […]. Eu tirei foto de todas as análises, e a gente pode complementar o nosso documento com esse cara." |
| **Trechos ou entregas afetadas** | Sessão aberta pelo servidor com ticket, limite de tentativas no login, revogação de tokens, logs de auditoria em JSON, cabeçalhos de segurança, CORS restrito, recusa de segredo JWT fraco e atualização de dependências |

### Módulo do sistema 2 — Aplicativo (`src/Entrega1/frontend`)

| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Claude Code) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Projeto Interdisciplinar e Redes de Computadores e Cibersegurança — Entrega 2 |
| **Finalidade de uso** | Adaptação do app à parede 3×2, envio do retorno ao LED, pareamento por token e conexão com a parede real |
| ***Prompts* principais utilizados** | 1. "Lembrando que agora eu estou sem o projeto físico, mas construa pensando que esteja […], de uma forma que seja fácil de testar quando eu estiver com ele de fato."<br>2. "A gente precisa fazer o projeto funcionar agora. […] O que a gente precisa fazer para o app conversar com o sistema físico que a gente está implementando?" |
| **Trechos ou entregas afetadas** | `frontend/src/device` (modelo 3×2, parede incompatível, pareamento), `frontend/src/gameplay` (pausa enquanto a parede reconecta, comando `feedback`), exigência de HTTPS fora do desenvolvimento e atualização de dependências |

### Módulo do sistema 3 — Firmware do ESP32 (`src/Entrega1/backend/firmware`)

| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Claude Code) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Sistemas Embarcados e Robótica e Projeto Interdisciplinar — Entrega 2 |
| **Finalidade de uso** | Leitura direta dos 6 pinos do ADC1, LED da placa como atuador, pareamento por token e correções feitas no teste com a parede real |
| ***Prompts* principais utilizados** | 1. "Por que temos que ter essas peças adicionais? Somente detectar as vibrações não seria suficiente para se conectar com o app? Não tínhamos LED desenhado no projeto."<br>2. "Sim, faz o 1 e o 2 e bora pro atuador."<br>3. "A gente precisa fazer o projeto funcionar agora. Basicamente, a gente está com ele conectado aqui, com as 6 placas […]." |
| **Trechos ou entregas afetadas** | `smash_wall/config.h`, `wall_sensors`, `wall_actuator`, `wall_link`, `wall_protocol`, `secrets_example.h` e `firmware/README.md`; descarte de ruído do ADC e reconexão do Wi-Fi (03/11/2026) |

### Módulo do sistema 4 — Scripts (`src/Entrega1/scripts`)

| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Claude Code) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Projeto Interdisciplinar e Redes de Computadores e Cibersegurança — Entrega 2 |
| **Finalidade de uso** | Emulador da parede em rede e testes de segurança repetíveis |
| ***Prompts* principais utilizados** | 1. "Lembrando que agora eu estou sem o projeto físico, mas construa pensando que esteja […], de uma forma que seja fácil de testar quando eu estiver com ele de fato."<br>2. "Dá uma lida na nossa antiga entrega […] e avalie o que tem que fazer." |
| **Trechos ou entregas afetadas** | `wall-emulator.mjs`, `security-tests.mjs` e `zap-openapi.yaml` |

***Declaro que o uso acima descrito está em conformidade com o GUIA PARA O USO RESPONSÁVEL DE INTELIGÊNCIA ARTIFICIAL NA FECAP e que o conteúdo final é de minha plena responsabilidade autoral.***
