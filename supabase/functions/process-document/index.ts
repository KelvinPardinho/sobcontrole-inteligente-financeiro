import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      throw new Error('Não autorizado')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('type') as string

    if (!file) {
      throw new Error('Nenhum arquivo enviado')
    }

    console.log(`Processing ${documentType} file: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Processar documento baseado no tipo
    const extractedTransactions = await processDocument(file, documentType)

    console.log(`Extracted ${extractedTransactions.length} transactions`)

    // Se não conseguiu extrair transações, gerar dados de exemplo para demonstração
    if (extractedTransactions.length === 0) {
      console.log('No transactions extracted, generating sample data for demonstration')
      const sampleTransactions = generateSampleTransactions()
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          transactions: sampleTransactions,
          message: `${sampleTransactions.length} transações de exemplo geradas! (O arquivo não pôde ser processado, mas você pode ver como funciona a importação)`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transactions: extractedTransactions,
        message: `${extractedTransactions.length} transações extraídas com sucesso!`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro no processamento:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function processDocument(file: File, documentType: string): Promise<TransactionData[]> {
  let text = ''
  
  try {
    console.log(`Processing file type: ${file.type}, name: ${file.name}`)
    
    if (file.type === 'application/pdf') {
      console.log('Processing PDF file')
      text = await extractTextFromPDF(file)
    } else if (file.type.includes('text') || file.name.toLowerCase().endsWith('.txt')) {
      console.log('Processing TXT file')
      text = await file.text()
    } else if (file.type.includes('csv') || file.name.toLowerCase().endsWith('.csv')) {
      console.log('Processing CSV file')
      text = await file.text()
    } else if (file.type.includes('excel') || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      console.log('Processing Excel file as text')
      text = await file.text()
    } else {
      console.log('Processing as generic text file')
      text = await file.text()
    }
    
    console.log('Extracted text length:', text.length)
    console.log('Text preview (first 500 chars):', text.substring(0, 500))
    
    if (documentType === 'receipt') {
      return processReceipt(text, file.name)
    } else {
      return processBankStatement(text, file.name)
    }
  } catch (error) {
    console.error('Error processing document:', error)
    throw new Error(`Erro ao processar documento: ${error.message}`)
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    console.log('PDF file size:', uint8Array.length)
    
    // Tentar extrair texto do PDF usando diferentes métodos
    let text = ''
    
    try {
      // Método 1: Tentar UTF-8
      text = new TextDecoder('utf-8').decode(uint8Array)
      console.log('UTF-8 decode successful, length:', text.length)
    } catch {
      try {
        // Método 2: Tentar ISO-8859-1
        text = new TextDecoder('iso-8859-1').decode(uint8Array)
        console.log('ISO-8859-1 decode successful, length:', text.length)
      } catch {
        // Método 3: Processar byte por byte
        text = Array.from(uint8Array).map(byte => 
          byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ' '
        ).join('')
        console.log('Byte-by-byte decode successful, length:', text.length)
      }
    }
    
    // Extrair dados usando padrões mais robustos
    const extractedData = extractDataFromPDFText(text)
    console.log('Extracted data length:', extractedData.length)
    
    if (extractedData.length > 50) {
      console.log('Successfully extracted meaningful data from PDF')
      return extractedData
    }
    
    // Se não conseguiu extrair dados úteis, tentar abordagem alternativa
    console.log('Trying alternative PDF parsing approach')
    const alternativeData = extractAlternativePDFData(text)
    
    if (alternativeData.length > 20) {
      return alternativeData
    }
    
    // Último recurso: buscar por padrões específicos de extrato
    console.log('Trying pattern-based extraction')
    const patternData = extractPatternBasedData(text)
    
    return patternData
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Erro ao processar arquivo PDF')
  }
}

function extractDataFromPDFText(text: string): string {
  const lines = text.split(/[\r\n]+/)
  const extractedLines: string[] = []
  
  console.log('Total lines to process:', lines.length)
  
  for (const line of lines) {
    // Remover caracteres de controle e limpar
    const cleanLine = line.replace(/[^\x20-\x7E\u00C0-\u00FF]/g, ' ').trim()
    
    if (cleanLine.length < 8) continue
    
    // Buscar padrões que parecem transações
    if (
      // Data seguida de descrição e valor
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}.*\d+[,.]?\d{2}/.test(cleanLine) ||
      // PIX, TED, DOC, DEBITO, CREDITO
      /(PIX|TED|DOC|DÉBITO|DÉBITO|CRÉDITO|CREDITO|COMPRA|PAGAMENTO|SAQUE|DEPÓSITO|DEPOSITO|TRANSFERENCIA|SALARIO)/i.test(cleanLine) ||
      // Padrões de valor monetário
      /R\$\s*\d+[,.]\d{2}/.test(cleanLine) ||
      // Números com valor monetário (formato brasileiro)
      /\d{1,3}(?:[.,]\d{3})*[,.]\d{2}/.test(cleanLine) ||
      // Estabelecimentos comerciais
      /(SUPERMERCADO|FARMACIA|POSTO|LOJA|MERCADO|PADARIA|RESTAURANTE)/i.test(cleanLine)
    ) {
      extractedLines.push(cleanLine)
      console.log('Found potential transaction:', cleanLine.substring(0, 100))
    }
  }
  
  console.log('Extracted lines count:', extractedLines.length)
  return extractedLines.join('\n')
}

function extractAlternativePDFData(text: string): string {
  // Buscar por padrões específicos em PDFs de extrato
  const patterns = [
    /Data.*Histórico.*Valor/gi,
    /\d{2}\/\d{2}\/\d{4}.*[-]?\d+[,]\d{2}/g,
    /PIX.*\d+[,]\d{2}/gi,
    /Compra.*\d+[,]\d{2}/gi,
    /Saque.*\d+[,]\d{2}/gi,
    /TED.*\d+[,]\d{2}/gi,
    /DOC.*\d+[,]\d{2}/gi,
    /Transferência.*\d+[,]\d{2}/gi,
  ]
  
  let extractedText = ''
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      extractedText += matches.join('\n') + '\n'
      console.log(`Pattern matched ${matches.length} times:`, pattern.toString())
    }
  })
  
  return extractedText
}

function extractPatternBasedData(text: string): string {
  // Buscar por sequências que contêm data e valor
  const lines = text.split(/\s+/)
  const extractedData: string[] = []
  
  for (let i = 0; i < lines.length - 2; i++) {
    const current = lines[i]
    const next = lines[i + 1]
    const afterNext = lines[i + 2]
    
    // Buscar padrão: data + descrição + valor
    if (current.match(/\d{2}\/\d{2}\/\d{4}/) && afterNext.match(/\d+[,]\d{2}/)) {
      const transaction = `${current} ${next} ${afterNext}`
      extractedData.push(transaction)
      console.log('Pattern-based match:', transaction)
    }
  }
  
  return extractedData.join('\n')
}

function generateSampleTransactions(): TransactionData[] {
  const today = new Date()
  const transactions: TransactionData[] = []
  
  // Gerar algumas transações de exemplo
  const sampleData = [
    { desc: "PIX Recebido - João Silva", amount: 1250.50, type: "income", daysAgo: 1 },
    { desc: "Compra Débito - Supermercado ABC", amount: 89.40, type: "expense", daysAgo: 2 },
    { desc: "TED Enviada - Pagamento Conta", amount: 450.00, type: "expense", daysAgo: 3 },
    { desc: "Depósito em Conta", amount: 2800.00, type: "income", daysAgo: 5 },
    { desc: "Débito Automático - Conta de Luz", amount: 125.67, type: "expense", daysAgo: 7 },
    { desc: "Compra Cartão - Farmácia XYZ", amount: 45.30, type: "expense", daysAgo: 8 },
    { desc: "PIX Enviado - Maria Santos", amount: 200.00, type: "expense", daysAgo: 10 },
  ]
  
  sampleData.forEach(item => {
    const date = new Date(today)
    date.setDate(date.getDate() - item.daysAgo)
    
    transactions.push({
      type: item.type as 'income' | 'expense',
      amount: item.amount,
      description: item.desc,
      date: date.toISOString().split('T')[0]
    })
  })
  
  console.log(`Generated ${transactions.length} sample transactions`)
  return transactions
}

function processReceipt(text: string, fileName: string): TransactionData[] {
  const transactions: TransactionData[] = []
  
  try {
    console.log('Processing receipt, text length:', text.length)
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    let totalAmount = 0
    let establishment = 'Estabelecimento'
    let date = new Date().toISOString().split('T')[0]
    
    // Buscar informações no texto
    for (const line of lines) {
      // Buscar valor total
      const valuePatterns = [
        /(?:total|valor|vlr|soma).*?(\d{1,6}[,.]\d{2})/i,
        /R\$\s*(\d{1,6}[,.]\d{2})/i,
        /(\d{1,6}[,.]\d{2})(?:\s*$)/,
      ]
      
      for (const regex of valuePatterns) {
        const match = line.match(regex)
        if (match) {
          const value = parseFloat(match[1].replace(',', '.'))
          if (value > totalAmount && value < 50000) {
            totalAmount = value
          }
        }
      }
      
      // Buscar estabelecimento
      if (line.length > 5 && line.length < 60 && 
          !line.toLowerCase().includes('cnpj') && 
          !line.toLowerCase().includes('total') &&
          line.match(/[a-zA-Z]/)) {
        establishment = line.substring(0, 40)
      }
      
      // Buscar data
      const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
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

function processBankStatement(text: string, fileName: string): TransactionData[] {
  const transactions: TransactionData[] = []
  
  try {
    console.log('Processing bank statement, text length:', text.length)
    
    // Detectar se é CSV
    if (text.includes(',') || text.includes(';')) {
      const csvTransactions = parseCSVFormat(text)
      if (csvTransactions.length > 0) {
        console.log(`Found ${csvTransactions.length} transactions in CSV format`)
        return csvTransactions
      }
    }
    
    // Processar como extrato textual
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    for (const line of lines) {
      if (line.length < 10) continue
      
      console.log('Processing line:', line.substring(0, 100))
      
      // Padrões para extratos brasileiros
      const patterns = [
        // Data, descrição e valor
        /(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+([-]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})/,
        // PIX, TED, etc com valor
        /(PIX|TED|DOC|COMPRA|PAGAMENTO|SAQUE|DEPOSITO|CREDITO|DEBITO).+?([-]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})/i,
        // Descrição seguida de data e valor
        /(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+([-]?\d{1,3}(?:[.,]\d{3})*[,]\d{2})/
      ]
      
      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          let dateStr = '', description = '', amountStr = ''
          
          if (pattern === patterns[0]) {
            [, dateStr, description, amountStr] = match
          } else if (pattern === patterns[1]) {
            [, description, amountStr] = match
            dateStr = new Date().toLocaleDateString('pt-BR')
          } else {
            [, description, dateStr, amountStr] = match
          }
          
          // Processar valor
          const amount = parseAmount(amountStr)
          if (amount === 0) continue
          
          // Determinar tipo
          const isCredit = amountStr.includes('+') || 
                          !amountStr.includes('-') && (
                            description.toLowerCase().includes('recebido') ||
                            description.toLowerCase().includes('deposito') ||
                            description.toLowerCase().includes('credito') ||
                            description.toLowerCase().includes('salario') ||
                            description.toLowerCase().includes('pix recebido')
                          )
          
          // Converter data
          const date = convertDateFormat(dateStr)
          
          if (description.length > 3) {
            transactions.push({
              type: isCredit ? 'income' : 'expense',
              amount: amount,
              description: description.trim().substring(0, 100),
              date: date
            })
            
            console.log(`Extracted: ${description.trim()}, ${isCredit ? '+' : '-'}R$ ${amount}, ${date}`)
          }
          break
        }
      }
    }
    
  } catch (error) {
    console.error('Error processing bank statement:', error)
  }
  
  return transactions
}

function parseCSVFormat(text: string): TransactionData[] {
  const transactions: TransactionData[] = []
  const lines = text.split('\n')
  
  console.log(`Processing CSV with ${lines.length} lines`)
  
  // Detectar separador
  let separator = ','
  const firstDataLine = lines.find(line => line.includes(',') || line.includes(';'))
  if (firstDataLine) {
    if (firstDataLine.split(';').length > firstDataLine.split(',').length) {
      separator = ';'
    }
  }
  
  console.log(`Using CSV separator: "${separator}"`)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || (line.toLowerCase().includes('data') && i < 3)) continue
    
    const columns = line.split(separator).map(col => col.trim().replace(/['"]/g, ''))
    
    if (columns.length >= 3) {
      try {
        let date = '', description = '', amountStr = ''
        
        // Identificar colunas
        for (let j = 0; j < columns.length; j++) {
          const col = columns[j]
          
          if (col.match(/\d{1,2}\/\d{1,2}\/\d{4}/) && !date) {
            date = col
          } else if (col.match(/[-]?\d{1,3}(?:[.,]\d{3})*[,]\d{2}/) && !amountStr) {
            amountStr = col
          } else if (col.length > 3 && !col.match(/^\d+[,.]\d{2}$/) && !description) {
            description = col
          }
        }
        
        // Fallback para posições
        if (!date && columns[0]) date = columns[0]
        if (!description && columns[1]) description = columns[1]
        if (!amountStr) {
          // Procurar valor em todas as colunas
          for (const col of columns) {
            if (col.match(/[-]?\d{1,3}(?:[.,]\d{3})*[,]\d{2}/)) {
              amountStr = col
              break
            }
          }
        }
        
        if (date && description && amountStr) {
          const amount = parseAmount(amountStr)
          if (amount > 0) {
            const convertedDate = convertDateFormat(date)
            const isCredit = amountStr.includes('+') || 
                           (!amountStr.includes('-') && description.toLowerCase().includes('recebido'))
            
            transactions.push({
              type: isCredit ? 'income' : 'expense',
              amount: amount,
              description: description,
              date: convertedDate
            })
            
            console.log(`CSV transaction: ${description}, ${isCredit ? '+' : '-'}R$ ${amount}, ${convertedDate}`)
          }
        }
      } catch (error) {
        console.error('Error parsing CSV line:', error, 'Line:', line)
      }
    }
  }
  
  return transactions
}

function parseAmount(amountStr: string): number {
  try {
    // Remover caracteres não numéricos exceto vírgulas, pontos e sinais
    let cleanAmount = amountStr.replace(/[^\d,.+-]/g, '').trim()
    
    // Remover sinais de + ou -
    const isNegative = cleanAmount.includes('-')
    cleanAmount = cleanAmount.replace(/[+-]/g, '')
    
    // Tratar formato brasileiro (1.234,56)
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // Formato: 1.234,56 ou 12.345,67
      const parts = cleanAmount.split(',')
      if (parts.length === 2 && parts[1].length === 2) {
        // Remover pontos dos milhares e trocar vírgula por ponto
        cleanAmount = parts[0].replace(/\./g, '') + '.' + parts[1]
      }
    } else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
      // Formato: 1234,56
      cleanAmount = cleanAmount.replace(',', '.')
    } else if (cleanAmount.includes('.') && !cleanAmount.includes(',')) {
      // Verificar se é separador decimal ou de milhares
      const parts = cleanAmount.split('.')
      if (parts.length === 2 && parts[1].length === 2) {
        // É separador decimal: 1234.56
        // Manter como está
      } else {
        // É separador de milhares: 1.234 -> 1234
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

function convertDateFormat(dateStr: string): string {
  try {
    const match = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
    if (match) {
      let [, day, month, year] = match
      if (year.length === 2) {
        year = '20' + year
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  } catch (error) {
    console.error('Date conversion error:', error)
  }
  return new Date().toISOString().split('T')[0]
}
