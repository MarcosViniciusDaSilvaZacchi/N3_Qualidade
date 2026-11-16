CENTRO UNIVERSITÁRIO CATÓLICA DE SANTA CATARINA \
ENGENHARIA DE SOFTWARE

MARCOS VINICIUS DA SILVA ZACCHI \
YAN CARLOS FARIAS

**CONSULTORIA DE QUALIDADE SOBRE O SISTEMA MY PARKING:** \
planejamento, execução e cobertura de testes de software

JOINVILLE \
2026

<!-- QUEBRA -->

MARCOS VINICIUS DA SILVA ZACCHI \
YAN CARLOS FARIAS

**CONSULTORIA DE QUALIDADE SOBRE O SISTEMA MY PARKING:** \
planejamento, execução e cobertura de testes de software

Trabalho final apresentado à disciplina de Qualidade de Software (Módulo 3: Testes de Software e Métricas) do curso de Engenharia de Software do Centro Universitário Católica de Santa Catarina, como requisito parcial para a avaliação N3.

Professora: Janaina Fontana Biffi Duarte

Data de entrega: 23 de novembro de 2026.

JOINVILLE \
2026

<!-- QUEBRA -->

## RESUMO

Este trabalho apresenta uma consultoria de qualidade sobre o MY Parking, um sistema de gestão de estacionamento em microsserviços desenvolvido pela equipe na disciplina de Projeto e Arquitetura de Software. Foram escolhidas três funcionalidades ligadas à operação e ao faturamento: registro de entrada de veículos, cálculo da tarifa e pagamento com liberação da cancela. Para elas, foram escritos seis critérios de aceitação e montado um plano de testes por nível. Foram projetados e executados treze casos de teste pela API do sistema, com evidências registradas para cada execução. A cobertura dos critérios de aceitação passou de 66,7% para 100% com a criação de casos complementares, mas apenas 53,8% dos casos e 66,7% dos critérios foram aprovados. Foram registrados cinco bugs. Os dois críticos são a possibilidade de concluir a saída pagando um valor qualquer informado na requisição e a perda de todos os dados ao reiniciar os serviços, que guardam tudo em memória. O bug de gravidade alta é uma tarifa diferente da prometida na documentação. O trabalho conclui que cobrir todos os critérios não garante a ausência de defeitos e que o sistema ainda não está pronto para uso real. Ao cliente, recomenda-se calcular o valor a pagar apenas no servidor, adotar persistência em banco de dados, definir uma regra de tarifa única e criar uma suíte de testes automatizados.

**Palavras-chave:** qualidade de software; teste de software; critérios de aceitação; cobertura de testes; métricas de qualidade.

<!-- QUEBRA -->

## LISTA DE QUADROS

Quadro 1 – Etapas do trabalho \
Quadro 2 – Identificação do projeto analisado \
Quadro 3 – Plano de testes por nível \
Quadro 4 – Ambiente, ferramentas e escopo dos testes \
Quadro 5 – Regra de tarifa em cada fonte do projeto \
Quadro 6 – Casos de teste CT-01 a CT-10 \
Quadro 7 – Casos de teste complementares CT-11 a CT-13 \
Quadro 8 – Registro de bugs \
Quadro 9 – Decisão entre teste manual e automatizado \
Quadro 10 – Matriz de cobertura dos critérios de aceitação \
Quadro 11 – Painel de qualidade \
Quadro 12 – Recomendações ao cliente \
Quadro 13 – Arquivos de evidência

<!-- QUEBRA -->

## LISTA DE TABELAS

Tabela 1 – Resumo da cobertura dos critérios de aceitação \
Tabela 2 – Síntese dos resultados

<!-- QUEBRA -->

## SUMÁRIO

1 INTRODUÇÃO \
1.1 Objetivo \
1.2 O sistema analisado \
1.3 Estrutura do trabalho \
2 METODOLOGIA \
2.1 Etapas \
2.2 Decisões tomadas \
3 FICHA 1 – PROJETO E PLANO DE TESTES \
3.1 Sobre o projeto \
3.2 Funcionalidades escolhidas e critérios de aceitação \
3.2.1 F1 – Registro de entrada de veículo \
3.2.2 F2 – Cálculo da tarifa de permanência \
3.2.3 F3 – Pagamento e liberação da cancela \
3.3 Plano de testes por nível \
3.3.1 Ambiente, ferramentas e escopo dos testes \
3.3.2 Qual funcionalidade é a mais arriscada? Por quê? \
4 FICHA 2 – CASOS DE TESTE E BUGS \
4.1 Casos de teste \
4.1.1 Casos complementares (criados na Ficha 3) \
4.2 Registro de bugs \
4.3 Manual ou automatizado? \
5 FICHA 3 – COBERTURA DE TESTES E RECOMENDAÇÕES AO CLIENTE \
5.1 Cobertura dos critérios de aceitação \
5.2 Reflexão \
5.3 Painel de qualidade \
5.4 Recomendações ao cliente \
6 CONSIDERAÇÕES FINAIS \
6.1 Síntese dos resultados \
6.2 Aprendizados \
REFERÊNCIAS \
APÊNDICE A – EVIDÊNCIAS E REPRODUÇÃO DOS TESTES

<!-- QUEBRA -->

## 1 INTRODUÇÃO

### 1.1 Objetivo

Este trabalho simula uma **consultoria de qualidade de software**. A equipe assumiu o papel de testadores e avaliou um sistema que ela mesma desenvolveu em outra disciplina, como se fosse entregá-lo a um cliente real. O objetivo foi responder a três perguntas:

1. O sistema faz o que foi prometido ao cliente?
2. Os testes cobrem tudo o que foi prometido?
3. O que o cliente deve corrigir primeiro, e como acompanhar a qualidade daqui para frente?

### 1.2 O sistema analisado

O **MY Parking** (ZACCHI; FARIAS, 2026) controla o pátio de um estacionamento:
- registra a entrada e a saída de carros e motos;
- reconhece clientes mensalistas pela placa;
- calcula a tarifa dos clientes avulsos;
- recebe o pagamento em PIX, cartão ou dinheiro;
- só libera a cancela depois que o pagamento é confirmado.

O sistema é feito em JavaScript. São cinco microsserviços em Node.js e Express (autenticação, estacionamento, mensalistas, pagamento e vagas), um API Gateway e um front-end em Vue 3. Foi desenvolvido na disciplina de Projeto e Arquitetura de Software.

### 1.3 Estrutura do trabalho

- A seção 2 descreve a metodologia.
- As seções 3, 4 e 5 apresentam as três fichas do trabalho, na ordem em que foram feitas: projeto e plano de testes, casos de teste e bugs, e cobertura e recomendações.
- A seção 6 traz a síntese dos resultados e os aprendizados.
- O Apêndice A explica como reproduzir os testes.

No texto, **CT-XX** identifica um caso de teste e **BUG-XX** um bug registrado. **F1-C1** significa "Funcionalidade 1, Critério 1".

<!-- QUEBRA -->

## 2 METODOLOGIA

### 2.1 Etapas

O trabalho seguiu as atividades do processo de teste descritas no programa de estudos do ISTQB (INTERNATIONAL SOFTWARE TESTING QUALIFICATIONS BOARD, 2023): análise, planejamento, projeto, execução e encerramento dos testes. O Quadro 1 resume cada etapa.

**Quadro 1 – Etapas do trabalho**

| Etapa | O que foi feito | Onde está |
|---|---|---|
| 1. Entender o projeto | Leitura do README, da documentação das entregas anteriores e do código-fonte, para identificar as regras de negócio e onde elas são implementadas. | Seção 3.1 |
| 2. Definir o que testar | Escolha das 3 funcionalidades que mexem com dinheiro e com a operação diária (entrada, tarifa, pagamento e cancela). Cada uma ganhou 2 critérios de aceitação no formato *Dado… quando… então…*. | Seção 3.2 |
| 3. Planejar | Plano por nível de teste (unidade, integração, sistema e aceitação), definição do ambiente e do escopo, e análise de risco. | Seção 3.3 |
| 4. Executar | O sistema foi iniciado localmente e os casos de teste foram executados pelo API Gateway, com um script que grava a requisição e a resposta de cada caso como evidência. Cada falha foi investigada no código para achar a causa. | Seção 4 e Apêndice A |
| 5. Medir a cobertura | Cada critério foi cruzado com os casos que o verificam. Para cada critério sem cobertura, foi criado e executado um caso novo. | Seção 5.1 |
| 6. Recomendar | Montagem do painel de indicadores e da lista de recomendações por prioridade, sempre justificadas por um bug ou número medido. | Seções 5.3 e 5.4 |

Fonte: elaborado pelos autores (2026).

### 2.2 Decisões tomadas

- **Regra de tarifa.** A documentação do próprio projeto traz três regras diferentes. Adotamos como referência a regra do README (R$ 10,00 na 1ª hora + R$ 5,00 por hora ou fração, moto paga metade), porque é a que foi prometida ao cliente. O código cobra outra coisa, e essa diferença foi registrada como bug de gravidade Alta.
- **Caminhão.** O cliente confirmou que o estacionamento só recebe carros e motos, pela mesma entrada. Por isso o caminhão, que o README cita, ficou fora dos critérios e dos testes.
- **Nível dos testes.** Os testes foram executados chamando a API, pelo mesmo Gateway que a tela usa. Assim os resultados são exatos e podem ser repetidos. A tela foi usada para entender o fluxo e conferir quais dados ela envia.

<!-- QUEBRA -->

## 3 FICHA 1 – PROJETO E PLANO DE TESTES

### 3.1 Sobre o projeto

**Quadro 2 – Identificação do projeto analisado**

| Item | Resposta |
|---|---|
| Nome do projeto | MY Parking (MY Service Parking) – Sistema de Gestão de Estacionamento |
| Para que serve (2 ou 3 linhas) | Controla o pátio de um estacionamento: registra a entrada e a saída de veículos, reconhece mensalistas pela placa, calcula a tarifa dos avulsos e recebe o pagamento (PIX, cartão ou dinheiro). Só libera a cancela depois que o pagamento é confirmado. Também gera relatórios em PDF e Excel. |
| Linguagem e tecnologias | JavaScript. Back-end em Node.js + Express, com 5 microsserviços (auth, estacionamento, mensalista, pagamento e vaga) atrás de um API Gateway. Front-end em Vue 3 + Vite + Pinia + Axios. Autenticação por JWT. Os repositórios usados hoje guardam os dados em memória (`InMemory*Repository`). |
| Onde está o código (link ou pasta) | <https://github.com/MarcosViniciusDaSilvaZacchi/MY_SP> |

Fonte: elaborado pelos autores (2026), com base em Zacchi e Farias (2026).

### 3.2 Funcionalidades escolhidas e critérios de aceitação

Formato: **Dado** … **quando** … **então** …

Regra de tarifa usada como referência: a que o **README do projeto (§4.3)** promete ao cliente. São R$ 10,00 pela 1ª hora, mais R$ 5,00 por hora ou fração excedente, com multiplicador por porte do veículo: carro 1,0× e moto 0,5×.

**Regra do cliente:** o estacionamento recebe só **carros e motos**, pela mesma entrada. Caminhão não entra. Por isso o multiplicador de caminhão (2,0×), que o README cita, ficou fora dos critérios.

#### 3.2.1 F1 – Registro de entrada de veículo

- **História:** Como operador de pátio, quero registrar a entrada de um veículo pela placa para controlar quem está no estacionamento e emitir o comprovante.
- **F1-C1:** Dado que a placa `BRA2E19` não tem nenhuma entrada aberta e não pertence a um mensalista, quando o operador registra a entrada, então o sistema cria uma movimentação com status `ABERTA` e tipo `ROTATIVO` (avulso), e mostra o comprovante com a placa e a data e hora de entrada.
- **F1-C2:** Dado que a placa `BRA2E19` já tem uma entrada aberta, quando o operador tenta registrar a entrada de novo, então o sistema recusa com a mensagem "Veículo já possui entrada aberta" e não cria uma segunda movimentação.

#### 3.2.2 F2 – Cálculo da tarifa de permanência

- **História:** Como operador de pátio, quero que o sistema calcule sozinho o valor a cobrar de um veículo avulso para não errar a cobrança nem precisar fazer a conta à mão.
- **F2-C1:** Dado que um **carro** avulso ficou no pátio, quando o operador consulta o valor de saída, então o sistema cobra R$ 10,00 pela 1ª hora e R$ 5,00 por hora ou fração excedente. Exemplos: 60 min = R$ 10,00, 61 min = R$ 15,00, 130 min = R$ 20,00.
- **F2-C2:** Dado que o veículo avulso é uma **moto**, quando o operador consulta o valor de saída, então o sistema cobra metade do valor de carro (0,5×). Exemplos: moto 61 min = R$ 7,50, moto 130 min = R$ 10,00.

#### 3.2.3 F3 – Pagamento e liberação da cancela

- **História:** Como dono do estacionamento, quero que a cancela só abra depois que o pagamento for confirmado, e que o troco em dinheiro seja calculado certo, para não perder dinheiro.
- **F3-C1:** Dado que o valor devido é R$ 15,00, quando o operador recebe R$ 20,00 em dinheiro, então o pagamento fica `CONFIRMADO` com troco de R$ 5,00. Se o valor recebido for menor que o devido, o pagamento é recusado.
- **F3-C2:** Dado que um veículo avulso tem valor a pagar e não tem pagamento confirmado (sem pagamento, ou com PIX ainda `PENDENTE`), quando o operador tenta registrar a saída, então o sistema bloqueia a saída (HTTP 402) com uma mensagem orientando a concluir o pagamento, e a movimentação continua `ABERTA`.

### 3.3 Plano de testes por nível

**Quadro 3 – Plano de testes por nível**

| Funcionalidade | Unidade (uma função sozinha) | Integração (tela e banco, sistema e API) | Sistema (o sistema inteiro, como o usuário usa) | Aceitação (cliente confere os critérios) |
|---|---|---|---|---|
| F1 | `AvaliadorAcessoContext.avaliar()`: sem mensalista vira `ROTATIVO`; mensalista `EM_DIA` vira `MENSALISTA`; mensalista bloqueado tem a entrada negada. `Movimentacao.validar()`: placa vazia. | `estacionamento-service` consultando o `mensalista-service` por placa (`MensalistaClient`), incluindo o caso de o serviço de mensalistas estar fora do ar. Chamada `POST /entradas` pelo Gateway com token JWT. Entrada duplicada retornando 409. | No navegador: login → tela Entrada → digitar placa → conferir o comprovante e o veículo aparecendo no Dashboard. Testar placa inválida, placa vazia e placa repetida. | O cliente registra a entrada de um carro avulso e de um mensalista e confere F1-C1 e F1-C2. |
| F2 | `TarifaPadraoStrategy.calcular()` (a estratégia que está ativa) com valores de limite: 60, 61 e 130 minutos, para carro e para moto, além de valor negativo e texto no lugar de número. `Movimentacao.calcularPermanenciaMinutos()`. | `POST /pagamentos/calcular` pelo Gateway: o `estacionamento-service` envia a permanência e o `pagamento-service` devolve o valor. Conferir se o valor mostrado na tela é o mesmo que o back-end calculou. | No navegador: registrar a entrada → ir em Saída → conferir tempo e valor. Para o tempo passar, usar os veículos de exemplo que o sistema já cria com entrada antiga. | O cliente confere a tabela de exemplos de F2-C1 e F2-C2. |
| F3 | `DinheiroProcessor.processar()`: troco exato, troco zero e valor insuficiente. Validação do cartão (Luhn) e geração do payload PIX. `EstacionamentoService.registrarSaida()` com o `PagamentoClient` simulado (mock). | `estacionamento-service` ↔ `pagamento-service`: a saída consulta `GET /pagamentos/movimentacao/:id` e só libera com `CONFIRMADO`. PIX `PENDENTE` → confirmar → saída liberada. | Fluxo completo no navegador: entrada → saída → pagar em dinheiro, cartão e PIX → cancela liberada → recibo em PDF. Tentar sair sem pagar. | O cliente faz uma saída paga em dinheiro e uma sem pagamento, e confere F3-C1 e F3-C2. |

Fonte: elaborado pelos autores (2026).

#### 3.3.1 Ambiente, ferramentas e escopo dos testes

**Quadro 4 – Ambiente, ferramentas e escopo dos testes**

| Item | Definição |
|---|---|
| Ambiente | Notebook Windows 10 com Node.js 23. Sistema iniciado localmente com `node iniciar.js` (5 microsserviços + Gateway + front-end), com os dados de exemplo que o próprio sistema cria ao iniciar. |
| Ferramentas | Navegador para os testes de sistema. Script Node.js (`fetch`) chamando o API Gateway para os testes de integração e as evidências em JSON. Leitura do código-fonte para localizar a causa dos bugs. |
| Usuário de teste | `operador@myparking.com` (perfil Operador), que é o usuário do dia a dia. O Admin fica para os relatórios. |
| Dentro do escopo | Entrada, cálculo de tarifa, pagamento (dinheiro e PIX) e liberação da cancela. |
| Fora do escopo | Relatórios PDF/Excel, gestão de vagas, cadastro de mensalistas e de usuários, desempenho e carga. Esses itens ficam como sugestão para uma próxima rodada. |
| Critério para dar a rodada por encerrada | Todos os critérios de aceitação com pelo menos um caso executado, e todo caso que falhar com um bug registrado. |

Fonte: elaborado pelos autores (2026).

**Observação sobre "tela e banco":** hoje os serviços usam repositórios em memória. O README fala em SQLite, mas o código não usa. Por isso o teste de integração com banco de dados não se aplica nesta versão. No lugar dele, testamos a integração entre os microsserviços. Fica registrado como risco: ao reiniciar os serviços, todos os dados se perdem.

#### 3.3.2 Qual funcionalidade é a mais arriscada? Por quê?

**F3 – Pagamento e liberação da cancela.** Ela envolve dinheiro e depende de três serviços conversando entre si (estacionamento, pagamento e Gateway). Uma falha nela gera prejuízo direto: um carro sai sem pagar ou é cobrado errado. Ela também depende do valor calculado em F2, então qualquer erro de tarifa passa direto para o caixa.

A **F2** vem logo atrás porque a regra de tarifa não está clara nos documentos do próprio projeto. Cada fonte diz uma coisa:

**Quadro 5 – Regra de tarifa em cada fonte do projeto**

| Fonte | O que diz |
|---|---|
| README §4.3 (regra adotada nos critérios) | R$ 10,00 na 1ª hora + R$ 5,00 por hora ou fração adicional, com multiplicador por porte (moto 0,5×). O README também cita caminhão (2,0×) e vagas de caminhão, que o cliente não usa. |
| Entrega N1 (RN-06) e código ativo (`TarifaPadraoStrategy`) | R$ 8,00 por hora ou fração, 10 min de carência, sem porte. O sistema nem registra o porte na entrada. |
| `docs/api-contracts.md` | exemplo de 150 min = R$ 25,00, valor que nenhuma das duas regras produz |

Fonte: elaborado pelos autores (2026), com base em Zacchi e Farias (2026).

Como o cliente recebeu a promessa do README, a cobrança feita pelo código é tratada como **bug de gravidade Alta** (resultado errado) na Ficha 2.

<!-- QUEBRA -->

## 4 FICHA 2 – CASOS DE TESTE E BUGS

### 4.1 Casos de teste

**Como foi executado (16/11/2026):** o sistema foi iniciado com `node iniciar.js`, e os casos foram chamados pelo API Gateway (`http://localhost:3000/api`), logado como `operador@myparking.com`. O script está em [evidencias/executar-casos.js](evidencias/executar-casos.js). A requisição e a resposta completas de cada caso estão em `evidencias/CT-XX.json`. O veículo `ABC1D23` (movimentação `1002`, com entrada 45 min antes do início do sistema) vem nos dados de exemplo do próprio sistema. Por isso dá para testar a saída sem esperar o tempo passar.

**Quadro 6 – Casos de teste CT-01 a CT-10**

| ID | Funcionalidade | Pré-condição | Passos | Dados de entrada | Resultado esperado | Resultado obtido | Passou? |
|---|---|---|---|---|---|---|---|
| CT-01 | F1 – Entrada | Operador logado. `BRA2E19` sem entrada aberta e sem contrato de mensalista. | Enviar `POST /entradas` com a placa. | placa = `BRA2E19` | HTTP 201. Movimentação `ABERTA`, tipo `ROTATIVO`, com data e hora de entrada. | HTTP 201. Movimentação `ABERTA`, tipo `ROTATIVO`, entrada às 22:46:56. | Sim |
| CT-02 | F1 – Entrada | CT-01 executado (`BRA2E19` com entrada aberta). | Enviar `POST /entradas` de novo com a mesma placa. | placa = `BRA2E19` | HTTP 409, "Veículo já possui entrada aberta", sem criar nova movimentação. | HTTP 409, "Veiculo ja possui entrada aberta". | Sim |
| CT-03 | F1 – Entrada (campo vazio) | Operador logado. | Enviar `POST /entradas` com placa vazia. | placa = `""` | HTTP 400, "Placa obrigatória". | HTTP 400, "Placa obrigatoria". | Sim |
| CT-04 | F1 – Entrada (formato inválido) | Operador logado. | Enviar `POST /entradas` com uma placa fora do padrão antigo (`ABC1234`) e do Mercosul (`ABC1D23`). | placa = `12@` | HTTP 400, placa inválida. O README promete validar os dois padrões. | **HTTP 201.** Entrada aberta para a placa `12@`. | **Não** |
| CT-05 | F2 – Tarifa | `BRA2E19` com entrada aberta (CT-01). | Enviar `POST /pagamentos/calcular` (mesma chamada que a tela de Saída faz). | carro, permanência = 61 min | R$ 15,00 (R$ 10,00 da 1ª hora + R$ 5,00 de uma fração). | **R$ 8,00**, pela "Tabela Padrão Rotativo": R$ 8/h com 10 min de carência. | **Não** |
| CT-06 | F2 – Tarifa (negativo e texto) | `BRA2E19` com entrada aberta. | Enviar `POST /pagamentos/calcular` duas vezes. | permanência = `-30` e permanência = `"abc"` | HTTP 400 nos dois casos (permanência inválida). | **HTTP 200 com R$ 0,00** nos dois casos, marcados como "dentro da carência". Com `"abc"`, a permanência volta como `null`. | **Não** |
| CT-07 | F3 – Pagamento em dinheiro | `BRA2E19` com entrada aberta e sem pagamento. | Enviar `POST /pagamentos` em dinheiro. | devido = R$ 15,00, recebido = R$ 20,00 | HTTP 201, status `CONFIRMADO`, troco R$ 5,00. | HTTP 201, `CONFIRMADO`, troco R$ 5,00. | Sim |
| CT-08 | F3 – Dinheiro insuficiente | `ABC1D23` (mov. 1002) com entrada aberta. | Enviar `POST /pagamentos` em dinheiro. | devido = R$ 15,00, recebido = R$ 10,00 | HTTP 400, pagamento recusado. | HTTP 400, "Valor em dinheiro insuficiente. Saldo devido: R$ 15.00, recebido: R$ 10.00". | Sim |
| CT-09 | F3 – Cancela sem pagamento | `ABC1D23` há 47 min no pátio, sem pagamento confirmado (o de CT-08 foi recusado). | 1. Enviar `POST /saidas`. 2. Consultar a movimentação aberta. | placa = `ABC1D23`, mov. = `1002` | HTTP 402, mensagem pedindo o pagamento. Movimentação continua `ABERTA`. | HTTP 402, "Para liberar a cancela, conclua primeiro o pagamento do estacionamento". Movimentação continua `ABERTA`. | Sim |
| CT-10 | F3 – Valor pago adulterado | `ABC1D23` há 47 min no pátio, sem pagamento. | 1. Enviar `POST /pagamentos` informando o próprio valor. 2. Enviar `POST /saidas`. | valor = R$ 0,01, recebido = R$ 0,01 | Pagamento recusado ou cobrado pelo valor real (R$ 10,00 pela regra do README), e saída bloqueada. | **Pagamento `CONFIRMADO` de R$ 0,01 e saída liberada (HTTP 200, `FINALIZADA`).** | **Não** |

Fonte: elaborado pelos autores (2026).

**Resumo da execução:** 10 casos executados, 6 passaram e 4 falharam (taxa de aprovação de 60%).

#### 4.1.1 Casos complementares (criados na Ficha 3)

Os casos CT-11 e CT-12 foram criados para os critérios que ficaram sem cobertura na análise da Ficha 3. O CT-13 foi um teste exploratório sobre o risco de perda de dados apontado na Ficha 1. Os três foram executados depois de reiniciar o sistema, com o script [evidencias/executar-casos-ficha3.js](evidencias/executar-casos-ficha3.js).

**Quadro 7 – Casos de teste complementares CT-11 a CT-13**

| ID | Funcionalidade | Pré-condição | Passos | Dados de entrada | Resultado esperado | Resultado obtido | Passou? |
|---|---|---|---|---|---|---|---|
| CT-11 | F2 – Tarifa de moto | Operador logado. Caminhão não é testado porque o cliente não recebe caminhões. | Enviar `POST /pagamentos/calcular` duas vezes, informando `tipoVeiculo` = `MOTO`. | moto, permanência = 61 min e permanência = 130 min | 61 min: R$ 7,50 (0,5 × R$ 15,00). 130 min: R$ 10,00 (0,5 × R$ 20,00). | **R$ 8,00 e R$ 16,00, os mesmos valores de um carro.** O porte é ignorado, e a entrada (`POST /entradas`) nem tem campo para dizer se é carro ou moto. | **Não** |
| CT-12 | F3 – PIX pendente | Sistema recém-iniciado. `ABC1D23` (mov. 1002) há 45 min no pátio, sem pagamento. | 1. Gerar a cobrança PIX (`iniciarPix: true`). 2. Tentar a saída. 3. Confirmar o PIX. 4. Tentar a saída de novo. | mov. = `1002`, forma = `PIX` | Passo 2: HTTP 402, pedindo a confirmação do PIX. Passo 4: HTTP 200, saída `FINALIZADA`. | Passo 1: PIX `PENDENTE`. Passo 2: HTTP 402, "Para liberar a saída, confirme primeiro o recebimento do pagamento PIX". Passo 4: HTTP 200, `FINALIZADA`. Obs.: o valor cobrado foi R$ 8,00 em vez de R$ 10,00 (BUG-02). | Sim |
| CT-13 | Todas – Persistência | CT-01 a CT-10 executados (entrada `BRA2E19`, placa `12@` e pagamentos de CT-07 e CT-10 gravados). Retrato dos dados guardado em `CT-13-antes.json`. | 1. Parar todos os serviços. 2. Iniciar de novo (`node iniciar.js`). 3. Listar entradas e pagamentos. | — | Os registros feitos antes do reinício continuam lá. O README diz que cada serviço grava em SQLite. | **Todos os registros sumiram.** Só sobraram os 3 veículos e o 1 pagamento de exemplo, que o sistema cria ao iniciar. | **Não** |

Fonte: elaborado pelos autores (2026).

**Resumo geral (CT-01 a CT-13):** 13 casos executados, 7 passaram e 6 falharam (taxa de aprovação de 53,8%).

### 4.2 Registro de bugs

Gravidade: **Crítica** (impede o uso ou perde dados) · **Alta** (resultado errado) · **Média** (funciona, mas com problema) · **Baixa** (detalhe visual ou de texto).

**Quadro 8 – Registro de bugs**

| ID | Caso de teste | O que aconteceu | O que deveria acontecer | Como reproduzir | Gravidade |
|---|---|---|---|---|---|
| BUG-01 | CT-10 | O `pagamento-service` confia na permanência e no valor que chegam na requisição. Ele não consulta o horário de entrada real no `estacionamento-service`. Se a requisição não traz a permanência (ou traz 10 min ou menos), o motor de tarifa dá R$ 0 e o serviço passa a usar o campo `valor` enviado pelo cliente (`PagamentoService.js`, linhas 63–65). Na saída, o `estacionamento-service` só confere se existe um pagamento `CONFIRMADO`, não o valor dele. Resultado: um carro com 47 min de pátio saiu pagando R$ 0,01. A tela normal envia os dados certos, mas qualquer chamada direta à API consegue fazer isso, com um token de operador e uma ferramenta como Postman ou `curl`. | O valor devido deve ser calculado no back-end, a partir do horário de entrada guardado pelo `estacionamento-service`, sem aceitar valor ou permanência vindos do cliente. A saída só pode ser liberada se o valor pago cobrir o valor devido. | Logado, enviar `POST /api/pagamentos` com `{movimentacaoId:"1002", forma:"DINHEIRO", valor:0.01, valorPago:0.01}` → `CONFIRMADO`. Depois, `POST /api/saidas` com `{movimentacaoId:"1002"}` → HTTP 200, `FINALIZADA`. | **Crítica** (o estacionamento perde dinheiro, e qualquer operador consegue fazer isso) |
| BUG-02 | CT-05, CT-11, CT-12 | A tarifa ativa é a `TarifaPadraoStrategy`: R$ 8,00 por hora com 10 min de carência, e o porte do veículo é ignorado. 61 min custam R$ 8,00 tanto para carro quanto para moto. A entrada nem registra se o veículo é carro ou moto. A própria documentação do projeto traz três regras diferentes (README, entrega N1 e `docs/api-contracts.md`). | Seguir a regra prometida no README §4.3: R$ 10,00 na 1ª hora + R$ 5,00 por hora ou fração, e moto pagando metade. Exemplos: carro 61 min = R$ 15,00, moto 61 min = R$ 7,50. | `POST /api/pagamentos/calcular` com `{permanenciaMinutos:61}` → `valorCalculado: 8`. Com `tipoVeiculo:"MOTO"`, também `8`. | **Alta** |
| BUG-03 | CT-06 | Permanência negativa (`-30`) ou em texto (`"abc"`) é aceita e devolve R$ 0,00 como se estivesse dentro da carência. | Recusar com HTTP 400 e avisar que a permanência é inválida. | `POST /api/pagamentos/calcular` com `{permanenciaMinutos:"abc"}` → HTTP 200, `valorCalculado: 0`. | Média |
| BUG-04 | CT-04 | O back-end aceita qualquer placa. A placa `12@` foi registrada com entrada aberta. A tela só confere se a placa tem 7 caracteres (`EntradaView.vue`, linha 50), então até `1234567` passa. | Validar no back-end os padrões `ABC1234` e `ABC1D23`, como o README promete. | `POST /api/entradas` com `{placa:"12@"}` → HTTP 201. | Média |
| BUG-05 | CT-13 | Todos os dados se perdem quando os serviços são reiniciados: entradas, saídas, pagamentos, mensalistas, vagas e operadores cadastrados. Os cinco microsserviços usam `InMemory*Repository`, por exemplo `estacionamento-service/src/routes/index.js`, linha 13. O README promete SQLite com um banco por serviço. | Gravar os dados em um banco (o SQLite prometido) para que sobrevivam a um reinício, uma queda de energia ou uma atualização. | 1. Registrar uma entrada. 2. Parar e iniciar o sistema. 3. `GET /api/entradas` → a entrada não existe mais (compare `CT-13-antes.json` com `CT-13.json`). | **Crítica** (perda de dados, inclusive do histórico financeiro) |

Fonte: elaborado pelos autores (2026).

**Resumo dos bugs:** 5 abertos. São 2 Críticos (BUG-01 e BUG-05), 1 Alto (BUG-02) e 2 Médios (BUG-03 e BUG-04).

### 4.3 Manual ou automatizado?

**Quadro 9 – Decisão entre teste manual e automatizado**

| ID | Manter manual ou automatizar? | Por quê? | Nível da automação (unidade, integração, sistema) |
|---|---|---|---|
| CT-01 | Automatizar | É o caminho principal do sistema e precisa ser repetido a cada mudança. O resultado (HTTP 201, `ABERTA`, `ROTATIVO`) é fácil de conferir por um programa. | Integração (API do `estacionamento-service` + `mensalista-service`) |
| CT-02 | Automatizar | É uma regra simples e o código HTTP 409 se confere sem ambiguidade. | Unidade (`EstacionamentoService.registrarEntrada` com repositório em memória) |
| CT-03 | Automatizar | Validação de campo vazio, barata de testar e fácil de quebrar sem perceber. | Unidade |
| CT-04 | Automatizar | Depois da correção, vale testar uma lista de placas válidas e inválidas de uma vez, o que à mão seria repetitivo. | Unidade (função de validação de placa) |
| CT-05 | Automatizar | Cálculo de dinheiro com valores de limite (60, 61 e 130 min, carro e moto). Um programa confere os valores exatos sem erro de conta. | Unidade (`TarifaStrategy.calcular`) |
| CT-06 | Automatizar | Entradas inválidas são o que uma pessoa esquece de testar à mão. | Unidade |
| CT-07 | Automatizar a regra e manter manual a parte da tela | O cálculo do troco é automatizável. Ver se o troco aparece bem na tela e no recibo em PDF depende de uma pessoa olhar. | Unidade (`DinheiroProcessor`) + conferência manual do recibo |
| CT-08 | Automatizar | A recusa (HTTP 400) é objetiva. | Unidade (`DinheiroProcessor`) |
| CT-09 | Automatizar | É a trava de segurança da cancela e envolve dois serviços. Precisa rodar a cada versão. | Integração (`estacionamento-service` ↔ `pagamento-service`) |
| CT-10 | Automatizar | É o bug mais grave encontrado. Um teste automático garante que ele não volte depois de corrigido (teste de regressão). | Integração / sistema (fluxo pagamento → saída pela API) |
| CT-11 | Automatizar | São os mesmos cálculos do CT-05 com o multiplicador da moto. Dá para testar carro e moto numa única tabela de dados. | Unidade |
| CT-12 | Automatizar o fluxo e manter manual a conferência do QR Code | A sequência pendente → 402 → confirmar → 200 é objetiva. Ver se o QR Code abre no aplicativo do banco exige uma pessoa com um celular. | Integração + manual (leitura do QR Code) |
| CT-13 | Automatizar | Depois de trocar o repositório em memória por SQLite, um teste que grava, reinicia o serviço e lê de novo evita que a perda de dados volte. | Integração (serviço + banco) |

Fonte: elaborado pelos autores (2026).

**Conclusão:** os 13 casos devem ser automatizados. Em 11 deles a automação é completa. No CT-07 e no CT-12 só a regra é automatizada, e a conferência visual do recibo e do QR Code continua manual. Hoje o projeto não tem nenhum teste automatizado (nenhum `package.json` tem script `test`). Os scripts `evidencias/executar-casos*.js` deste trabalho são um primeiro passo, mas ainda dependem de o sistema estar rodando e não conferem os resultados sozinhos.

<!-- QUEBRA -->

## 5 FICHA 3 – COBERTURA DE TESTES E RECOMENDAÇÕES AO CLIENTE

### 5.1 Cobertura dos critérios de aceitação

Um caso só conta se os dados de entrada e o resultado esperado correspondem ao que o critério descreve.
Cobertura = critérios cobertos ÷ total de critérios × 100. Para cada critério não coberto, foi criado e executado um caso novo (CT-11 e CT-12).

**Quadro 10 – Matriz de cobertura dos critérios de aceitação**

| Critério | Casos de teste que o verificam | Coberto? | Novo caso (se não coberto) | Resultado do novo caso |
|---|---|---|---|---|
| F1-C1 – entrada de carro avulso | CT-01 | Sim | — | — |
| F1-C2 – entrada repetida recusada | CT-02 | Sim | — | — |
| F2-C1 – tarifa de carro (R$ 10,00 + R$ 5,00/h) | CT-05 | Sim | — | — |
| F2-C2 – tarifa de moto (0,5×) | nenhum. Todos os casos da Ficha 2 usaram carro. | **Não** | CT-11: moto com 61 e 130 min | **Falhou.** Cobrou R$ 8,00 e R$ 16,00 em vez de R$ 7,50 e R$ 10,00 (BUG-02) |
| F3-C1 – troco em dinheiro | CT-07 (troco de R$ 5,00) e CT-08 (valor insuficiente) | Sim | — | — |
| F3-C2 – saída bloqueada sem pagamento confirmado | CT-09 cobre só "sem pagamento". O caso "PIX ainda `PENDENTE`", que está escrito no critério, não foi testado. | **Não** (parcial) | CT-12: PIX pendente → saída → confirmar → saída | **Passou.** HTTP 402 com o PIX pendente e HTTP 200 depois da confirmação |

Fonte: elaborado pelos autores (2026).

Os casos CT-11 e CT-12 estão completos, no formato da Ficha 2, na subseção 4.1.1. As evidências estão em `evidencias/CT-11.json` e `evidencias/CT-12.json`.

**Tabela 1 – Resumo da cobertura dos critérios de aceitação**

| Resumo | Valor |
|---|---|
| Critérios cobertos / total de critérios | Antes: 4 / 6. Depois: 6 / 6 |
| Cobertura antes dos novos casos (%) | 4 ÷ 6 × 100 = **66,7%** |
| Cobertura depois dos novos casos (%) | 6 ÷ 6 × 100 = **100%** |
| Critérios **aprovados**, ou seja, cobertos e passando (informativo) | 4 / 6 = **66,7%**. F2-C1 e F2-C2 falham por causa do BUG-02. |

Fonte: elaborado pelos autores (2026).

Cobertura alta não quer dizer sistema aprovado. Todos os critérios estão testados, mas um terço deles falha.

### 5.2 Reflexão

1. **Algum critério ficou sem teste na Ficha 2? Por que passou despercebido? Que tipo de situação vocês tendem a esquecer?**

   Sim, dois. O **F2-C2 (moto)** ficou totalmente sem teste, e o **F3-C2** ficou pela metade, com o PIX pendente de fora.

   O F2-C2 passou despercebido porque montamos os casos pensando no "veículo padrão", o carro. Como carro e moto usam a mesma entrada e a mesma tela, parecia que um teste valia pelos dois. Além disso, a API não tem nenhum campo para dizer se o veículo é carro ou moto. Quando a tela não mostra uma opção, a gente nem lembra que ela existe. Foi justamente esse caso esquecido que mostrou que o sistema não diferencia moto de carro.

   No F3-C2, testamos o "não pagou" e esquecemos o estado intermediário: o pagamento existe, mas ainda não foi confirmado (PIX `PENDENTE`).

   Situações que tendemos a esquecer:
   - **variações de um mesmo critério** (outros tipos de veículo ou de cliente);
   - **estados intermediários e assíncronos** (pendente, expirado, cancelado);
   - **o que acontece fora da tela**, como chamadas diretas à API e reinício do sistema. Foi assim que apareceram os dois bugs críticos (BUG-01 e BUG-05), que nenhum critério pedia.

2. **Se 100% dos critérios estivessem cobertos, o sistema estaria livre de bugs? Isso garantiria que todo o código foi testado? Por quê?**

   **Não, e não.** Chegamos a 100% de cobertura e o sistema continua com 5 bugs abertos, 2 deles críticos.

   - **Cobertura de critérios não é ausência de bugs.** Cada critério foi verificado com poucos valores, e testes só mostram a presença de defeitos, nunca a ausência (DIJKSTRA, 1972). O BUG-01 (pagar R$ 0,01 e sair) está dentro da F3, mas os testes "normais" do critério passavam. Ele só apareceu quando tentamos usar o sistema de um jeito que o critério não descrevia.
   - **Também existem requisitos que nenhum critério cobre.** É o caso da persistência dos dados (BUG-05) e da validação no back-end (BUG-03 e BUG-04).
   - **Cobertura de critérios não é cobertura de código.** Os critérios dizem o que o cliente pediu, não quais linhas foram executadas. Nada testou a validação de cartão (algoritmo de Luhn), os relatórios em PDF e Excel, a gestão de vagas, os mensalistas ou o login. Medir a cobertura de código exige uma ferramenta própria (por exemplo, `jest --coverage` ou `c8`), que mostra quais linhas e desvios (`if`/`else`) foram executados. E mesmo 100% de linhas executadas não garante que os resultados foram conferidos.

### 5.3 Painel de qualidade

**Quadro 11 – Painel de qualidade**

| Indicador | Valor atual | Meta | Com que frequência medir | Alerta: o que fazer se piorar |
|---|---|---|---|---|
| Cobertura dos critérios de aceitação (critérios com caso de teste ÷ total) | 100% (6/6). Era 66,7% antes do CT-11 e do CT-12. | 100% | A cada nova funcionalidade ou alteração de critério | Abaixo de 100%: a funcionalidade não é entregue até ganhar os casos que faltam. |
| Taxa de aprovação dos casos de teste (casos que passaram ÷ executados) | 53,8% (7/13) | ≥ 95% antes de cada entrega ao cliente | A cada versão (a cada merge na `main`) | Abaixo de 95%: bloquear a entrega e fazer a triagem dos casos que falharam no mesmo dia. |
| Bugs abertos de gravidade Crítica ou Alta | 3 (BUG-01, BUG-05 Críticos e BUG-02 Alto) | 0 | Semanal, e sempre que surgir um bug novo | Qualquer Crítico novo para o desenvolvimento das outras tarefas até ser corrigido. Alto sem correção em 1 semana vira assunto da reunião com o cliente. |
| Critérios de aceitação aprovados (cobertos e passando ÷ total) | 66,7% (4/6) | 100% | A cada entrega | Abaixo de 100%: avisar o cliente quais regras ainda não funcionam antes da entrega, sem esconder. |
| Casos de teste automatizados no repositório do projeto | 0% (0 de 13; nenhum serviço tem script `test`) | ≥ 70% até a próxima entrega e 100% dos casos de regras de dinheiro (F2 e F3) | Semanal | Se o número parar de subir: nenhum pull request entra sem teste automatizado da parte alterada. |
| Regras de negócio com documentação divergente do código | 1 regra (tarifa) com 3 versões diferentes (README, N1 e `api-contracts.md`) | 0 | A cada entrega | Divergência nova: o dono do produto decide qual é a regra oficial antes de qualquer correção de código. |

Fonte: elaborado pelos autores (2026).

### 5.4 Recomendações ao cliente

**Quadro 12 – Recomendações ao cliente**

| Prioridade | Recomendação | Motivo (qual bug, métrica ou risco justifica) |
|---|---|---|
| 1 | **Calcular o valor a pagar só no back-end.** O `pagamento-service` deve buscar o horário de entrada no `estacionamento-service` e ignorar `valor` e `permanenciaMinutos` vindos do cliente. A saída só libera se o valor pago cobrir o valor devido. | **BUG-01 (Crítica):** um carro com 47 min de pátio saiu pagando R$ 0,01 (CT-10). É prejuízo financeiro direto, e qualquer operador com acesso à API consegue fazer isso. |
| 2 | **Trocar os repositórios em memória pelo banco SQLite** que o README já promete, com um banco por serviço. | **BUG-05 (Crítica):** um reinício apaga entradas, pagamentos e mensalistas (CT-13). Uma queda de energia no meio do expediente faria perder o caixa do dia e deixaria carros "presos" sem registro. |
| 3 | **Definir com o cliente uma única regra de tarifa e corrigir o código.** A regra do README é R$ 10,00 + R$ 5,00/h, com moto pagando metade. Para isso, a entrada precisa registrar se o veículo é carro ou moto. Depois, atualizar o README, o `api-contracts.md` e retirar a menção a caminhão, que o cliente não recebe. | **BUG-02 (Alta):** 61 min custam R$ 8,00 em vez de R$ 15,00 para carro e R$ 7,50 para moto (CT-05, CT-11). Indicadores "critérios aprovados = 66,7%" e "documentação divergente = 1 regra com 3 versões". |
| 4 | **Validar os dados no back-end, e não só na tela:** placa nos padrões `ABC1234` e `ABC1D23`; permanência numérica e maior que zero. | **BUG-04 e BUG-03 (Médias):** placa `12@` aceita (CT-04); permanência `-30` e `"abc"` viram R$ 0,00 (CT-06). |
| 5 | **Criar a suíte de testes automatizados** (Jest + Supertest), começando pelos 13 casos marcados como "automatizar" na Ficha 2, e rodar em toda alteração (GitHub Actions). Os CT-05, CT-10, CT-11 e CT-13 entram como testes de regressão dos bugs corrigidos. | Indicador "casos automatizados = 0%" e "taxa de aprovação = 53,8%". Sem testes automáticos, cada correção pode quebrar outra regra sem ninguém perceber. |

Fonte: elaborado pelos autores (2026).

<!-- QUEBRA -->

## 6 CONSIDERAÇÕES FINAIS

### 6.1 Síntese dos resultados

A Tabela 2 reúne os números das fichas.

**Tabela 2 – Síntese dos resultados**

| Indicador | Resultado |
|---|---|
| Casos de teste executados | 13 (10 planejados na Ficha 2 + 3 complementares) |
| Casos que passaram | 7 de 13 (53,8%) |
| Cobertura dos critérios de aceitação | 66,7% antes dos casos complementares e 100% depois |
| Critérios que de fato funcionam | 4 de 6 (66,7%) |
| Bugs encontrados | 5: 2 Críticos, 1 Alto e 2 Médios |
| Testes automatizados existentes no projeto | 0 |

Fonte: elaborado pelos autores (2026).

Os achados mais importantes foram:

1. **Pagar R$ 0,01 e sair (BUG-01, Crítica).** O serviço de pagamento aceita o valor que vem na requisição, em vez de calcular o valor pelo horário de entrada. Um carro com 47 minutos de pátio saiu pagando um centavo.
2. **Perda de todos os dados ao reiniciar (BUG-05, Crítica).** O README promete banco SQLite, mas o código guarda tudo em memória. Um reinício apaga entradas, pagamentos e mensalistas.
3. **Tarifa diferente da prometida (BUG-02, Alta).** O sistema cobra R$ 8,00 por hora e não diferencia carro de moto. Pela regra prometida, uma hora e um minuto de carro custaria R$ 15,00, e de moto, R$ 7,50.

O MY Parking tem uma boa base de arquitetura: microsserviços, padrões de projeto e regras separadas em classes. Mesmo assim, **ele ainda não está pronto para operar com dinheiro de verdade.** Os dois bugs críticos precisam ser corrigidos antes de qualquer uso real, e a regra de tarifa precisa ser definida com o cliente e corrigida no código.

### 6.2 Aprendizados

1. **Documentação também precisa ser testada.** A mesma regra de tarifa aparecia de três jeitos diferentes nos documentos do projeto. Antes de testar, é preciso saber qual regra vale, e quem decide isso é o cliente.
2. **Testar só pela tela esconde problemas.** A tela envia os dados certos, então pelo navegador o sistema parecia correto. O BUG-01 só apareceu chamando a API diretamente. Validação que existe só no front-end não protege o sistema.
3. **Tendemos a testar o "caso padrão".** Todos os primeiros casos usaram carro, e a moto ficou de fora. Também testamos "pagou" e "não pagou", e esquecemos o "pagamento pendente". A matriz de cobertura da Ficha 3 foi o que revelou essas lacunas.
4. **Cobertura de critérios e qualidade são coisas diferentes.** Chegamos a 100% de cobertura com apenas 66,7% dos critérios funcionando, e com bugs graves fora de qualquer critério. Cobertura mostra o que foi testado, não o que está certo.
5. **Desenvolvemos um sistema sem nenhum teste automatizado.** Ao assumir o papel de consultores do nosso próprio projeto, percebemos que cada correção feita sem testes automáticos pode quebrar outra regra sem ninguém notar. Por isso a criação da suíte automatizada está entre as recomendações.

<!-- QUEBRA -->

## REFERÊNCIAS

DIJKSTRA, Edsger W. Notes on structured programming. *In*: DAHL, Ole-Johan; DIJKSTRA, Edsger W.; HOARE, Charles Antony Richard. **Structured programming**. London: Academic Press, 1972. p. 1-82.

INTERNATIONAL SOFTWARE TESTING QUALIFICATIONS BOARD. **Certified Tester Foundation Level Syllabus**: version 4.0. [*S. l.*]: ISTQB, 2023. Disponível em: https://www.istqb.org. Acesso em: 16 nov. 2026.

ZACCHI, Marcos Vinicius da Silva; FARIAS, Yan Carlos. **MY Parking**: sistema de gestão de estacionamento. [*S. l.*]: GitHub, 2026. Repositório de código-fonte. Disponível em: https://github.com/MarcosViniciusDaSilvaZacchi/MY_SP. Acesso em: 16 nov. 2026.

<!-- QUEBRA -->

## APÊNDICE A – EVIDÊNCIAS E REPRODUÇÃO DOS TESTES

As evidências ficam na pasta `evidencias/` do repositório do trabalho. O Quadro 13 descreve os arquivos.

**Quadro 13 – Arquivos de evidência**

| Arquivo | Conteúdo |
|---|---|
| `CT-01.json` a `CT-12.json` | Para cada caso: data e hora da execução, cada requisição enviada (método, rota e corpo) e a resposta recebida (código HTTP e corpo). |
| `CT-13-antes.json` e `CT-13.json` | Dados do sistema antes e depois do reinício, que comprovam a perda de dados (BUG-05). |
| `executar-casos.js` | Script que executa os casos CT-01 a CT-10. |
| `executar-casos-ficha3.js` | Script que executa os casos CT-11 a CT-13 (com `CT-11` como segundo argumento, executa só o CT-11). |

Fonte: elaborado pelos autores (2026).

Para reproduzir os testes:

1. Clonar o projeto (`git clone https://github.com/MarcosViniciusDaSilvaZacchi/MY_SP`) e, na pasta dele, executar `node iniciar.js`. Isso instala as dependências e sobe os 7 processos.
2. Em outro terminal, na pasta do trabalho, executar `node evidencias/executar-casos.js evidencias`.
3. Para os casos complementares: parar o sistema, iniciá-lo de novo (o CT-12 precisa dos dados de exemplo no estado inicial) e executar `node evidencias/executar-casos-ficha3.js evidencias`.

Os identificadores das movimentações e os horários mudam a cada execução. Os códigos HTTP, os valores e os status devem ser os mesmos registrados nas fichas.
