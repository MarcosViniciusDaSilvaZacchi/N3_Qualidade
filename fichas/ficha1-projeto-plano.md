# Ficha 1 · Projeto e plano de testes

**Integrantes:** Marcos Vinicius da Silva Zacchi, _a definir_, _a definir_

## A. Sobre o projeto

| Item | Resposta |
|---|---|
| Nome do projeto | MY Parking (MY Service Parking) – Sistema de Gestão de Estacionamento |
| Para que serve (2 ou 3 linhas) | Controla o pátio de um estacionamento: registra a entrada e a saída de veículos, reconhece mensalistas pela placa, calcula a tarifa dos avulsos e recebe o pagamento (PIX, cartão ou dinheiro). Só libera a cancela depois que o pagamento é confirmado. Também gera relatórios em PDF e Excel. |
| Linguagem e tecnologias | JavaScript. Back-end em Node.js + Express, com 5 microsserviços (auth, estacionamento, mensalista, pagamento e vaga) atrás de um API Gateway. Front-end em Vue 3 + Vite + Pinia + Axios. Autenticação por JWT. Os repositórios usados hoje guardam os dados em memória (`InMemory*Repository`). |
| Onde está o código (link ou pasta) | <https://github.com/MarcosViniciusDaSilvaZacchi/MY_SP> |

## B. Funcionalidades escolhidas e critérios de aceitação

Formato: **Dado** … **quando** … **então** …

Regra de tarifa usada como referência: a que o **README do projeto (§4.3)** promete ao cliente. São R$ 10,00 pela 1ª hora, mais R$ 5,00 por hora ou fração excedente, com multiplicador por porte do veículo: carro 1,0× e moto 0,5×.

**Regra do cliente:** o estacionamento recebe só **carros e motos**, pela mesma entrada. Caminhão não entra. Por isso o multiplicador de caminhão (2,0×), que o README cita, ficou fora dos critérios.

### F1 – Registro de entrada de veículo

- **História:** Como operador de pátio, quero registrar a entrada de um veículo pela placa para controlar quem está no estacionamento e emitir o comprovante.
- **F1-C1:** Dado que a placa `BRA2E19` não tem nenhuma entrada aberta e não pertence a um mensalista, quando o operador registra a entrada, então o sistema cria uma movimentação com status `ABERTA` e tipo `ROTATIVO` (avulso), e mostra o comprovante com a placa e a data e hora de entrada.
- **F1-C2:** Dado que a placa `BRA2E19` já tem uma entrada aberta, quando o operador tenta registrar a entrada de novo, então o sistema recusa com a mensagem "Veículo já possui entrada aberta" e não cria uma segunda movimentação.

### F2 – Cálculo da tarifa de permanência

- **História:** Como operador de pátio, quero que o sistema calcule sozinho o valor a cobrar de um veículo avulso para não errar a cobrança nem precisar fazer a conta à mão.
- **F2-C1:** Dado que um **carro** avulso ficou no pátio, quando o operador consulta o valor de saída, então o sistema cobra R$ 10,00 pela 1ª hora e R$ 5,00 por hora ou fração excedente. Exemplos: 60 min = R$ 10,00, 61 min = R$ 15,00, 130 min = R$ 20,00.
- **F2-C2:** Dado que o veículo avulso é uma **moto**, quando o operador consulta o valor de saída, então o sistema cobra metade do valor de carro (0,5×). Exemplos: moto 61 min = R$ 7,50, moto 130 min = R$ 10,00.

### F3 – Pagamento e liberação da cancela

- **História:** Como dono do estacionamento, quero que a cancela só abra depois que o pagamento for confirmado, e que o troco em dinheiro seja calculado certo, para não perder dinheiro.
- **F3-C1:** Dado que o valor devido é R$ 15,00, quando o operador recebe R$ 20,00 em dinheiro, então o pagamento fica `CONFIRMADO` com troco de R$ 5,00. Se o valor recebido for menor que o devido, o pagamento é recusado.
- **F3-C2:** Dado que um veículo avulso tem valor a pagar e não tem pagamento confirmado (sem pagamento, ou com PIX ainda `PENDENTE`), quando o operador tenta registrar a saída, então o sistema bloqueia a saída (HTTP 402) com uma mensagem orientando a concluir o pagamento, e a movimentação continua `ABERTA`.

## C. Plano de testes por nível

| Funcionalidade | Unidade (uma função sozinha) | Integração (tela e banco, sistema e API) | Sistema (o sistema inteiro, como o usuário usa) | Aceitação (cliente confere os critérios) |
|---|---|---|---|---|
| F1 | `AvaliadorAcessoContext.avaliar()`: sem mensalista vira `ROTATIVO`; mensalista `EM_DIA` vira `MENSALISTA`; mensalista bloqueado tem a entrada negada. `Movimentacao.validar()`: placa vazia. | `estacionamento-service` consultando o `mensalista-service` por placa (`MensalistaClient`), incluindo o caso de o serviço de mensalistas estar fora do ar. Chamada `POST /entradas` pelo Gateway com token JWT. Entrada duplicada retornando 409. | No navegador: login → tela Entrada → digitar placa → conferir o comprovante e o veículo aparecendo no Dashboard. Testar placa inválida, placa vazia e placa repetida. | O cliente registra a entrada de um carro avulso e de um mensalista e confere F1-C1 e F1-C2. |
| F2 | `TarifaPadraoStrategy.calcular()` (a estratégia que está ativa) com valores de limite: 60, 61 e 130 minutos, para carro e para moto, além de valor negativo e texto no lugar de número. `Movimentacao.calcularPermanenciaMinutos()`. | `POST /pagamentos/calcular` pelo Gateway: o `estacionamento-service` envia a permanência e o `pagamento-service` devolve o valor. Conferir se o valor mostrado na tela é o mesmo que o back-end calculou. | No navegador: registrar a entrada → ir em Saída → conferir tempo e valor. Para o tempo passar, usar os veículos de exemplo que o sistema já cria com entrada antiga. | O cliente confere a tabela de exemplos de F2-C1 e F2-C2. |
| F3 | `DinheiroProcessor.processar()`: troco exato, troco zero e valor insuficiente. Validação do cartão (Luhn) e geração do payload PIX. `EstacionamentoService.registrarSaida()` com o `PagamentoClient` simulado (mock). | `estacionamento-service` ↔ `pagamento-service`: a saída consulta `GET /pagamentos/movimentacao/:id` e só libera com `CONFIRMADO`. PIX `PENDENTE` → confirmar → saída liberada. | Fluxo completo no navegador: entrada → saída → pagar em dinheiro, cartão e PIX → cancela liberada → recibo em PDF. Tentar sair sem pagar. | O cliente faz uma saída paga em dinheiro e uma sem pagamento, e confere F3-C1 e F3-C2. |

### Ambiente, ferramentas e escopo dos testes

| Item | Definição |
|---|---|
| Ambiente | Notebook Windows 10 com Node.js 23. Sistema iniciado localmente com `node iniciar.js` (5 microsserviços + Gateway + front-end), com os dados de exemplo que o próprio sistema cria ao iniciar. |
| Ferramentas | Navegador para os testes de sistema. Script Node.js (`fetch`) chamando o API Gateway para os testes de integração e as evidências em JSON. Leitura do código-fonte para localizar a causa dos bugs. |
| Usuário de teste | `operador@myparking.com` (perfil Operador), que é o usuário do dia a dia. O Admin fica para os relatórios. |
| Dentro do escopo | Entrada, cálculo de tarifa, pagamento (dinheiro e PIX) e liberação da cancela. |
| Fora do escopo | Relatórios PDF/Excel, gestão de vagas, cadastro de mensalistas e de usuários, desempenho e carga. Esses itens ficam como sugestão para uma próxima rodada. |
| Critério para dar a rodada por encerrada | Todos os critérios de aceitação com pelo menos um caso executado, e todo caso que falhar com um bug registrado. |

**Observação sobre "tela e banco":** hoje os serviços usam repositórios em memória. O README fala em SQLite, mas o código não usa. Por isso o teste de integração com banco de dados não se aplica nesta versão. No lugar dele, testamos a integração entre os microsserviços. Fica registrado como risco: ao reiniciar os serviços, todos os dados se perdem.

### Qual funcionalidade é a mais arriscada? Por quê?

**F3 – Pagamento e liberação da cancela.** Ela envolve dinheiro e depende de três serviços conversando entre si (estacionamento, pagamento e Gateway). Uma falha nela gera prejuízo direto: um carro sai sem pagar ou é cobrado errado. Ela também depende do valor calculado em F2, então qualquer erro de tarifa passa direto para o caixa.

A **F2** vem logo atrás porque a regra de tarifa não está clara nos documentos do próprio projeto. Cada fonte diz uma coisa:

| Fonte | O que diz |
|---|---|
| README §4.3 (regra adotada nos critérios) | R$ 10,00 na 1ª hora + R$ 5,00 por hora ou fração adicional, com multiplicador por porte (moto 0,5×). O README também cita caminhão (2,0×) e vagas de caminhão, que o cliente não usa. |
| Entrega N1 (RN-06) e código ativo (`TarifaPadraoStrategy`) | R$ 8,00 por hora ou fração, 10 min de carência, sem porte. O sistema nem registra o porte na entrada. |
| `docs/api-contracts.md` | exemplo de 150 min = R$ 25,00, valor que nenhuma das duas regras produz |

Como o cliente recebeu a promessa do README, a cobrança feita pelo código é tratada como **bug de gravidade Alta** (resultado errado) na Ficha 2.
