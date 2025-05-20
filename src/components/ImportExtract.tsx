
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";

interface ImportExtractProps {
  onFileUpload: (file: File) => void;
}

export function ImportExtract({ onFileUpload }: ImportExtractProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
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
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-52 cursor-pointer ${
            dragActive ? "border-sob-blue bg-sob-blue/5" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <FileText className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Arraste seu arquivo ou clique para selecionar</p>
          <p className="text-sm text-muted-foreground mt-2">Suporta arquivos CSV, PDF ou OFX</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.pdf,.ofx"
            onChange={handleChange}
            className="hidden"
          />
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Dica de uso</h3>
            <p className="text-sm text-muted-foreground">
              Para melhores resultados, baixe o extrato de sua instituição financeira
              no formato CSV ou OFX. A importação funciona melhor com formatos padronizados.
            </p>
          </div>
          
          <Button 
            className="w-full bg-sob-blue hover:bg-sob-blue/90"
            onClick={onButtonClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Selecionar Arquivo
          </Button>
        </div>
      </CardContent>
    </>
  );
}
