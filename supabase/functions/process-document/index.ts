
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

    // Verificar se é CSV
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Apenas arquivos CSV são suportados')
    }

    const extractedTransactions = await processCSVDocument(file)

    console.log(`Extracted ${extractedTransactions.length} transactions`)

    if (extractedTransactions.length === 0) {
      throw new Error('Nenhuma transação encontrada no arquivo CSV. Verifique o formato.')
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

async function processCSVDocument(file: File): Promise<TransactionData[]> {
  const transactions: TransactionData[] = []
  
  try {
    const text = await file.text()
    console.log('CSV content length:', text.length)
    
    const lines = text.split('\n').filter(line => line.trim())
    console.log(`Processing ${lines.length} lines`)
    
    // Detectar separador (vírgula ou ponto e vírgula)
    let separator = ','
    if (lines.length > 0) {
      const firstLine = lines[0]
      const commaCount = (firstLine.match(/,/g) || []).length
      const semicolonCount = (firstLine.match(/;/g) || []).length
      
      if (semicolonCount > commaCount) {
        separator = ';'
      }
    }
    
    console.log(`Using separator: "${separator}"`)
    
    // Pular cabeçalho se existir
    let startIndex = 0
    if (lines.length > 0) {
      const firstLine = lines[0].toLowerCase()
      if (firstLine.includes('data') || firstLine.includes('lancamento') || firstLine.includes('historico')) {
        startIndex = 1
        console.log('Skipping header row')
      }
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      console.log(`Processing line ${i + 1}: ${line}`)
      
      const columns = line.split(separator).map(col => col.trim().replace(/['"]/g, ''))
      
      if (columns.length < 5) {
        console.log(`Skipping line ${i + 1}: insufficient columns (${columns.length})`)
        continue
      }
      
      // Mapear colunas: Data, Lançamento, Histórico, Descrição, Valor
      const [dateStr, lancamento, historico, descricao, valorStr] = columns
      
      // Processar data
      const date = convertDateFormat(dateStr)
      if (!date) {
        console.log(`Skipping line ${i + 1}: invalid date format`)
        continue
      }
      
      // Processar valor
      const amount = parseMonetaryValue(valorStr)
      if (amount === 0) {
        console.log(`Skipping line ${i + 1}: invalid amount`)
        continue
      }
      
      // Determinar tipo (receita ou despesa)
      // Por padrão, valores negativos são despesas, positivos são receitas
      const isNegative = valorStr.includes('-') || valorStr.startsWith('(')
      const type: 'income' | 'expense' = isNegative ? 'expense' : 'income'
      
      // Criar descrição combinando histórico e descrição
      const description = `${historico} - ${descricao}`.trim()
      
      const transaction: TransactionData = {
        type,
        amount: Math.abs(amount),
        description,
        date
      }
      
      transactions.push(transaction)
      console.log(`Added transaction: ${transaction.type} R$ ${transaction.amount} - ${transaction.description}`)
    }
    
  } catch (error) {
    console.error('Error processing CSV:', error)
    throw new Error(`Erro ao processar CSV: ${error.message}`)
  }
  
  return transactions
}

function parseMonetaryValue(amountStr: string): number {
  try {
    if (!amountStr) return 0
    
    let cleanAmount = amountStr.replace(/[^\d,.+-]/g, '').trim()
    
    // Remover parênteses (formato contábil para negativos)
    const isNegative = cleanAmount.includes('-') || amountStr.includes('(')
    cleanAmount = cleanAmount.replace(/[()+-]/g, '')
    
    // Tratar formato brasileiro: 1.234,56 ou 1234,56
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // Formato: 1.234,56
      const parts = cleanAmount.split(',')
      if (parts.length === 2 && parts[1].length === 2) {
        cleanAmount = parts[0].replace(/\./g, '') + '.' + parts[1]
      }
    } else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
      // Formato: 1234,56
      cleanAmount = cleanAmount.replace(',', '.')
    } else if (cleanAmount.includes('.')) {
      // Verificar se é separador decimal ou milhares
      const parts = cleanAmount.split('.')
      if (parts.length === 2 && parts[1].length !== 2) {
        // É separador de milhares, remover
        cleanAmount = cleanAmount.replace(/\./g, '')
      }
    }
    
    const amount = parseFloat(cleanAmount)
    return isNaN(amount) ? 0 : (isNegative ? -amount : amount)
    
  } catch (error) {
    console.error('Error parsing amount:', amountStr, error)
    return 0
  }
}

function convertDateFormat(dateStr: string): string | null {
  try {
    // Suportar formatos: DD/MM/AAAA, DD-MM-AAAA, DD.MM.AAAA
    const match = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/)
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
  return null
}
