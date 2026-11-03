# Entregas do PI
### **DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL**
## Entrega 2
<br><br>

### Disciplina 1 — Inovação e Empreendedorismo

| Campo | Descrição |
| :--- | :--- |
| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| **Ferramenta utilizada** | Claude e Gemini |
| **Versão/modelo** | Claude Opus 5.5 e Gemini Argon 4 |
| **Disciplina / Trabalho** | Inovação e Empreendedorismo — Entrega 2 |
| **Finalidade de uso** | Síntese estratégica das 5 Forças de Porter, BMC e Unit Economics |
| **Prompts principais utilizados** | Conexão entre pivotagem de hardware 3x2, modelo B2B2C, LTV/CAC e margens |
| **Trechos ou entregas afetadas** | Arquivo `Entrega_2_Inovacao_e_Empreendedorismo_Smash.pdf` |

Na segunda entrega de Inovação e Empreendedorismo, o Claude Opus 5.5 e o Gemini Argon 4 foram empregados para refinar a coesão visual e argumentativa entre as decisões reais de engenharia do grupo (mudança para grade 3x2 sem multiplexador, reduzindo componentes para R$ 160, e servidor WebSocket próprio) e os indicadores econômico-financeiros (CMV de R$ 230, margens de 54% no kit e 90% no SaaS, relação LTV/CAC de 4,5x) no arquivo `Entrega_2_Inovacao_e_Empreendedorismo_Smash.pdf`.

### Disciplina 2 — Redes de Computadores e Cibersegurança

| Campo | Descrição |
| :--- | :--- |
| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| **Ferramenta utilizada** | Claude e Gemini |
| **Versão/modelo** | Claude Opus 5.5 e Gemini Argon 4 |
| **Disciplina / Trabalho** | Redes de Computadores e Cibersegurança — Entrega 2 |
| **Finalidade de uso** | Documentação de mitigações, scripts de teste e revisão SAST/DAST |
| **Prompts principais utilizados** | Implementação de tickets assinados, rate limit, autenticação WebSocket e relatório ZAP/Semgrep |
| **Trechos ou entregas afetadas** | Relatório de Mitigação de Riscos (DOCX/PDF) e pacote ZIP de código |

As ferramentas apoiaram a implementação de controles defensivos no backend NestJS, no app React Native e no firmware ESP32, além da estruturação dos resultados dos 21 ataques simulados e varreduras OWASP ZAP, Semgrep e Gitleaks sobre os 28 riscos mapeados (R01 a R28) nos arquivos `Entrega-2-Relatorio-de-Mitigacao-de-Riscos-Smash.docx`, `Entrega-2-Relatorio-de-Mitigacao-de-Riscos-Smash.pdf` e `Projeto7-entrega2-ciberseguranca-codigo.zip`.

### Disciplina 3 — Teoria da Computação e Linguagens Formais

| Campo | Descrição |
| :--- | :--- |
| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| **Ferramenta utilizada** | Claude e Gemini |
| **Versão/modelo** | Claude Opus 5.5 e Gemini Argon 4 |
| **Disciplina / Trabalho** | Teoria da Computação e Linguagens Formais — Entrega 2 |
| **Finalidade de uso** | Revisão formal das máquinas M1 e M2, pré/pós-condições e decidibilidade |
| **Prompts principais utilizados** | Formalização do AFN-ε equivalente a AFD, transdutor de Mealy e análise de decidibilidade |
| **Trechos ou entregas afetadas** | Arquivo `Entrega-2-Teoria-Computacao-Smash.pdf` |

O uso de IA auxiliou na documentação formal atualizada das duas máquinas de estados implementadas no código real — M1 no firmware C++ para detecção de pico em janela de 20 ms e M2 no motor de gameplay TypeScript — bem como na redação das pré e pós-condições e provas de decidibilidade determinística no arquivo `Entrega-2-Teoria-Computacao-Smash.pdf`.

### Disciplina 4 — Sistemas Embarcados e Robótica (Complementar Entrega 2)

| Campo | Descrição |
| :--- | :--- |
| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| **Ferramenta utilizada** | Claude e Gemini |
| **Versão/modelo** | Claude Opus 5.5 e Gemini Argon 4 |
| **Disciplina / Trabalho** | Sistemas Embarcados e Robótica — Entrega 2 |
| **Finalidade de uso** | Comentários no código C++, lógica não-bloqueante e roteiro de testes |
| **Prompts principais utilizados** | Refatoração de leitura direta nos 6 pinos ADC1, argmax em 20 ms e sequenciador LED GPIO 2 |
| **Trechos ou entregas afetadas** | Firmware em `backend/firmware/smash_wall` e relatório da Entrega 2 |

Para a entrega de programação e controle de dispositivos embarcados, os modelos auxiliaram na organização modular do firmware em C++ (separando leitura de sensores, atuador LED não-bloqueante no GPIO 2 e servidor WebSocket) e na documentação da transição da simulação inicial para a parede física 3x2.

### Disciplina 5 — Projeto Interdisciplinar: IoT e Robótica (Complementar Entrega 2)

| Campo | Descrição |
| :--- | :--- |
| **Aluno(s) Responsável(veis)** | Felipe Soares, Guilhermy Garcia, Gustavo Demetrio, Saulo Jesus |
| **Ferramenta utilizada** | Claude e Gemini |
| **Versão/modelo** | Claude Opus 5.5 e Gemini Argon 4 |
| **Disciplina / Trabalho** | Projeto Interdisciplinar: IoT e Robótica — Entrega 2 |
| **Finalidade de uso** | Consolidação da arquitetura final, testes automatizados e análise crítica |
| **Prompts principais utilizados** | Documentação das mudanças arquiteturais, emulador WebSocket, suítes de teste e limitações |
| **Trechos ou entregas afetadas** | Código-fonte integrado e documentação final do Projeto Interdisciplinar |

No fechamento técnico do Projeto Interdisciplinar, as ferramentas apoiaram a estruturação dos testes automatizados (86 testes no backend NestJS e 117 no app React Native), do emulador de parede via WebSocket e da seção de análise crítica comparando o backlog planejado na Entrega 1 com a implementação real da Entrega 2.

***Declaro que o uso acima descrito está em conformidade com o GUIA PARA O USO RESPONSÁVEL DE INTELIGÊNCIA ARTIFICIAL NA FECAP e que o conteúdo final é de minha plena responsabilidade autoral.***
