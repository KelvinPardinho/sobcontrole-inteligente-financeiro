
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    console.log('PDF file size:', uint8Array.length)
    
    let text = ''
    
    try {
      // Método 1: UTF-8
      text = new TextDecoder('utf-8').decode(uint8Array)
      console.log('UTF-8 decode successful, length:', text.length)
    } catch {
      try {
        // Método 2: ISO-8859-1 (Latin-1)
        text = new TextDecoder('iso-8859-1').decode(uint8Array)
        console.log('ISO-8859-1 decode successful, length:', text.length)
      } catch {
        // Método 3: Windows-1252
        try {
          text = new TextDecoder('windows-1252').decode(uint8Array)
          console.log('Windows-1252 decode successful, length:', text.length)
        } catch {
          // Método 4: Byte por byte com filtro
          text = Array.from(uint8Array)
            .map(byte => (byte >= 32 && byte <= 126) || byte >= 128 ? String.fromCharCode(byte) : ' ')
            .join('')
          console.log('Byte-by-byte decode successful, length:', text.length)
        }
      }
    }
    
    // Limpar e extrair texto útil
    const cleanedText = cleanPDFText(text)
    console.log('Cleaned text length:', cleanedText.length)
    console.log('First 500 chars:', cleanedText.substring(0, 500))
    
    return cleanedText
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Erro ao processar arquivo PDF')
  }
}

function cleanPDFText(text: string): string {
  // Dividir em linhas e limpar
  const lines = text.split(/[\r\n]+/)
  const cleanedLines: string[] = []
  
  for (const line of lines) {
    // Remover caracteres de controle mantendo acentos
    const cleanLine = line
      .replace(/[^\x20-\x7E\u00C0-\u017F\u0100-\u024F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Filtrar linhas muito curtas ou inúteis
    if (cleanLine.length < 5) continue
    if (/^[\/\\<>(){}[\]]+$/.test(cleanLine)) continue
    if (/^(obj|endobj|stream|endstream|xref|startxref)$/i.test(cleanLine)) continue
    
    // Buscar linhas que parecem transações
    if (containsTransactionData(cleanLine)) {
      cleanedLines.push(cleanLine)
      console.log('Found potential transaction line:', cleanLine)
    }
  }
  
  return cleanedLines.join('\n')
}

function containsTransactionData(line: string): boolean {
  return (
    // Data no formato brasileiro
    /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line) ||
    // Palavras-chave de transações
    /(PIX|TED|DOC|DÉBITO|CREDITO|COMPRA|PAGAMENTO|SAQUE|DEPÓSITO|TRANSFERENCIA|SALARIO|RENDA)/i.test(line) ||
    // Valores monetários
    /R\$\s*\d+[,.]\d{2}/.test(line) ||
    // Padrões de valor brasileiro
    /\d{1,3}(?:[.,]\d{3})*[,.]\d{2}/.test(line) ||
    // Estabelecimentos
    /(SUPERMERCADO|FARMACIA|POSTO|LOJA|MERCADO|PADARIA|RESTAURANTE|LTDA|S\.A\.|EIRELI)/i.test(line) ||
    // Bancos e instituições
    /(BANCO|CAIXA|BRADESCO|ITAU|SANTANDER|BB|CEF)/i.test(line)
  )
}
