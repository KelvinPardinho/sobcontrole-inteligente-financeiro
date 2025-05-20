
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportExtract } from "@/components/ImportExtract";
import { ImportReceipt } from "@/components/ImportReceipt";
import { FileText, Camera, Check, AlertCircle } from "lucide-react";

export default function Import() {
  const [importType, setImportType] = useState<"extract" | "receipt">("extract");
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [freeImportsLeft, setFreeImportsLeft] = useState(2); // Simulando plano grátis
  const [freeReceiptsLeft, setFreeReceiptsLeft] = useState(5); // Simulando plano grátis

  const handleFileUpload = (file: File) => {
    // Simular processamento
    setImportStatus("processing");
    
    setTimeout(() => {
      if (Math.random() > 0.2) { // 80% de chance de sucesso
        setImportStatus("success");
        
        // Reduzir contadores apenas no plano grátis
        if (importType === "extract") {
          setFreeImportsLeft(prev => Math.max(0, prev - 1));
        } else {
          setFreeReceiptsLeft(prev => Math.max(0, prev - 1));
        }
      } else {
        setImportStatus("error");
      }
    }, 2000);
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
            <Card className="h-full">
              {importStatus === "processing" ? (
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <div className="animate-pulse text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-sob-blue/20 mb-4"></div>
                    <p className="text-lg font-medium">Processando seu arquivo...</p>
                    <p className="text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
                  </div>
                </CardContent>
              ) : importStatus === "success" ? (
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <div className="text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-lg font-medium">Importação concluída com sucesso!</p>
                    <p className="text-muted-foreground mt-2">Os dados foram extraídos e estão prontos para revisão</p>
                    <Button className="mt-6 bg-sob-blue hover:bg-sob-blue/90">
                      Revisar Dados Importados
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
                    <p className="text-muted-foreground mt-2">Não foi possível processar o arquivo. Tente novamente ou use um formato diferente.</p>
                    <Button className="mt-6 bg-sob-blue hover:bg-sob-blue/90" onClick={() => setImportStatus("idle")}>
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
