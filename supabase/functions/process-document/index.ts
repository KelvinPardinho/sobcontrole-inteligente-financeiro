
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
    const documentType = formData.get('type') as string // 'extract' ou 'receipt'

    if (!file) {
      throw new Error('Nenhum arquivo enviado')
    }

    console.log(`Processing ${documentType} file: ${file.name}, size: ${file.size}`)

    // Simular processamento de documento (aqui você integraria com OCR real)
    const extractedTransactions = await processDocument(file, documentType)

    console.log(`Extracted ${extractedTransactions.length} transactions`)

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
  const text = await file.text()
  
  if (documentType === 'receipt') {
    // Para cupom fiscal, sempre é despesa
    return processReceipt(text)
  } else {
    // Para extrato bancário, precisa identificar tipo
    return processBankStatement(text)
  }
}

function processReceipt(text: string): TransactionData[] {
  // Simulação de processamento de cupom fiscal
  // Aqui você integraria com OCR real como Google Cloud Vision, AWS Textract, etc.
  
  const transactions: TransactionData[] = []
  
  // Simular extração de dados do cupom
  const lines = text.split('\n')
  let totalAmount = 0
  let establishment = 'Estabelecimento'
  let date = new Date().toISOString().split('T')[0]
  
  // Buscar por padrões comuns em cupons fiscais
  for (const line of lines) {
    // Buscar valor total (diferentes formatos)
    const totalMatch = line.match(/(?:total|valor|vlr).*?(\d+[,.]?\d{0,2})/i)
    if (totalMatch) {
      totalAmount = Math.max(totalAmount, parseFloat(totalMatch[1].replace(',', '.')))
    }
    
    // Buscar nome do estabelecimento
    if (line.length > 10 && line.length < 50 && !line.includes('CPF') && !line.includes('CNPJ')) {
      establishment = line.trim()
    }
    
    // Buscar data
    const dateMatch = line.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
    if (dateMatch) {
      date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
    }
  }
  
  if (totalAmount > 0) {
    transactions.push({
      type: 'expense',
      amount: totalAmount,
      description: `Compra - ${establishment}`,
      date: date
    })
  }
  
  return transactions
}

function processBankStatement(text: string): TransactionData[] {
  // Simulação de processamento de extrato bancário
  const transactions: TransactionData[] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    // Buscar por padrões de transações bancárias
    const transactionMatch = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\-\+]?\d+[,.]?\d{0,2})/)
    
    if (transactionMatch) {
      const [, dateStr, description, amountStr] = transactionMatch
      const amount = Math.abs(parseFloat(amountStr.replace(',', '.')))
      const isNegative = amountStr.includes('-')
      
      // Converter data para formato ISO
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month}-${day}`
      
      if (amount > 0) {
        transactions.push({
          type: isNegative ? 'expense' : 'income',
          amount: amount,
          description: description.trim(),
          date: date
        })
      }
    }
  }
  
  return transactions
}
