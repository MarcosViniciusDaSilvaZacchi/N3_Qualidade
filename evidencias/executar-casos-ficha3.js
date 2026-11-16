// Casos complementares da Ficha 3 (CT-11, CT-12, CT-13) contra o MY Parking.
// Rodar logo depois de reiniciar o sistema (node iniciar.js), para os dados de exemplo
// estarem no estado inicial. Grava a evidência em <pasta-evidencias>/CT-XX.json
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000/api';
const OUT = process.argv[2];
const SO = process.argv[3]; // opcional: "CT-11" executa só o CT-11 (não depende do estado dos dados)
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

async function ct(id, descricao, passos) {
  const registro = { id, descricao, executadoEm: new Date().toISOString(), chamadas: [] };
  const exec = async (metodo, rota, corpo) => {
    const r = await chamar(metodo, rota, corpo);
    registro.chamadas.push({ requisicao: { metodo, rota, corpo }, resposta: r });
    return r;
  };
  await passos(exec);
  fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(registro, null, 2));
  console.log(`${id} | ${descricao}`);
  for (const c of registro.chamadas) {
    const b = { ...(c.resposta.body || {}) };
    if (b.detalhes) b.detalhes = { ...b.detalhes, qrCodeSvg: undefined, pixCopiaECola: undefined };
    console.log(`   ${c.requisicao.metodo} ${c.requisicao.rota} -> HTTP ${c.resposta.status} ${JSON.stringify(b).slice(0, 260)}`);
  }
}

async function esperarGateway() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await chamar('POST', '/auth/login', { email: 'operador@myparking.com', senha: 'op123' });
      if (r.status === 200) return r.body.token;
    } catch {}
    await new Promise((ok) => setTimeout(ok, 1000));
  }
  throw new Error('Gateway nao respondeu');
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  token = await esperarGateway();

  // O estacionamento só recebe carro e moto (caminhão não entra), então só a moto é testada
  await ct('CT-11', 'F2-C2 tarifa por porte: moto com 61 min e 130 min', async (x) => {
    await x('POST', '/pagamentos/calcular', { movimentacaoId: '1002', permanenciaMinutos: 61, tipoVeiculo: 'MOTO' });
    await x('POST', '/pagamentos/calcular', { movimentacaoId: '1002', permanenciaMinutos: 130, tipoVeiculo: 'MOTO' });
  });
  if (SO === 'CT-11') return;

  await ct('CT-12', 'F3-C2 PIX pendente bloqueia a saida; depois de confirmado libera (ABC1D23)', async (x) => {
    const mov = await x('GET', '/movimentacoes/aberta?placa=ABC1D23');
    const min = mov.body.permanenciaMinutos;
    const pag = await x('POST', '/pagamentos', {
      movimentacaoId: '1002', forma: 'PIX', permanenciaMinutos: min, iniciarPix: true,
    });
    await x('POST', '/saidas', { placa: 'ABC1D23', movimentacaoId: '1002' });
    await x('POST', `/pagamentos/${pag.body.id}/confirmar`);
    await x('POST', '/saidas', { placa: 'ABC1D23', movimentacaoId: '1002' });
  });

  await ct('CT-13', 'Dados depois de reiniciar o sistema (BRA2E19 e pagamentos de CT-07/CT-10)', async (x) => {
    await x('GET', '/entradas');
    await x('GET', '/pagamentos');
  });
})().catch((e) => { console.error(e); process.exit(1); });
