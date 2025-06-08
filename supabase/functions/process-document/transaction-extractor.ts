
interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export function extractTransactionsFromText(text: string, documentType: string): TransactionData[] {
  console.log('Extracting transactions from text, length:', text.length)
  
  if (documentType === 'receipt') {
    return extractFromReceipt(text)
  } else {
    return extractFromBankStatement(text)
  }
}

function extractFromReceipt(text: string): TransactionData[] {
  const transactions: TransactionData[] = []
  
  try {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    let totalAmount = 0
    let establishment = 'Compra'
    let date = new Date().toISOString().split('T')[0]
    
    for (const line of lines) {
      // Buscar estabelecimento (primeira linha com texto relevante)
      if (!establishment || establishment === 'Compra') {
        if (line.length > 5 && line.length < 50 && 
            !/\d{2}\/\d{2}\/\d{4}/.test(line) &&
            !/total|valor|cnpj/i.test(line) &&
            /[a-zA-Z]/.test(line)) {
          establishment = line.trim()
        }
      }
      
      // Buscar data
      const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      // Buscar valor total
      const valuePatterns = [
        /(?:total|valor|vlr|soma).*?(\d{1,6}[,.]\d{2})/i,
        /R\$\s*(\d{1,6}[,.]\d{2})/i,
        /(\d{1,6}[,.]\d{2})(?:\s*$)/
      ]
      
      for (const regex of valuePatterns) {
        const match = line.match(regex)
        if (match) {
          const value = parseMonetaryValue(match[1])
          if (value > totalAmount && value < 50000) {
            totalAmount = value
          }
        }
      }
    }
    
    if (totalAmount > 0) {
      transactions.push({
        type: 'expense',
        amount: totalAmount,
        description: `Compra - ${establishment}`,
        date: date
      })
      console.log(`Receipt processed: ${establishment}, R$ ${totalAmount}, ${date}`)
    }
    
  } catch (error) {
    console.error('Error processing receipt:', error)
  }
  
  return transactions
}

function extractFromBankStatement(text: string): TransactionData[] {
  const transactions: TransactionData[] = []
  
  try {
    // Primeiro tentar CSV
    if (text.includes(',') || text.includes(';')) {
      const csvTransactions = parseCSVFormat(text)
      if (csvTransactions.length > 0) {
        console.log(`Found ${csvTransactions.length} transactions in CSV format`)
        return csvTransactions
      }
    }
    
    // Processar como extrato textual
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    
    for (const line of lines) {
      console.log('Processing line:', line.substring(0, 100))
      
      const extractedTransactions = extractTransactionFromLine(line)
      transactions.push(...extractedTransactions)
    }
    
  } catch (error) {
    console.error('Error processing bank statement:', error)
  }
  
  return transactions
}

function extractTransactionFromLine(line: string): TransactionData[] {
  const transactions: TransactionData[] = []
  
  // Padrões melhorados para extratos brasileiros
  const patterns = [
    // Padrão 1: Data Descrição Valor
    /(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+([-+]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})\s*$/,
    // Padrão 2: Descrição com palavra-chave e valor
    /(PIX|TED|DOC|COMPRA|PAGAMENTO|SAQUE|DEPOSITO|CREDITO|DEBITO|TRANSFERENCIA).+?([-+]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})/i,
    // Padrão 3: Data no meio da linha
    /(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+([-+]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})/,
    // Padrão 4: Múltiplos valores na linha (pegar o último)
    /(.+?)\s+([-+]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})\s+([-+]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})$/
  ]
  
  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (match) {
      const transaction = processPatternMatch(match, pattern, line)
      if (transaction) {
        transactions.push(transaction)
        console.log(`Extracted: ${transaction.description}, ${transaction.type === 'income' ? '+' : '-'}R$ ${transaction.amount}, ${transaction.date}`)
        break
      }
    }
  }
  
  return transactions
}

function processPatternMatch(match: RegExpMatchArray, pattern: RegExp, originalLine: string): TransactionData | null {
  try {
    let dateStr = ''
    let description = ''
    let amountStr = ''
    
    if (pattern.source.includes('PIX|TED')) {
      // Padrão 2: palavra-chave + valor
      description = match[1]
      amountStr = match[2]
      dateStr = extractDateFromLine(originalLine) || new Date().toLocaleDateString('pt-BR')
    } else if (match.length === 4) {
      // Padrão 1: Data Descrição Valor
      dateStr = match[1]
      description = match[2]
      amountStr = match[3]
    } else if (match.length === 5) {
      // Padrão 3: Desc Data Desc Valor
      description = `${match[1]} ${match[3]}`.trim()
      dateStr = match[2]
      amountStr = match[4]
    }
    
    // Validar dados extraídos
    const amount = parseMonetaryValue(amountStr)
    if (amount === 0) return null
    
    const date = convertDateFormat(dateStr)
    if (!description || description.length < 3) return null
    
    // Determinar tipo da transação
    const isCredit = determineTransactionType(amountStr, description)
    
    return {
      type: isCredit ? 'income' : 'expense',
      amount: amount,
      description: description.trim().substring(0, 100),
      date: date
    }
    
  } catch (error) {
    console.error('Error processing pattern match:', error)
    return null
  }
}

function parseCSVFormat(text: string): TransactionData[] {
  const transactions: TransactionData[] = []
  const lines = text.split('\n')
  
  // Detectar separador
  let separator = ','
  const firstDataLine = lines.find(line => line.includes(',') || line.includes(';'))
  if (firstDataLine && firstDataLine.split(';').length > firstDataLine.split(',').length) {
    separator = ';'
  }
  
  console.log(`Processing CSV with ${lines.length} lines, separator: "${separator}"`)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || (line.toLowerCase().includes('data') && i < 3)) continue
    
    const columns = line.split(separator).map(col => col.trim().replace(/['"]/g, ''))
    
    if (columns.length >= 3) {
      const transaction = extractFromCSVColumns(columns)
      if (transaction) {
        transactions.push(transaction)
        console.log(`CSV transaction: ${transaction.description}, ${transaction.type === 'income' ? '+' : '-'}R$ ${transaction.amount}`)
      }
    }
  }
  
  return transactions
}

function extractFromCSVColumns(columns: string[]): TransactionData | null {
  try {
    let date = '', description = '', amountStr = ''
    
    // Identificar colunas por conteúdo
    for (const col of columns) {
      if (!date && /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(col)) {
        date = col
      } else if (!amountStr && /[-+]?\d{1,3}(?:[.,]\d{3})*[,]\d{2}/.test(col)) {
        amountStr = col
      } else if (!description && col.length > 3 && !/^\d+[,.]\d{2}$/.test(col)) {
        description = col
      }
    }
    
    // Fallback para posições fixas
    if (!date && columns[0]) date = columns[0]
    if (!description && columns[1]) description = columns[1]
    if (!amountStr && columns[2]) amountStr = columns[2]
    
    const amount = parseMonetaryValue(amountStr)
    if (!date || !description || amount === 0) return null
    
    const convertedDate = convertDateFormat(date)
    const isCredit = determineTransactionType(amountStr, description)
    
    return {
      type: isCredit ? 'income' : 'expense',
      amount: amount,
      description: description,
      date: convertedDate
    }
    
  } catch (error) {
    console.error('Error parsing CSV columns:', error)
    return null
  }
}

function parseMonetaryValue(amountStr: string): number {
  try {
    if (!amountStr) return 0
    
    let cleanAmount = amountStr.replace(/[^\d,.+-]/g, '').trim()
    
    // Remover sinais
    const isNegative = cleanAmount.includes('-')
    cleanAmount = cleanAmount.replace(/[+-]/g, '')
    
    // Tratar formatos brasileiros
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // 1.234,56
      const parts = cleanAmount.split(',')
      if (parts.length === 2 && parts[1].length === 2) {
        cleanAmount = parts[0].replace(/\./g, '') + '.' + parts[1]
      }
    } else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
      // 1234,56
      cleanAmount = cleanAmount.replace(',', '.')
    } else if (cleanAmount.includes('.')) {
      // 1234.56 ou 1.234
      const parts = cleanAmount.split('.')
      if (parts.length === 2 && parts[1].length !== 2) {
        // É separador de milhares
        cleanAmount = cleanAmount.replace(/\./g, '')
      }
    }
    
    const amount = Math.abs(parseFloat(cleanAmount))
    return isNaN(amount) ? 0 : amount
    
  } catch (error) {
    console.error('Error parsing amount:', amountStr, error)
    return 0
  }
}

function determineTransactionType(amountStr: string, description: string): boolean {
  return (
    amountStr.includes('+') || 
    (!amountStr.includes('-') && (
      /recebido|deposito|credito|salario|renda|pix\s+recebido/i.test(description)
    ))
  )
}

function extractDateFromLine(line: string): string | null {
  const match = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  return match ? `${match[1]}/${match[2]}/${match[3]}` : null
}

function convertDateFormat(dateStr: string): string {
  try {
    const match = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
    if (match) {
      let [, day, month, year] = match
      if (year.length === 2) {
        year = parseInt(year) > 50 ? '19' + year : '20' + year
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  } catch (error) {
    console.error('Date conversion error:', error)
  }
  return new Date().toISOString().split('T')[0]
}
