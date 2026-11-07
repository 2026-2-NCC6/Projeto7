# Smash
Projeto 7 - 6º CCOMP

# FECAP - Fundação de Comércio Álvares Penteado
<p align="center">
<a href= "https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0"></a>
</p>

# 👨‍💻 Integrantes

- Felipe Vallim Soares (24026060)
- Guilhermy Mariano Lisboa Garcia (23025371)
- Gustavo Oliveira Demetrio (24026213)
- Saulo Pereira de Jesus (24026095)

# 👨‍🏫 Professores Orientadores

<a href="https://br.linkedin.com/in/edsonbarbero">Prof. Edson Ricardo Barbero</a>, <a href="https://www.linkedin.com/in/katia-bossi/">Prof. Katia Milani Lara Bossi</a>, <a href="https://www.linkedin.com/in/trencher/">Prof. João Francisco Trencher Martins</a>, <a href="https://www.linkedin.com/in/professorrodnil/">Prof. Rodnil da Silva Moreira Lisboa</a> e <a href="https://www.linkedin.com/in/victorbarq/">Prof. Victor Bruno Alexander Rosetti de Quiroz</a>

# 📄 Descrição

O **Smash** transforma uma parede comum em uma superfície de treino instrumentada para tênis. Seis alvos de MDF, dispostos em uma matriz 3×2 (três colunas, duas linhas), têm uma pastilha piezoelétrica colada na parte de trás. Quando a bola acerta um alvo, o sistema identifica qual foi atingido, mede a intensidade do impacto e registra o evento — sem câmera e sem visão computacional: o sinal é o próprio impacto físico, convertido em tensão pelo piezo.

Um microcontrolador **ESP32** varre continuamente os seis sensores, cada um ligado direto num pino analógico, aplica limiar e debounce por canal e decide, por comparação de pico, qual alvo foi realmente atingido. O evento chega em tempo real ao aplicativo mobile via **WebSocket**, para uma sessão de treino guiada por níveis e desafios, e o app envia cada sessão terminada ao backend por **HTTP**, para histórico, ranking e estatísticas.

Os treinos nascem no **site/dashboard**: um treinador monta a sequência de etapas, as regras, os cuidados e os metadados de marketplace, simula o treino no navegador com o mesmo motor de jogo do app e envia para revisão; um administrador publica. O app busca os treinos publicados pela API, joga etapa por etapa na parede e devolve cada batida, as interrupções e o resultado, que voltam para o site no histórico do jogador, na análise do treino e no painel de administração. Durante o jogo há uma parada de emergência que trava o sistema até ser reiniciado, e sem internet o resultado fica guardado no celular e é enviado quando a conexão volta.

O projeto integra, na prática, os conteúdos de quatro disciplinas do 6º semestre de Ciência da Computação:

- **Sistemas Embarcados e Robótica** — leitura analógica dos piezos, um pino ADC por alvo, e firmware em C++ no ESP32;
- **Teoria da Computação e Linguagens Formais** — a detecção por alvo modelada como máquina de estados finitos (`IDLE → ARMED → MEASURING_PEAK → EVENT_EMITTED → DEBOUNCE`);
- **Redes de Computadores e Cibersegurança** — comunicação WebSocket entre parede e app, HTTP entre app e backend, autenticação, papéis de acesso e auditoria;
- **Inovação e Empreendedorismo** — viabilidade do produto para clubes, escolas de tênis e jogadores amadores.

# 📋 Detalhes

🗂️ Estrutura de pastas<br>
├── 🗂️ documentos/<br>
│   ├── 📁 Entrega1/<br>
│   │   └── 📂 Inovação e Empreendedorismo<br>
│   │   └── 📂 Projeto Interdisciplinar: Internet das Coisas e Robótica<br>
│   │   └── 📂 Redes de Computadores e Cibersegurança<br>
│   │   └── 📂 Sistemas Embarcados e Robótica<br>
│   │   └── 📂 Teoria da Computação e Linguagens Formais<br>
│   ├── 📁 Entrega2/ (mesma estrutura das disciplinas)<br>
│   └── 📄 README.md → declaração de uso de IA nos documentos<br>
├── 🗂️ src/<br>
│   ├── 📁 Entrega1/ → código da Entrega 1<br>
│   │   ├── 📂 backend → NestJS + TypeORM + firmware do ESP32<br>
│   │   ├── 📂 frontend → app em Expo + React Native + TypeScript<br>
│   │   │   └── 📂 web → site/dashboard em React + Vite + TypeScript<br>
│   │   ├── 📂 scripts → emulador Android, emulador da parede e testes de segurança<br>
│   │   └── 📄 docker-compose.yml → banco, API e site em contêineres<br>
│   ├── 📁 Entrega2/ → código da Entrega 2, versão final do projeto (mesma estrutura de Entrega1)<br>
│   └── 📄 README.md → declaração de uso de IA no código<br>
├── 📄 CLAUDE.md<br>
└── 📄 README.md<br>

# 💻 Tecnologias para Desenvolvimento

<ul>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="18"/> <a href="https://code.visualstudio.com/">Visual Studio Code</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg" width="18"/> <a href="https://www.arduino.cc/">Arduino (ESP32)</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" width="18"/> <a href="https://en.cppreference.com/">C/C++</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18"/> <a href="https://reactnative.dev/">React Native (Expo)</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="18"/> <a href="https://vite.dev/">React + Vite (site/dashboard)</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18"/> <a href="https://www.typescriptlang.org/">TypeScript</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg" width="18"/> <a href="https://nestjs.com/">NestJS</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="18"/> <a href="https://www.postgresql.org/">PostgreSQL</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="18"/> <a href="https://www.docker.com/">Docker</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="18"/> <a href="https://github.com/">GitHub</a></li>
</ul>

# 📋 Licença/License
<a href="https://github.com/2026-2-NCC6/Projeto7">Smash</a> © 2026 by <a href="https://github.com/2026-2-NCC6/Projeto7">Felipe Vallim Soares, Guilhermy Mariano Lisboa Garcia, Gustavo Oliveira Demetrio, Saulo Pereira de Jesus</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="width: 18px;height:18px;margin-left: 4px;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="width: 18px;height:18px;margin-left: 4px;">
