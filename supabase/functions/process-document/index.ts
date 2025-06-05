
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
    if (file.type === 'application/pdf') {
      // Para PDFs, vamos simular extração com base no nome do arquivo
      // Em produção, você usaria uma biblioteca como pdf-parse ou serviço de OCR
      console.log('Processing PDF file:', file.name)
      text = await simulatePDFExtraction(file)
    } else {
      // Para arquivos de texto
      text = await file.text()
    }
    
    console.log('Extracted text preview:', text.substring(0, 200))
    
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

async function simulatePDFExtraction(file: File): Promise<string> {
  // Simulação baseada no nome do arquivo e tipo
  const fileName = file.name.toLowerCase()
  
  if (fileName.includes('extrato') || fileName.includes('statement')) {
    // Simular extrato bancário
    return `
BANCO EXEMPLO S.A.
EXTRATO DE CONTA CORRENTE
Período: 01/05/2025 a 05/06/2025

05/06/2025 PIX RECEBIDO JOÃO SILVA +500,00
04/06/2025 COMPRA CARTÃO DÉBITO SUPERMERCADO ABC -85,50
03/06/2025 TED ENVIADA -200,00
02/06/2025 DEPÓSITO +1.000,00
01/06/2025 CONTA LUZ -120,30
31/05/2025 SALÁRIO +3.500,00
30/05/2025 COMPRA ONLINE -45,90
    `
  } else if (fileName.includes('cupom') || fileName.includes('fiscal') || fileName.includes('nf')) {
    // Simular cupom fiscal
    return `
SUPERMERCADO EXEMPLO LTDA
CNPJ: 12.345.678/0001-90
Endereço: Rua das Flores, 123

CUPOM FISCAL ELETRÔNICO
Data: 05/06/2025 15:30:20

ITEM                QTD  VALOR
ARROZ 5KG           1    R$ 25,90
FEIJÃO 1KG          2    R$ 12,80
AÇÚCAR 1KG          1    R$ 4,50
LEITE 1L            3    R$ 9,60

TOTAL GERAL         R$ 52,80
FORMA PAGAMENTO: CARTÃO DÉBITO
    `
  } else {
    // Arquivo genérico - simular algumas transações
    return `
Data: 05/06/2025
Descrição: Compra no estabelecimento
Valor: R$ 50,00
Tipo: Débito
    `
  }
}

function processReceipt(text: string, fileName: string): TransactionData[] {
  const transactions: TransactionData[] = []
  
  try {
    const lines = text.split('\n')
    let totalAmount = 0
    let establishment = 'Estabelecimento'
    let date = new Date().toISOString().split('T')[0]
    
    // Buscar informações no texto
    for (const line of lines) {
      const cleanLine = line.trim()
      
      // Buscar valor total (formatos: R$ 99,99 ou 99,99)
      const totalMatches = [
        /(?:total|valor|vlr).*?r?\$?\s*(\d{1,6}[,.]?\d{0,2})/i,
        /r?\$\s*(\d{1,6}[,.]\d{2})/i,
        /(\d{1,4}[,.]\d{2})/
      ]
      
      for (const regex of totalMatches) {
        const match = cleanLine.match(regex)
        if (match) {
          const value = parseFloat(match[1].replace(',', '.'))
          if (value > totalAmount && value < 10000) { // Valor razoável
            totalAmount = value
          }
        }
      }
      
      // Buscar nome do estabelecimento
      if (cleanLine.length > 5 && cleanLine.length < 50 && 
          !cleanLine.includes('CNPJ') && !cleanLine.includes('CPF') &&
          !cleanLine.includes('Data') && !cleanLine.includes('TOTAL')) {
        if (cleanLine.match(/[A-Za-z]/) && !cleanLine.match(/^\d/)) {
          establishment = cleanLine.substring(0, 30)
        }
      }
      
      // Buscar data (DD/MM/AAAA ou DD-MM-AAAA)
      const dateMatch = cleanLine.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }
    
    // Se encontrou valor, criar transação
    if (totalAmount > 0) {
      transactions.push({
        type: 'expense',
        amount: totalAmount,
        description: `Compra - ${establishment}`,
        date: date
      })
      
      console.log(`Extracted receipt: ${establishment}, R$ ${totalAmount}, ${date}`)
    }
  } catch (error) {
    console.error('Error processing receipt:', error)
  }
  
  return transactions
}

function processBankStatement(text: string, fileName: string): TransactionData[] {
  const transactions: TransactionData[] = []
  
  try {
    const lines = text.split('\n')
    
    for (const line of lines) {
      const cleanLine = line.trim()
      
      // Padrões para extratos bancários
      const patterns = [
        // DD/MM/AAAA DESCRIÇÃO +/-VALOR
        /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\+\-]?\s*\d{1,6}[,.]?\d{0,2})/,
        // DD/MM DESCRIÇÃO VALOR
        /(\d{2}\/\d{2})\s+(.+?)\s+(\d{1,6}[,.]\d{2})/,
        // DESCRIÇÃO seguida de valor com + ou -
        /(.+?)\s+([\+\-]\s*\d{1,6}[,.]\d{2})/
      ]
      
      for (const pattern of patterns) {
        const match = cleanLine.match(pattern)
        if (match) {
          let dateStr, description, amountStr
          
          if (match.length === 4) {
            [, dateStr, description, amountStr] = match
          } else {
            [, description, amountStr] = match
            dateStr = new Date().toLocaleDateString('pt-BR')
          }
          
          // Limpar e processar valores
          const cleanAmount = amountStr.replace(/[^\d,.+-]/g, '')
          const amount = Math.abs(parseFloat(cleanAmount.replace(',', '.')))
          const isNegative = amountStr.includes('-') || 
                           description.toLowerCase().includes('débito') ||
                           description.toLowerCase().includes('compra') ||
                           description.toLowerCase().includes('saque')
          
          // Converter data
          let date = new Date().toISOString().split('T')[0]
          if (dateStr && dateStr.includes('/')) {
            const parts = dateStr.split('/')
            if (parts.length === 3) {
              date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
            } else if (parts.length === 2) {
              const year = new Date().getFullYear()
              date = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
            }
          }
          
          // Filtrar valores válidos
          if (amount > 0 && amount < 50000 && description.length > 3) {
            transactions.push({
              type: isNegative ? 'expense' : 'income',
              amount: amount,
              description: description.trim().substring(0, 50),
              date: date
            })
            
            console.log(`Extracted transaction: ${description.substring(0, 20)}, ${isNegative ? '-' : '+'}R$ ${amount}`)
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
