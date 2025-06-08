
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { extractTextFromPDF } from './pdf-processor.ts'
import { extractTransactionsFromText } from './transaction-extractor.ts'

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

    const extractedTransactions = await processDocument(file, documentType)

    console.log(`Extracted ${extractedTransactions.length} transactions`)

    if (extractedTransactions.length === 0) {
      console.log('No transactions extracted, generating sample data')
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
    console.log('Text preview (first 200 chars):', text.substring(0, 200))
    
    return extractTransactionsFromText(text, documentType)
    
  } catch (error) {
    console.error('Error processing document:', error)
    throw new Error(`Erro ao processar documento: ${error.message}`)
  }
}

function generateSampleTransactions(): TransactionData[] {
  const today = new Date()
  const transactions: TransactionData[] = []
  
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
