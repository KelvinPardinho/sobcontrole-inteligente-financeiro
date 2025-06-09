
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

    if (!file) {
      throw new Error('Nenhum arquivo enviado')
    }

    console.log(`Processing CSV file: ${file.name}, size: ${file.size}, type: ${file.type}`)

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
      const firstDataLine = lines.find(line => line.includes('Data') || line.match(/\d{2}\/\d{2}\/\d{4}/))
      if (firstDataLine) {
        const commaCount = (firstDataLine.match(/,/g) || []).length
        const semicolonCount = (firstDataLine.match(/;/g) || []).length
        
        if (semicolonCount > commaCount) {
          separator = ';'
        }
      }
    }
    
    console.log(`Using separator: "${separator}"`)
    
    // Encontrar linha de cabeçalho de dados
    let startIndex = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (line.includes('data') && (line.includes('lancamento') || line.includes('lançamento')) && line.includes('valor')) {
        startIndex = i + 1
        console.log(`Found header at line ${i + 1}, starting data processing from line ${startIndex + 1}`)
        break
      }
    }
    
    // Se não encontrou cabeçalho específico, procurar primeira linha com data
    if (startIndex === 0) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/\d{2}\/\d{2}\/\d{4}/)) {
          startIndex = i
          console.log(`No header found, starting from first date line: ${i + 1}`)
          break
        }
      }
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      console.log(`Processing line ${i + 1}: ${line}`)
      
      const columns = line.split(separator).map(col => col.trim().replace(/['"]/g, ''))
      
      // Processar apenas as primeiras 5 colunas: Data, Lançamento, Histórico, Descrição, Valor
      // Ignorar a coluna Saldo se existir
      if (columns.length < 5) {
        console.log(`Skipping line ${i + 1}: insufficient columns (${columns.length})`)
        continue
      }
      
      // Mapear apenas as 5 primeiras colunas: Data, Lançamento, Histórico, Descrição, Valor
      const [dateStr, lancamento, historico, descricao, valorStr] = columns.slice(0, 5)
      
      console.log(`Extracted data: date=${dateStr}, lancamento=${lancamento}, historico=${historico}, descricao=${descricao}, valor=${valorStr}`)
      
      // Verificar se é linha válida (tem data)
      if (!dateStr.match(/\d{2}\/\d{2}\/\d{4}/)) {
        console.log(`Skipping line ${i + 1}: invalid date format`)
        continue
      }
      
      // Processar data
      const date = convertDateFormat(dateStr)
      if (!date) {
        console.log(`Skipping line ${i + 1}: could not convert date`)
        continue
      }
      
      // Processar valor - usar o valor original da coluna Valor
      const amount = parseMonetaryValue(valorStr)
      if (amount === 0) {
        console.log(`Skipping line ${i + 1}: invalid amount`)
        continue
      }
      
      // Determinar tipo baseado no sinal do valor
      const type: 'income' | 'expense' = amount >= 0 ? 'income' : 'expense'
      
      // Criar descrição combinando histórico e descrição
      let description = ''
      if (historico && descricao) {
        description = `${historico} - ${descricao}`.trim()
      } else if (historico) {
        description = historico.trim()
      } else if (descricao) {
        description = descricao.trim()
      } else {
        description = (lancamento || 'Transação').trim()
      }
      
      const transaction: TransactionData = {
        type,
        amount: Math.abs(amount), // Usar valor absoluto para o amount
        description: description.substring(0, 200), // Limitar tamanho
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
    
    // Remover espaços e caracteres não numéricos (exceto vírgula, ponto e sinais)
    let cleanAmount = amountStr.replace(/[^\d,.+-]/g, '').trim()
    
    // Verificar se é negativo
    const isNegative = cleanAmount.includes('-') || amountStr.includes('(')
    cleanAmount = cleanAmount.replace(/[()+-]/g, '')
    
    // Tratar formato brasileiro: 1.234,56
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
      // Verificar se o ponto é separador de milhares e vírgula é decimal
      const parts = cleanAmount.split(',')
      if (parts.length === 2 && parts[1].length <= 2) {
        // Formato brasileiro: remover pontos (milhares) e trocar vírgula por ponto
        cleanAmount = parts[0].replace(/\./g, '') + '.' + parts[1]
      }
    } else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
      // Apenas vírgula: substituir por ponto decimal
      cleanAmount = cleanAmount.replace(',', '.')
    } else if (cleanAmount.includes('.')) {
      // Apenas ponto: verificar se é decimal ou milhares
      const parts = cleanAmount.split('.')
      if (parts.length === 2 && parts[1].length > 2) {
        // Provavelmente separador de milhares
        cleanAmount = cleanAmount.replace(/\./g, '')
      }
      // Se parts[1].length <= 2, manter como decimal
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
