// Gera o relatório final em DOCX (padrão ABNT) a partir do Markdown aprovado.
// Uso: node gerar-docx.js <relatorio.md> <saida.docx>
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, LevelFormat,
  PageOrientation, Header, PageNumber, TableOfContents, SequentialIdentifier, TableLayoutType,
} = require('docx');

const [entrada, saida] = process.argv.slice(2);
const md = fs.readFileSync(entrada, 'utf8').replace(/\r\n/g, '\n');

// ── Medidas (twips/DXA: 1 cm = 567) ─────────────────────────────────────────
const A4 = { width: 11906, height: 16838 };
const MARGENS = { top: 1701, left: 1701, bottom: 1134, right: 1134, header: 1134, footer: 709 };
const LARGURA_RETRATO = A4.width - MARGENS.left - MARGENS.right;   // 9071
const LARGURA_PAISAGEM = A4.height - MARGENS.left - MARGENS.right; // 14003
const FONTE = 'Arial';
const MONO = 'Courier New';
const LINHA_15 = 360;
const RECUO = 709; // 1,25 cm

// ── Texto com **negrito**, *itálico*, `código` e <url> ──────────────────────
const TOKEN = /(`[^`]+`)|(\*\*(?:[^*]|\*(?!\*))+?\*\*)|(\*[^*\s][^*]*?\*)|(<https?:\/\/[^>]+>)/g;
function runs(texto, base = {}) {
  const out = [];
  let ultimo = 0;
  for (const m of texto.matchAll(TOKEN)) {
    if (m.index > ultimo) out.push(new TextRun({ text: texto.slice(ultimo, m.index), ...base }));
    const t = m[0];
    if (m[1]) out.push(new TextRun({ text: t.slice(1, -1), ...base, font: MONO, size: base.size ? base.size - 2 : 22 }));
    else if (m[2]) out.push(...runs(t.slice(2, -2), { ...base, bold: true }));
    else if (m[3]) out.push(...runs(t.slice(1, -1), { ...base, italics: true }));
    else out.push(new TextRun({ text: t.slice(1, -1), ...base }));
    ultimo = m.index + t.length;
  }
  if (ultimo < texto.length) out.push(new TextRun({ text: texto.slice(ultimo), ...base }));
  return out;
}
const limpo = (t) => t.replace(/\*\*|`|\*|<|>/g, '');

// ── Construtores de parágrafo ───────────────────────────────────────────────
const corpo = (texto, extra = {}) => new Paragraph({
  children: runs(texto),
  alignment: AlignmentType.JUSTIFIED,
  indent: { firstLine: RECUO },
  spacing: { line: LINHA_15, after: 120 },
  ...extra,
});
const quebra = () => new Paragraph({ children: [new PageBreak()] });
const tituloSemNumero = (texto) => new Paragraph({
  children: [new TextRun({ text: texto, bold: true })],
  alignment: AlignmentType.CENTER,
  spacing: { line: LINHA_15, after: 360 },
});
const legenda = (tipo, titulo) => new Paragraph({
  style: 'Legenda',
  children: [
    new TextRun({ text: `${tipo} `, size: 20 }),
    new SequentialIdentifier(tipo),
    new TextRun({ text: ` – ${titulo}`, size: 20 }),
  ],
  keepNext: true,
  spacing: { before: 240, after: 80, line: 240 },
});
const fonteTabela = (texto) => new Paragraph({
  children: runs(texto, { size: 20 }),
  spacing: { before: 80, after: 240, line: 240 },
});

// ── Tabelas ─────────────────────────────────────────────────────────────────
const borda = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };
function tabela(linhas, largura) {
  const celulas = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const cab = celulas(linhas[0]);
  const dados = linhas.slice(2).map(celulas);
  dados.forEach((d, i) => { if (d.length !== cab.length) throw new Error(`Tabela com colunas desiguais (linha ${i + 1}): ${linhas[0]}`); });
  // Largura de cada coluna proporcional ao texto médio dela
  const pesos = cab.map((h, c) => {
    const media = dados.reduce((s, d) => s + limpo(d[c]).length, 0) / Math.max(1, dados.length);
    // A coluna precisa caber a maior palavra sem quebrar (ex.: "CT-01", "Funcionalidade")
    const maiorPalavra = Math.max(...[h, ...dados.map((d) => d[c])].flatMap((t) => limpo(t).split(/\s+/)).map((w) => w.length));
    return Math.min(Math.max(media, limpo(h).length * 0.6, maiorPalavra * 1.25, 7), 90);
  });
  // Largura mínima absoluta para a maior palavra (≈105 twips por caractere em 9 pt + margens),
  // e o restante dividido proporcionalmente entre as colunas que ficaram acima do mínimo
  let minimos = cab.map((h, c) => {
    // Palavras muito longas (rotas, nomes de arquivo) quebram de qualquer jeito e não entram na conta
    const maior = Math.max(1, ...[h, ...dados.map((d) => d[c])].flatMap((t) => limpo(t).split(/\s+/)).map((w) => w.length).filter((n) => n <= 16));
    return Math.min(maior * 105 + 220, largura / 3);
  });
  const somaMinimos = minimos.reduce((a, b) => a + b, 0);
  if (somaMinimos > largura * 0.85) minimos = minimos.map((m) => (m * largura * 0.85) / somaMinimos);
  const soma = pesos.reduce((a, b) => a + b, 0);
  let larguras = pesos.map((p) => (p / soma) * largura);
  for (let passo = 0; passo < 5; passo++) {
    const fixas = larguras.map((w, c) => w <= minimos[c]);
    const usadoFixo = larguras.reduce((s, w, c) => s + (fixas[c] ? minimos[c] : 0), 0);
    const pesoLivre = pesos.reduce((s, p, c) => s + (fixas[c] ? 0 : p), 0);
    larguras = larguras.map((w, c) => (fixas[c] ? minimos[c] : (pesos[c] / pesoLivre) * (largura - usadoFixo)));
  }
  larguras = larguras.map(Math.floor);
  larguras[larguras.length - 1] += largura - larguras.reduce((a, b) => a + b, 0);

  // presa = manter na mesma página que a linha seguinte (última linha + "Fonte")
  const celula = (texto, c, cabecalho, presa = false) => new TableCell({
    width: { size: larguras[c], type: WidthType.DXA },
    borders: bordas,
    shading: cabecalho ? { type: ShadingType.CLEAR, fill: 'E7E6E6', color: 'auto' } : undefined,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({
      children: runs(texto, { size: 18, ...(cabecalho ? { bold: true } : {}) }),
      spacing: { line: 240, before: 0, after: 0 },
      keepNext: presa,
    })],
  });
  return new Table({
    layout: TableLayoutType.FIXED, // larguras fixas: o Word não pode alargar além da margem
    width: { size: largura, type: WidthType.DXA },
    columnWidths: larguras,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: cab.map((h, c) => celula(h, c, true)) }),
      ...dados.map((d, r) => new TableRow({ cantSplit: true, children: d.map((t, c) => celula(t, c, false, r === dados.length - 1)) })),
    ],
  });
}

// ── Listas (cada lista numerada recomeça em 1) ──────────────────────────────
const configsNumeracao = [{
  reference: 'marcador',
  levels: [
    { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
  ],
}];
let listas = 0;
function novaListaNumerada() {
  const ref = `numerada-${++listas}`;
  configsNumeracao.push({
    reference: ref,
    levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
  });
  return ref;
}
const itemLista = (texto, ref, nivel = 0) => new Paragraph({
  children: runs(texto),
  numbering: { reference: ref, level: nivel },
  alignment: AlignmentType.JUSTIFIED,
  spacing: { line: LINHA_15, after: 80 },
});

// ── Capa e folha de rosto ───────────────────────────────────────────────────
const centro = (texto, extra = {}, run = {}) => new Paragraph({
  children: [new TextRun({ text: texto, ...run })],
  alignment: AlignmentType.CENTER,
  spacing: { line: LINHA_15, ...(extra.spacing || {}) },
  ...extra,
});
const capa = [
  centro('CENTRO UNIVERSITÁRIO CATÓLICA DE SANTA CATARINA', {}, { bold: true }),
  centro('ENGENHARIA DE SOFTWARE', {}, { bold: true }),
  centro('MARCOS VINICIUS DA SILVA ZACCHI', { spacing: { before: 2160 } }, { bold: true }),
  centro('YAN CARLOS FARIAS', {}, { bold: true }),
  centro('CONSULTORIA DE QUALIDADE SOBRE O SISTEMA MY PARKING:', { spacing: { before: 3240 } }, { bold: true }),
  centro('planejamento, execução e cobertura de testes de software'),
  centro('JOINVILLE', { spacing: { before: 4680 } }, { bold: true }),
  centro('2026', {}, { bold: true }),
];
const naturezaRecuo = { left: 4536 }; // 8 cm
const natureza = (texto, before = 0) => new Paragraph({
  children: runs(texto, { size: 22 }),
  alignment: AlignmentType.JUSTIFIED,
  indent: naturezaRecuo,
  spacing: { line: 240, before, after: 120 },
});
function folhaDeRosto() {
  const nat = md.match(/^Trabalho final apresentado.*$/m)[0];
  const prof = md.match(/^Professora: .*$/m)[0];
  const data = md.match(/^Data de entrega: .*$/m)[0];
  return [
    centro('MARCOS VINICIUS DA SILVA ZACCHI', {}, { bold: true }),
    centro('YAN CARLOS FARIAS', {}, { bold: true }),
    centro('CONSULTORIA DE QUALIDADE SOBRE O SISTEMA MY PARKING:', { spacing: { before: 3240 } }, { bold: true }),
    centro('planejamento, execução e cobertura de testes de software'),
    natureza(nat, 1440),
    natureza(prof, 240),
    natureza(data),
    centro('JOINVILLE', { spacing: { before: 3000 } }, { bold: true }),
    centro('2026', {}, { bold: true }),
  ];
}

// ── Corpo: converte o Markdown a partir do RESUMO ───────────────────────────
const PRE_TEXTUAIS = ['RESUMO', 'LISTA DE QUADROS', 'LISTA DE TABELAS', 'SUMÁRIO'];
const linhas = md.slice(md.indexOf('## RESUMO')).split('\n');

const TROCA_SECAO = [
  [/^## 1 /, 'retrato'],
  [/^### 3\.3 /, 'paisagem'], [/^#### 3\.3\.1 /, 'retrato'], // Quadro 3 (5 colunas)
  [/^## 4 /, 'paisagem'], [/^### 4\.3 /, 'retrato'],         // Quadros 6, 7 e 8
];
const secoes = [];         // { orientacao, numerada, filhos }
let atual = null;
const abrirSecao = (orientacao, numerada) => { atual = { orientacao, numerada, filhos: [] }; secoes.push(atual); };
const add = (...p) => atual.filhos.push(...p);
abrirSecao('retrato', false);
add(...folhaDeRosto(), quebra());

let i = 0;
let refNumerada = null;
let pularAteQuebra = false;
let tabelaAtual = null; // largura da próxima tabela
while (i < linhas.length) {
  const l = linhas[i];

  if (pularAteQuebra) { if (l.trim() === '<!-- QUEBRA -->') pularAteQuebra = false; else { i++; continue; } }

  // Quebras de página; as que antecedem uma troca de seção são feitas pela própria seção
  if (l.trim() === '<!-- QUEBRA -->') {
    const prox = linhas.slice(i + 1).find((x) => x.trim() !== '');
    if (!TROCA_SECAO.some(([r]) => r.test(prox || ''))) add(quebra());
    i++; continue;
  }

  // Trocas de seção: textual numerada; paisagem para a seção 4 até os quadros largos (4.1 e 4.2)
  const troca = TROCA_SECAO.find(([r]) => r.test(l));
  if (troca) abrirSecao(troca[1], true);

  let m;
  if ((m = l.match(/^## (.+)$/))) {
    const t = m[1].trim();
    if (PRE_TEXTUAIS.includes(t)) {
      add(tituloSemNumero(t));
      if (t === 'SUMÁRIO') { add(new TableOfContents('Sumário', { hyperlink: true, headingStyleRange: '1-3' })); pularAteQuebra = true; }
      if (t === 'LISTA DE QUADROS') { add(new TableOfContents('Quadros', { hyperlink: true, captionLabelIncludingNumbers: 'Quadro' })); pularAteQuebra = true; }
      if (t === 'LISTA DE TABELAS') { add(new TableOfContents('Tabelas', { hyperlink: true, captionLabelIncludingNumbers: 'Tabela' })); pularAteQuebra = true; }
    } else {
      const centralizado = /^(REFERÊNCIAS|APÊNDICE)/.test(t);
      add(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)], alignment: centralizado ? AlignmentType.CENTER : AlignmentType.LEFT }));
    }
    refNumerada = null; i++; continue;
  }
  if ((m = l.match(/^### (.+)$/))) { add(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(m[1]) })); refNumerada = null; i++; continue; }
  if ((m = l.match(/^#### (.+)$/))) { add(new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(m[1]) })); refNumerada = null; i++; continue; }

  // Legenda acima da tabela
  if ((m = l.match(/^\*\*(Quadro|Tabela) \d+ – (.+)\*\*$/))) { add(legenda(m[1], m[2])); i++; continue; }
  if (l.startsWith('Fonte: ')) { add(fonteTabela(l)); i++; continue; }

  // Tabela
  if (l.startsWith('|')) {
    const bloco = [];
    while (i < linhas.length && linhas[i].startsWith('|')) bloco.push(linhas[i++]);
    add(tabela(bloco, atual.orientacao === 'paisagem' ? LARGURA_PAISAGEM : LARGURA_RETRATO));
    continue;
  }

  // Bloco de código
  if (l.startsWith('```')) {
    i++;
    const codigo = [];
    while (i < linhas.length && !linhas[i].startsWith('```')) codigo.push(linhas[i++]);
    i++;
    codigo.forEach((c, k) => add(new Paragraph({
      children: [new TextRun({ text: c.length ? c : ' ', font: MONO, size: 16 })],
      shading: { type: ShadingType.CLEAR, fill: 'F2F2F2', color: 'auto' },
      spacing: { line: 240, before: k === 0 ? 120 : 0, after: k === codigo.length - 1 ? 200 : 0 },
      keepLines: true, keepNext: k < codigo.length - 1,
    })));
    continue;
  }

  // Listas
  if ((m = l.match(/^(\d+)\. (.+)$/))) {
    if (m[1] === '1' || !refNumerada) refNumerada = novaListaNumerada();
    add(itemLista(m[2], refNumerada)); i++; continue;
  }
  if ((m = l.match(/^- (.+)$/))) { add(itemLista(m[1], 'marcador', 0)); i++; continue; }
  if ((m = l.match(/^ {2,}- (.+)$/))) { add(itemLista(m[1], 'marcador', 1)); i++; continue; }
  if ((m = l.match(/^ {3,}(\S.*)$/))) {
    add(new Paragraph({ children: runs(m[1]), alignment: AlignmentType.JUSTIFIED, indent: { left: 720 }, spacing: { line: LINHA_15, after: 120 } }));
    i++; continue;
  }

  if (l.trim() === '') { i++; continue; }

  // Parágrafo comum (linhas seguidas viram um parágrafo só)
  const par = [l.trim()];
  while (i + 1 < linhas.length && linhas[i + 1].trim() !== '' && !/^(#|\||```|- |\d+\. | {2,}|<!--|Fonte: |\*\*(Quadro|Tabela) )/.test(linhas[i + 1])) par.push(linhas[++i].trim());
  const texto = par.join(' ');
  if (/^\*\*[^*]+\*\*$/.test(texto)) {
    add(new Paragraph({ children: runs(texto), keepNext: true, spacing: { line: LINHA_15, before: 240, after: 80 } })); // subtítulo do apêndice
  } else if (/^[A-ZÀ-Ú]+, .*\*\*.*\*\*/.test(texto) && /Acesso em|p\. \d/.test(texto)) {
    add(new Paragraph({ children: runs(texto), alignment: AlignmentType.LEFT, spacing: { line: 240, after: 240 } })); // referência (NBR 6023)
  } else if (/^\*\*Palavras-chave:\*\*/.test(texto)) {
    add(new Paragraph({ children: runs(texto), alignment: AlignmentType.JUSTIFIED, spacing: { line: LINHA_15, before: 360 } }));
  } else if (atual === secoes[0] && /^Este trabalho apresenta/.test(texto)) {
    add(new Paragraph({ children: runs(texto), alignment: AlignmentType.JUSTIFIED, spacing: { line: LINHA_15 } })); // resumo: parágrafo único sem recuo
  } else {
    add(corpo(texto));
  }
  i++;
}

// ── Documento ───────────────────────────────────────────────────────────────
const cabecalhoNumerado = () => ({
  default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })] })] }),
});
const propsPagina = (orientacao, inicio) => ({
  page: {
    size: { width: A4.width, height: A4.height, orientation: orientacao === 'paisagem' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT },
    margin: MARGENS,
    ...(inicio ? { pageNumbers: { start: inicio } } : {}),
  },
});

const doc = new Document({
  creator: 'Marcos Vinicius da Silva Zacchi; Yan Carlos Farias',
  title: 'Consultoria de qualidade sobre o sistema MY Parking',
  description: 'Relatório final N3 – Qualidade de Software',
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: FONTE, size: 24 }, paragraph: { spacing: { line: LINHA_15 } } },
      heading1: { run: { font: FONTE, size: 24, bold: true, allCaps: true, color: '000000' }, paragraph: { spacing: { before: 0, after: 360, line: LINHA_15 }, keepNext: true, keepLines: true } },
      heading2: { run: { font: FONTE, size: 24, bold: true, color: '000000' }, paragraph: { spacing: { before: 360, after: 240, line: LINHA_15 }, keepNext: true, keepLines: true } },
      heading3: { run: { font: FONTE, size: 24, italics: true, color: '000000' }, paragraph: { spacing: { before: 240, after: 200, line: LINHA_15 }, keepNext: true, keepLines: true } },
    },
    paragraphStyles: [
      { id: 'Legenda', name: 'Legenda ABNT', basedOn: 'Normal', run: { font: FONTE, size: 20 }, paragraph: { spacing: { line: 240 } } },
      { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', next: 'Normal', run: { font: FONTE, size: 24, bold: true } },
    ],
  },
  numbering: { config: configsNumeracao },
  sections: [
    { properties: propsPagina('retrato'), children: capa },
    ...secoes.map((s, k) => ({
      properties: propsPagina(s.orientacao, k === 0 ? 1 : undefined),
      headers: s.numerada ? cabecalhoNumerado() : undefined,
      children: s.filhos,
    })),
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(saida, buf);
  console.log('gerado:', saida, '| seções:', secoes.length + 1, '| listas numeradas:', listas);
});
