# Abre o DOCX no Word, atualiza sumário, listas e campos, salva e exporta o PDF.
param([string]$Docx, [string]$Pdf)
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($Docx)
    $doc.Fields.Update() | Out-Null
    foreach ($t in $doc.TablesOfContents) { $t.Update() | Out-Null }
    foreach ($t in $doc.TablesOfFigures) { $t.Update() | Out-Null }
    # Segunda passada: os números de página do sumário mudam depois que ele é preenchido
    $doc.Repaginate()
    foreach ($t in $doc.TablesOfContents) { $t.UpdatePageNumbers() | Out-Null }
    foreach ($t in $doc.TablesOfFigures) { $t.UpdatePageNumbers() | Out-Null }
    $doc.Save()
    $doc.ExportAsFixedFormat($Pdf, 17)  # 17 = PDF
    "paginas: " + $doc.ComputeStatistics(2)
    "sumario: " + $doc.TablesOfContents.Count + " | listas: " + $doc.TablesOfFigures.Count
    $doc.Close()
} finally {
    $word.Quit()
}
