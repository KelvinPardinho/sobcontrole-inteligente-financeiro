
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportExtract } from "@/components/ImportExtract";
import { ImportReceipt } from "@/components/ImportReceipt";
import { ExtractedTransactions } from "@/components/ExtractedTransactions";
import { FileText, Camera, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "@/components/ui/sonner";

interface ExtractedTransaction {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export default function Import() {
  const [importType, setImportType] = useState<"extract" | "receipt">("extract");
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error" | "extracted">("idle");
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [freeImportsLeft, setFreeImportsLeft] = useState(2);
  const [freeReceiptsLeft, setFreeReceiptsLeft] = useState(5);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const { importTransactions } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const handleFileUpload = async (file: File) => {
    setImportStatus("processing");
    setErrorMessage("");
    
    try {
      console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Verificar se é um tipo de arquivo suportado
      const supportedTypes = [
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!supportedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|txt|csv|xls|xlsx)$/)) {
        throw new Error("Tipo de arquivo não suportado. Use PDF, TXT, CSV ou Excel.");
      }

      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', importType);

      console.log('Calling edge function with:', { type: importType, fileName: file.name });

      // Chamar edge function para processar o documento
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.success && data.transactions && data.transactions.length > 0) {
        setExtractedTransactions(data.transactions);
        setImportStatus("extracted");
        toast.success(data.message);
      } else if (data.success && data.transactions && data.transactions.length === 0) {
        throw new Error("Nenhuma transação foi encontrada no documento. Verifique se o arquivo contém dados válidos.");
      } else {
        throw new Error(data.error || "Erro desconhecido no processamento");
      }

      // Reduzir contadores apenas no plano grátis
      if (importType === "extract") {
        setFreeImportsLeft(prev => Math.max(0, prev - 1));
      } else {
        setFreeReceiptsLeft(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error("Erro no processamento:", error);
      setImportStatus("error");
      setErrorMessage(error.message || "Erro ao processar arquivo");
      toast.error(`Erro ao processar arquivo: ${error.message}`);
    }
  };

  const handleConfirmImport = async (selectedTransactions: ExtractedTransaction[]) => {
    // Buscar conta padrão (primeira conta ou criar uma se necessário)
    const defaultAccount = accounts[0];
    const defaultCategory = categories[0];

    if (!defaultAccount) {
      toast.error("Você precisa ter pelo menos uma conta cadastrada para importar transações");
      return;
    }

    const success = await importTransactions(
      selectedTransactions,
      defaultAccount.id,
      defaultCategory?.id
    );

    if (success) {
      setImportStatus("success");
      setExtractedTransactions([]);
    }
  };

  const handleCancelImport = () => {
    setImportStatus("idle");
    setExtractedTransactions([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Importar Dados</h1>
          <Tabs defaultValue="extract" onValueChange={(value) => {
            setImportType(value as "extract" | "receipt");
            setImportStatus("idle");
            setExtractedTransactions([]);
            setErrorMessage("");
          }}>
            <TabsList>
              <TabsTrigger value="extract">
                <FileText className="mr-2 h-4 w-4" />
                Extratos
              </TabsTrigger>
              <TabsTrigger value="receipt">
                <Camera className="mr-2 h-4 w-4" />
                Comprovantes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {importStatus === "extracted" ? (
              <ExtractedTransactions
                transactions={extractedTransactions}
                onConfirm={handleConfirmImport}
                onCancel={handleCancelImport}
              />
            ) : (
              <Card className="h-full">
                {importStatus === "processing" ? (
                  <CardContent className="flex flex-col items-center justify-center h-64">
                    <div className="animate-pulse text-center">
                      <div className="h-12 w-12 mx-auto rounded-full bg-sob-blue/20 mb-4 animate-spin border-4 border-sob-blue border-t-transparent"></div>
                      <p className="text-lg font-medium">Processando seu arquivo...</p>
                      <p className="text-muted-foreground mt-2">
                        {importType === "extract" 
                          ? "Extraindo transações do extrato bancário" 
                          : "Lendo informações do cupom fiscal"}
                      </p>
                    </div>
                  </CardContent>
                ) : importStatus === "success" ? (
                  <CardContent className="flex flex-col items-center justify-center h-64">
                    <div className="text-center">
                      <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-lg font-medium">Transações importadas com sucesso!</p>
                      <p className="text-muted-foreground mt-2">As transações foram adicionadas à sua conta</p>
                      <Button 
                        className="mt-6 bg-sob-blue hover:bg-sob-blue/90"
                        onClick={() => window.location.href = "/transactions"}
                      >
                        Ver Transações
                      </Button>
                    </div>
                  </CardContent>
                ) : importStatus === "error" ? (
                  <CardContent className="flex flex-col items-center justify-center h-64">
                    <div className="text-center">
                      <div className="h-12 w-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-lg font-medium">Erro na importação</p>
                      <p className="text-muted-foreground mt-2 max-w-md">
                        {errorMessage || "Não foi possível processar o arquivo. Tente novamente ou use um formato diferente."}
                      </p>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        <p className="font-medium mb-1">Formatos suportados:</p>
                        <p>• PDF (extratos e cupons fiscais)</p>
                        <p>• TXT (extratos em texto)</p>
                        <p>• CSV (dados de transações)</p>
                      </div>
                      <Button className="mt-6 bg-sob-blue hover:bg-sob-blue/90" onClick={() => {
                        setImportStatus("idle");
                        setErrorMessage("");
                      }}>
                        Tentar Novamente
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    {importType === "extract" ? (
                      <ImportExtract onFileUpload={handleFileUpload} />
                    ) : (
                      <ImportReceipt onFileUpload={handleFileUpload} />
                    )}
                  </>
                )}
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>Gratuito</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Importações de extratos</p>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Restantes</span>
                    <span className="font-medium">{freeImportsLeft} de 2</span>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 text-sm font-medium">Leitura de comprovantes (OCR)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Restantes</span>
                    <span className="font-medium">{freeReceiptsLeft} de 5</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    Aproveite recursos ilimitados de importação atualizando seu plano.
                  </p>
                  <Button className="w-full bg-sob-blue hover:bg-sob-blue/90">
                    Atualizar para Gold
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
