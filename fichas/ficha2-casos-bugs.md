# Ficha 2 · Casos de teste e bugs

## A. Casos de teste

Incluir caminho feliz **e** erros/limites: campo vazio, valor negativo, texto no lugar de número, valor exatamente no limite.

**Como foi executado (16/11/2026):** o sistema foi iniciado com `node iniciar.js`, e os casos foram chamados pelo API Gateway (`http://localhost:3000/api`), logado como `operador@myparking.com`. O script está em [evidencias/executar-casos.js](../evidencias/executar-casos.js). A requisição e a resposta completas de cada caso estão em `evidencias/CT-XX.json`. O veículo `ABC1D23` (movimentação `1002`, com entrada 45 min antes do início do sistema) vem nos dados de exemplo do próprio sistema. Por isso dá para testar a saída sem esperar o tempo passar.

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

**Resumo da execução:** 10 casos executados, 6 passaram e 4 falharam (taxa de aprovação de 60%).

### Casos complementares (criados na Ficha 3)

Os casos CT-11 e CT-12 foram criados para os critérios que ficaram sem cobertura na análise da Ficha 3. O CT-13 foi um teste exploratório sobre o risco de perda de dados apontado na Ficha 1. Os três foram executados depois de reiniciar o sistema, com o script [evidencias/executar-casos-ficha3.js](../evidencias/executar-casos-ficha3.js).

| ID | Funcionalidade | Pré-condição | Passos | Dados de entrada | Resultado esperado | Resultado obtido | Passou? |
|---|---|---|---|---|---|---|---|
| CT-11 | F2 – Tarifa de moto | Operador logado. Caminhão não é testado porque a cliente não recebe caminhões. | Enviar `POST /pagamentos/calcular` duas vezes, informando `tipoVeiculo` = `MOTO`. | moto, permanência = 61 min e permanência = 130 min | 61 min: R$ 7,50 (0,5 × R$ 15,00). 130 min: R$ 10,00 (0,5 × R$ 20,00). | **R$ 8,00 e R$ 16,00, os mesmos valores de um carro.** O porte é ignorado, e a entrada (`POST /entradas`) nem tem campo para dizer se é carro ou moto. | **Não** |
| CT-12 | F3 – PIX pendente | Sistema recém-iniciado. `ABC1D23` (mov. 1002) há 45 min no pátio, sem pagamento. | 1. Gerar a cobrança PIX (`iniciarPix: true`). 2. Tentar a saída. 3. Confirmar o PIX. 4. Tentar a saída de novo. | mov. = `1002`, forma = `PIX` | Passo 2: HTTP 402, pedindo a confirmação do PIX. Passo 4: HTTP 200, saída `FINALIZADA`. | Passo 1: PIX `PENDENTE`. Passo 2: HTTP 402, "Para liberar a saída, confirme primeiro o recebimento do pagamento PIX". Passo 4: HTTP 200, `FINALIZADA`. Obs.: o valor cobrado foi R$ 8,00 em vez de R$ 10,00 (BUG-02). | Sim |
| CT-13 | Todas – Persistência | CT-01 a CT-10 executados (entrada `BRA2E19`, placa `12@` e pagamentos de CT-07 e CT-10 gravados). Retrato dos dados guardado em `CT-13-antes.json`. | 1. Parar todos os serviços. 2. Iniciar de novo (`node iniciar.js`). 3. Listar entradas e pagamentos. | — | Os registros feitos antes do reinício continuam lá. O README diz que cada serviço grava em SQLite. | **Todos os registros sumiram.** Só restaram os dados de exemplo que o sistema cria ao iniciar (3 veículos e 1 pagamento), além do pagamento do CT-12, feito depois do reinício. | **Não** |

**Resumo geral (CT-01 a CT-13):** 13 casos executados, 7 passaram e 6 falharam (taxa de aprovação de 53,8%).

## B. Registro de bugs

Gravidade: **Crítica** (impede o uso ou perde dados) · **Alta** (resultado errado) · **Média** (funciona, mas com problema) · **Baixa** (detalhe visual ou de texto).

| ID | Caso de teste | O que aconteceu | O que deveria acontecer | Como reproduzir | Gravidade |
|---|---|---|---|---|---|
| BUG-01 | CT-10 | O `pagamento-service` confia na permanência e no valor que chegam na requisição. Ele não consulta o horário de entrada real no `estacionamento-service`. Se a requisição não traz a permanência (ou traz 10 min ou menos), o motor de tarifa dá R$ 0 e o serviço passa a usar o campo `valor` enviado pelo cliente (`PagamentoService.js`, linhas 63–65). Na saída, o `estacionamento-service` só confere se existe um pagamento `CONFIRMADO`, não o valor dele. Resultado: um carro com 47 min de pátio saiu pagando R$ 0,01. A tela normal envia os dados certos, mas qualquer chamada direta à API consegue fazer isso, com um token de operador e uma ferramenta como Postman ou `curl`. | O valor devido deve ser calculado no back-end, a partir do horário de entrada guardado pelo `estacionamento-service`, sem aceitar valor ou permanência vindos do cliente. A saída só pode ser liberada se o valor pago cobrir o valor devido. | Logado, enviar `POST /api/pagamentos` com `{movimentacaoId:"1002", forma:"DINHEIRO", valor:0.01, valorPago:0.01}` → `CONFIRMADO`. Depois, `POST /api/saidas` com `{movimentacaoId:"1002"}` → HTTP 200, `FINALIZADA`. | **Crítica** (o estacionamento perde dinheiro, e qualquer operador consegue fazer isso) |
| BUG-02 | CT-05, CT-11, CT-12 | A tarifa ativa é a `TarifaPadraoStrategy`: R$ 8,00 por hora com 10 min de carência, e o porte do veículo é ignorado. 61 min custam R$ 8,00 tanto para carro quanto para moto. A entrada nem registra se o veículo é carro ou moto. A própria documentação do projeto traz três regras diferentes (README, entrega N1 e `docs/api-contracts.md`). | Seguir a regra prometida no README §4.3: R$ 10,00 na 1ª hora + R$ 5,00 por hora ou fração, e moto pagando metade. Exemplos: carro 61 min = R$ 15,00, moto 61 min = R$ 7,50. | `POST /api/pagamentos/calcular` com `{permanenciaMinutos:61}` → `valorCalculado: 8`. Com `tipoVeiculo:"MOTO"`, também `8`. | **Alta** |
| BUG-03 | CT-06 | Permanência negativa (`-30`) ou em texto (`"abc"`) é aceita e devolve R$ 0,00 como se estivesse dentro da carência. | Recusar com HTTP 400 e avisar que a permanência é inválida. | `POST /api/pagamentos/calcular` com `{permanenciaMinutos:"abc"}` → HTTP 200, `valorCalculado: 0`. | Média |
| BUG-04 | CT-04 | O back-end aceita qualquer placa. A placa `12@` foi registrada com entrada aberta. A tela só confere se a placa tem 7 caracteres (`EntradaView.vue`, linha 50), então até `1234567` passa. | Validar no back-end os padrões `ABC1234` e `ABC1D23`, como o README promete. | `POST /api/entradas` com `{placa:"12@"}` → HTTP 201. | Média |
| BUG-05 | CT-13 | Todos os dados se perdem quando os serviços são reiniciados: entradas, saídas, pagamentos, mensalistas, vagas e operadores cadastrados. Os cinco microsserviços usam `InMemory*Repository`, por exemplo `estacionamento-service/src/routes/index.js`, linha 13. O README promete SQLite com um banco por serviço. | Gravar os dados em um banco (o SQLite prometido) para que sobrevivam a um reinício, uma queda de energia ou uma atualização. | 1. Registrar uma entrada. 2. Parar e iniciar o sistema. 3. `GET /api/entradas` → a entrada não existe mais (compare `CT-13-antes.json` com `CT-13.json`). | **Crítica** (perda de dados, inclusive do histórico financeiro) |

**Resumo dos bugs:** 5 abertos. São 2 Críticos (BUG-01 e BUG-05), 1 Alto (BUG-02) e 2 Médios (BUG-03 e BUG-04).

## C. Manual ou automatizado?

Perguntas-guia: vai ser repetido muitas vezes? O resultado é fácil de conferir por um programa? Depende da opinião de uma pessoa?

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

**Conclusão:** os 13 casos devem ser automatizados. Em 11 deles a automação é completa. No CT-07 e no CT-12 só a regra é automatizada, e a conferência visual do recibo e do QR Code continua manual. Hoje o projeto não tem nenhum teste automatizado (nenhum `package.json` tem script `test`). Os scripts `evidencias/executar-casos*.js` deste trabalho são um primeiro passo, mas ainda dependem de o sistema estar rodando e não conferem os resultados sozinhos.
