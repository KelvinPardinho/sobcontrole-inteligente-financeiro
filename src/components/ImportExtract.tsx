
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

interface ImportExtractProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export function ImportExtract({ onFileUpload, disabled = false }: ImportExtractProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (disabled) return;
    
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Importar Extrato CSV</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-52 ${
            disabled 
              ? "cursor-not-allowed opacity-50 border-gray-200" 
              : dragActive 
              ? "border-sob-blue bg-sob-blue/5 cursor-pointer" 
              : "border-gray-300 cursor-pointer"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <FileText className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">
            {disabled ? "Selecione uma conta primeiro" : "Arraste seu arquivo CSV ou clique para selecionar"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Apenas arquivos CSV são suportados
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Formato do CSV</h3>
            <p className="text-sm text-muted-foreground mb-2">
              O arquivo CSV deve conter exatamente as seguintes 5 colunas na ordem:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li><strong>Data</strong> - no formato DD/MM/AAAA</li>
              <li><strong>Lançamento</strong> - tipo da operação (PIX, Compra, etc.)</li>
              <li><strong>Histórico</strong> - categoria da transação</li>
              <li><strong>Descrição</strong> - detalhes da transação</li>
              <li><strong>Valor</strong> - valor em reais (formato: 1.234,56 ou -1.234,56)</li>
            </ul>
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono">
              <p className="font-medium mb-1">Exemplo (com ponto e vírgula):</p>
              <p>Data;Lançamento;Histórico;Descrição;Valor</p>
              <p>02/06/2025;Pix enviado;Alimentação;Mercado ABC;-150,50</p>
            </div>
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
              <p className="text-yellow-800">
                <strong>Importante:</strong> A coluna Saldo será ignorada se presente. 
                Apenas as 5 primeiras colunas serão processadas.
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full bg-sob-blue hover:bg-sob-blue/90"
            onClick={onButtonClick}
            disabled={disabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            Selecionar Arquivo CSV
          </Button>
        </div>
      </CardContent>
    </>
  );
}
