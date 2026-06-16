import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    window.addEventListener("beforeinstallprompt", handler);
    
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (promptInstall) {
      promptInstall.prompt();
    } else if (isIOS) {
      setShowIOSPrompt(true);
    }
  };

  // Only show the button if installation is supported and not already installed
  if (!supportsPWA && !isIOS) {
    return null;
  }

  return (
    <>
      <Button onClick={onClick} variant="outline" className="gap-2">
        <Download className="w-4 h-4" /> Instalar App
      </Button>

      {showIOSPrompt && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">Instalar no iOS</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowIOSPrompt(false)}>
               <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Para instalar o ControleJá no seu iPhone ou iPad:
          </p>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Toque no botão <Share className="w-4 h-4 inline" /> <strong>Compartilhar</strong> na barra inferior do Safari.</li>
            <li>Role para baixo e selecione <PlusSquare className="w-4 h-4 inline" /> <strong>Adicionar à Tela de Início</strong>.</li>
          </ol>
          <div className="mx-auto w-12 h-1 bg-muted-foreground/30 rounded-full mt-2" />
        </div>
      )}
    </>
  );
}
