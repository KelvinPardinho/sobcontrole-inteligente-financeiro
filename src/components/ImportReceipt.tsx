
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload } from "lucide-react";

interface ImportReceiptProps {
  onFileUpload: (file: File) => void;
}

export function ImportReceipt({ onFileUpload }: ImportReceiptProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Verificar se é uma imagem
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileUpload(file);
    } else {
      alert("Por favor, selecione uma imagem válida (JPG, PNG, etc.)");
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
        <CardTitle>Ler Comprovante</CardTitle>
      </CardHeader>
      <CardContent>
        {previewImage ? (
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-xs mb-4">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-auto rounded-lg shadow-md"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white"
                onClick={() => setPreviewImage(null)}
              >
                Trocar
              </Button>
            </div>
            <p className="text-center text-muted-foreground">
              Imagem carregada. Aguarde enquanto processamos o comprovante.
            </p>
          </div>
        ) : (
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
            <Camera className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Arraste sua imagem ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground mt-2">Suporta JPG, PNG ou HEIC</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        )}
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Dica de uso</h3>
            <p className="text-sm text-muted-foreground">
              Para melhores resultados, certifique-se que a imagem esteja bem iluminada e
              os valores e datas do comprovante estejam claramente visíveis.
            </p>
          </div>
          
          {!previewImage && (
            <Button 
              className="w-full bg-sob-blue hover:bg-sob-blue/90"
              onClick={onButtonClick}
            >
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Imagem
            </Button>
          )}
        </div>
      </CardContent>
    </>
  );
}
