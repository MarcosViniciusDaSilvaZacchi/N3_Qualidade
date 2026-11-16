# Trabalho Final N3 – Qualidade de Software

**Módulo 3:** Testes de Software e Métricas

Consultoria de qualidade sobre um projeto desenvolvido pelo grupo em outra disciplina:
planejamento e execução de testes, cobertura dos critérios de aceitação e painel de qualidade.

## Integrantes

- Marcos Vinicius da Silva Zacchi
- Yan Carlos Farias

## Projeto analisado

| Item | Resposta |
|---|---|
| Nome do projeto | MY Parking (MY Service Parking) – Sistema de Gestão de Estacionamento |
| Disciplina de origem | Projeto e Arquitetura de Software |
| Código-fonte | <https://github.com/MarcosViniciusDaSilvaZacchi/MY_SP> |

## Estrutura

| Pasta/arquivo | Conteúdo | Encontro |
|---|---|---|
| [fichas/ficha1-projeto-plano.md](fichas/ficha1-projeto-plano.md) | Projeto, funcionalidades, critérios de aceitação e plano de testes | 1 |
| [fichas/ficha2-casos-bugs.md](fichas/ficha2-casos-bugs.md) | 13 casos de teste executados, registro de 5 bugs, manual × automatizado | 2 |
| [fichas/ficha3-cobertura-painel.md](fichas/ficha3-cobertura-painel.md) | Cobertura dos critérios, reflexão, painel de qualidade, recomendações | 3 |
| [evidencias/](evidencias/) | Registro de cada caso de teste (`CT-XX.json`, com requisição e resposta) e os scripts que os executam | 2–3 |
| [gerador-relatorio/](gerador-relatorio/) | Scripts que geram o DOCX e o PDF a partir do Markdown do relatório | — |

## Entrega

A entrega é o relatório final, um único arquivo com o relatório de explicação e as três fichas, no padrão ABNT. Não há apresentação com slides.

| Arquivo | Uso |
|---|---|
| [Relatorio_Final_N3_Qualidade.pdf](Relatorio_Final_N3_Qualidade.pdf) | Versão para entrega |
| [Relatorio_Final_N3_Qualidade.docx](Relatorio_Final_N3_Qualidade.docx) | Versão editável (Word) |
| [Relatorio_Final_N3_Qualidade.md](Relatorio_Final_N3_Qualidade.md) | Texto-fonte, de onde o DOCX e o PDF são gerados |

Para gerar de novo depois de alterar o Markdown (precisa de Node.js e do Microsoft Word):

```powershell
cd gerador-relatorio
npm install
node gerar-docx.js ..Relatorio_Final_N3_Qualidade.md ..Relatorio_Final_N3_Qualidade.docx
.inalizar-word.ps1 -Docx (Resolve-Path ..Relatorio_Final_N3_Qualidade.docx) -Pdf "$PWD..Relatorio_Final_N3_Qualidade.pdf"
```

O segundo script abre o DOCX no Word, atualiza o sumário e as listas de quadros e tabelas e exporta o PDF.
