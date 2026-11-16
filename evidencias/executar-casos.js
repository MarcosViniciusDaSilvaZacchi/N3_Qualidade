// Executa os casos de teste CT-01..CT-10 contra o MY Parking pelo API Gateway
// e grava a evidência de cada um em <pasta-evidencias>/CT-XX.json
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000/api';
const OUT = process.argv[2];
let token = '';

async function chamar(metodo, rota, corpo) {
  const res = await fetch(BASE + rota, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
  let body;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

const evidencias = [];
async function ct(id, descricao, passos) {
  const registro = { id, descricao, executadoEm: new Date().toISOString(), chamadas: [] };
  const exec = async (metodo, rota, corpo) => {
    const r = await chamar(metodo, rota, corpo);
    registro.chamadas.push({ requisicao: { metodo, rota, corpo }, resposta: r });
    return r;
  };
  await passos(exec);
  fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(registro, null, 2));
  evidencias.push(registro);
  const ult = registro.chamadas[registro.chamadas.length - 1].resposta;
  console.log(`${id} | ${descricao}\n   -> HTTP ${ult.status} ${JSON.stringify(ult.body).slice(0, 300)}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const login = await chamar('POST', '/auth/login', { email: 'operador@myparking.com', senha: 'op123' });
  token = login.body.token;
  console.log('login operador:', login.status);

  let idBRA = null;

  await ct('CT-01', 'F1 entrada de carro avulso BRA2E19', async (x) => {
    const r = await x('POST', '/entradas', { placa: 'BRA2E19' });
    idBRA = r.body?.id;
  });
  await ct('CT-02', 'F1 entrada repetida BRA2E19', (x) => x('POST', '/entradas', { placa: 'BRA2E19' }));
  await ct('CT-03', 'F1 placa vazia', (x) => x('POST', '/entradas', { placa: '' }));
  await ct('CT-04', 'F1 placa em formato invalido "12@"', (x) => x('POST', '/entradas', { placa: '12@' }));
  await ct('CT-05', 'F2 tarifa carro 61 min', (x) => x('POST', '/pagamentos/calcular', { movimentacaoId: idBRA, permanenciaMinutos: 61 }));
  await ct('CT-06', 'F2 permanencia com texto "abc" e negativa', async (x) => {
    await x('POST', '/pagamentos/calcular', { movimentacaoId: idBRA, permanenciaMinutos: -30 });
    await x('POST', '/pagamentos/calcular', { movimentacaoId: idBRA, permanenciaMinutos: 'abc' });
  });
  await ct('CT-07', 'F3 dinheiro: devido 15, recebido 20', (x) =>
    x('POST', '/pagamentos', { movimentacaoId: idBRA, forma: 'DINHEIRO', valor: 15, valorPago: 20 }));
  await ct('CT-08', 'F3 dinheiro insuficiente: devido 15, recebido 10 (ABC1D23, mov 1002)', (x) =>
    x('POST', '/pagamentos', { movimentacaoId: '1002', forma: 'DINHEIRO', valor: 15, valorPago: 10 }));
  await ct('CT-09', 'F3 saida sem pagamento confirmado (ABC1D23, 45 min no patio)', async (x) => {
    await x('POST', '/saidas', { placa: 'ABC1D23', movimentacaoId: '1002' });
    await x('GET', '/movimentacoes/aberta?placa=ABC1D23');
  });
  await ct('CT-10', 'F3 pagamento com valor adulterado R$0,01 e saida (ABC1D23)', async (x) => {
    await x('GET', '/movimentacoes/aberta?placa=ABC1D23');
    await x('POST', '/pagamentos', { movimentacaoId: '1002', forma: 'DINHEIRO', valor: 0.01, valorPago: 0.01 });
    await x('POST', '/saidas', { placa: 'ABC1D23', movimentacaoId: '1002', valorCobrado: 0.01 });
  });
})().catch((e) => { console.error(e); process.exit(1); });
