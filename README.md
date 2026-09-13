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

O **Smash** transforma uma parede comum em uma superfície de treino instrumentada para tênis. Nove alvos de MDF, dispostos em uma matriz 3×3, têm uma pastilha piezoelétrica colada na parte de trás. Quando a bola acerta um alvo, o sistema identifica qual foi atingido, mede a intensidade do impacto e registra o evento — sem câmera e sem visão computacional: o sinal é o próprio impacto físico, convertido em tensão pelo piezo.

Um microcontrolador **ESP32** varre continuamente os nove sensores, aplica limiar e debounce por canal e decide, por comparação de pico, qual alvo foi realmente atingido. O evento chega em tempo real ao aplicativo mobile via **WebSocket**, para uma sessão de treino guiada por níveis e desafios, e ao backend via **MQTT**, para histórico e estatísticas no dashboard web.

O projeto integra, na prática, os conteúdos de quatro disciplinas do 6º semestre de Ciência da Computação:

- **Sistemas Embarcados e Robótica** — leitura analógica dos piezos, multiplexação dos canais e firmware em C++ no ESP32;
- **Teoria da Computação e Linguagens Formais** — a detecção por alvo modelada como máquina de estados finitos (`IDLE → ARMED → MEASURING_PEAK → EVENT_EMITTED → DEBOUNCE`);
- **Redes de Computadores e Cibersegurança** — comunicação WebSocket e MQTT entre parede, app e backend, e autenticação do jogador;
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
│   └── 📁 Entrega2/ (mesma estrutura das disciplinas)<br>
├── 🗂️ src/<br>
│   ├── 📁 Entrega1/<br>
│   │   ├── 📂 backend → NestJS + TypeORM + firmware do ESP32<br>
│   │   └── 📂 frontend → Expo + React Native + TypeScript<br>
│   └── 📁 Entrega2/ (não iniciada)<br>
├── 📄 CLAUDE.md<br>
└── 📄 README.md<br>

# 💻 Tecnologias para Desenvolvimento

<ul>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="18"/> <a href="https://code.visualstudio.com/">Visual Studio Code</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg" width="18"/> <a href="https://www.arduino.cc/">Arduino (ESP32)</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" width="18"/> <a href="https://en.cppreference.com/">C/C++</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18"/> <a href="https://reactnative.dev/">React Native (Expo)</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="18"/> <a href="https://www.typescriptlang.org/">TypeScript</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg" width="18"/> <a href="https://nestjs.com/">NestJS</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="18"/> <a href="https://www.postgresql.org/">PostgreSQL</a></li>
  <li><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="18"/> <a href="https://github.com/">GitHub</a></li>
</ul>

# 📋 Licença/License
<a href="https://github.com/2026-2-NCC6/Projeto7">Smash</a> © 2026 by <a href="https://github.com/2026-2-NCC6/Projeto7">Felipe Vallim Soares, Guilhermy Mariano Lisboa Garcia, Gustavo Oliveira Demetrio, Saulo Pereira de Jesus</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="width: 18px;height:18px;margin-left: 4px;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="width: 18px;height:18px;margin-left: 4px;">
