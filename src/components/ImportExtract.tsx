
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
        <CardTitle>Importar Extrato</CardTitle>
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
            {disabled ? "Selecione uma conta primeiro" : "Arraste seu arquivo ou clique para selecionar"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Suporta arquivos PDF, TXT, CSV ou Excel
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.pdf,.ofx,.txt,.xls,.xlsx"
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Dica de uso</h3>
            <p className="text-sm text-muted-foreground">
              Para melhores resultados, baixe o extrato de sua instituição financeira
              no formato CSV, TXT ou PDF. Todas as transações encontradas no documento
              serão extraídas automaticamente.
            </p>
          </div>
          
          <Button 
            className="w-full bg-sob-blue hover:bg-sob-blue/90"
            onClick={onButtonClick}
            disabled={disabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            Selecionar Arquivo
          </Button>
        </div>
      </CardContent>
    </>
  );
}
