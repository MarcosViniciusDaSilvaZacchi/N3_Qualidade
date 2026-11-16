# Ficha 3 · Cobertura de testes e recomendações à cliente

## A. Cobertura dos critérios de aceitação

Um caso só conta se os dados de entrada e o resultado esperado correspondem ao que o critério descreve.
Cobertura = critérios cobertos ÷ total de critérios × 100. Para cada critério não coberto, criar CT-11, CT-12… no formato da Ficha 2 e executar.

| Critério | Casos de teste que o verificam | Coberto? | Novo caso (se não coberto) | Resultado do novo caso |
|---|---|---|---|---|
| F1-C1 – entrada de carro avulso | CT-01 | Sim | — | — |
| F1-C2 – entrada repetida recusada | CT-02 | Sim | — | — |
| F2-C1 – tarifa de carro (R$ 10,00 + R$ 5,00/h) | CT-05 | Sim | — | — |
| F2-C2 – tarifa de moto (0,5×) | nenhum. Todos os casos da Ficha 2 usaram carro. | **Não** | CT-11: moto com 61 e 130 min | **Falhou.** Cobrou R$ 8,00 e R$ 16,00 em vez de R$ 7,50 e R$ 10,00 (BUG-02) |
| F3-C1 – troco em dinheiro | CT-07 (troco de R$ 5,00) e CT-08 (valor insuficiente) | Sim | — | — |
| F3-C2 – saída bloqueada sem pagamento confirmado | CT-09 cobre só "sem pagamento". O caso "PIX ainda `PENDENTE`", que está escrito no critério, não foi testado. | **Não** (parcial) | CT-12: PIX pendente → saída → confirmar → saída | **Passou.** HTTP 402 com o PIX pendente e HTTP 200 depois da confirmação |

Os casos CT-11 e CT-12 estão completos, no formato da Ficha 2, na seção "Casos complementares" da [Ficha 2](ficha2-casos-bugs.md). As evidências estão em `evidencias/CT-11.json` e `evidencias/CT-12.json`.

| Resumo | Valor |
|---|---|
| Critérios cobertos / total de critérios | Antes: 4 / 6. Depois: 6 / 6 |
| Cobertura antes dos novos casos (%) | 4 ÷ 6 × 100 = **66,7%** |
| Cobertura depois dos novos casos (%) | 6 ÷ 6 × 100 = **100%** |
| Critérios **aprovados**, ou seja, cobertos e passando (informativo) | 4 / 6 = **66,7%**. F2-C1 e F2-C2 falham por causa do BUG-02. |

Cobertura alta não quer dizer sistema aprovado. Todos os critérios estão testados, mas um terço deles falha.

## B. Reflexão

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
   - **Cobertura de critérios não é cobertura de código.** Os critérios dizem o que a cliente pediu, não quais linhas foram executadas. Nada testou a validação de cartão (algoritmo de Luhn), os relatórios em PDF e Excel, a gestão de vagas, os mensalistas ou o login. Medir a cobertura de código exige uma ferramenta própria (por exemplo, `jest --coverage` ou `c8`), que mostra quais linhas e desvios (`if`/`else`) foram executados. E mesmo 100% de linhas executadas não garante que os resultados foram conferidos.

## C. Painel de qualidade

4 a 6 indicadores, usando os números das Fichas 2 e 3 como valor atual.

| Indicador | Valor atual | Meta | Com que frequência medir | Alerta: o que fazer se piorar |
|---|---|---|---|---|
| Cobertura dos critérios de aceitação (critérios com caso de teste ÷ total) | 100% (6/6). Era 66,7% antes do CT-11 e do CT-12. | 100% | A cada nova funcionalidade ou alteração de critério | Abaixo de 100%: a funcionalidade não é entregue até ganhar os casos que faltam. |
| Taxa de aprovação dos casos de teste (casos que passaram ÷ executados) | 53,8% (7/13) | ≥ 95% antes de cada entrega à cliente | A cada versão (a cada merge na `main`) | Abaixo de 95%: bloquear a entrega e fazer a triagem dos casos que falharam no mesmo dia. |
| Bugs abertos de gravidade Crítica ou Alta | 3 (BUG-01, BUG-05 Críticos e BUG-02 Alto) | 0 | Semanal, e sempre que surgir um bug novo | Qualquer Crítico novo para o desenvolvimento das outras tarefas até ser corrigido. Alto sem correção em 1 semana vira assunto da reunião com a cliente. |
| Critérios de aceitação aprovados (cobertos e passando ÷ total) | 66,7% (4/6) | 100% | A cada entrega | Abaixo de 100%: avisar a cliente quais regras ainda não funcionam antes da entrega, sem esconder. |
| Casos de teste automatizados no repositório do projeto | 0% (0 de 13; nenhum serviço tem script `test`) | ≥ 70% até a próxima entrega e 100% dos casos de regras de dinheiro (F2 e F3) | Semanal | Se o número parar de subir: nenhum pull request entra sem teste automatizado da parte alterada. |
| Regras de negócio com documentação divergente do código | 1 regra (tarifa) com 3 versões diferentes (README, N1 e `api-contracts.md`) | 0 | A cada entrega | Divergência nova: o dono do produto decide qual é a regra oficial antes de qualquer correção de código. |

## D. Recomendações à cliente

| Prioridade | Recomendação | Motivo (qual bug, métrica ou risco justifica) |
|---|---|---|
| 1 | **Calcular o valor a pagar só no back-end.** O `pagamento-service` deve buscar o horário de entrada no `estacionamento-service` e ignorar `valor` e `permanenciaMinutos` vindos do cliente. A saída só libera se o valor pago cobrir o valor devido. | **BUG-01 (Crítica):** um carro com 47 min de pátio saiu pagando R$ 0,01 (CT-10). É prejuízo financeiro direto, e qualquer operador com acesso à API consegue fazer isso. |
| 2 | **Trocar os repositórios em memória pelo banco SQLite** que o README já promete, com um banco por serviço. | **BUG-05 (Crítica):** um reinício apaga entradas, pagamentos e mensalistas (CT-13). Uma queda de energia no meio do expediente faria perder o caixa do dia e deixaria carros "presos" sem registro. |
| 3 | **Definir com a cliente uma única regra de tarifa e corrigir o código.** A regra do README é R$ 10,00 + R$ 5,00/h, com moto pagando metade. Para isso, a entrada precisa registrar se o veículo é carro ou moto. Depois, atualizar o README, o `api-contracts.md` e retirar a menção a caminhão, que a cliente não recebe. | **BUG-02 (Alta):** 61 min custam R$ 8,00 em vez de R$ 15,00 para carro e R$ 7,50 para moto (CT-05, CT-11). Indicadores "critérios aprovados = 66,7%" e "documentação divergente = 1 regra com 3 versões". |
| 4 | **Validar os dados no back-end, e não só na tela:** placa nos padrões `ABC1234` e `ABC1D23`; permanência numérica e maior que zero. | **BUG-04 e BUG-03 (Médias):** placa `12@` aceita (CT-04); permanência `-30` e `"abc"` viram R$ 0,00 (CT-06). |
| 5 | **Criar a suíte de testes automatizados** (Jest + Supertest), começando pelos 13 casos marcados como "automatizar" na Ficha 2, e rodar em toda alteração (GitHub Actions). Os CT-05, CT-10, CT-11 e CT-13 entram como testes de regressão dos bugs corrigidos. | Indicador "casos automatizados = 0%" e "taxa de aprovação = 53,8%". Sem testes automáticos, cada correção pode quebrar outra regra sem ninguém perceber. |
