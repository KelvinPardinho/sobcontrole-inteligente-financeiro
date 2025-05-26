
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Bell, Moon, Sun, Globe, Shield, Save } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    language: "pt-BR",
    privacy: {
      shareData: false,
      showBalance: true
    }
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handlePrivacyToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting as keyof typeof prev.privacy]
      }
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="flex-1 text-foreground">
                    Ativar notificações
                  </Label>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={() => handleToggle('notifications')}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receba alertas sobre transações, vencimentos e metas financeiras.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="flex-1 text-foreground">
                    Modo escuro
                  </Label>
                  <Switch
                    id="darkMode"
                    checked={theme === "dark"}
                    onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Altere entre o modo claro e escuro da interface.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="h-5 w-5" />
                Idioma e Região
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="language" className="text-foreground">Idioma</Label>
                  <select
                    id="language"
                    className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione o idioma e formato de moeda preferido.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shareData" className="flex-1 text-foreground">
                    Compartilhar dados para melhorar o serviço
                  </Label>
                  <Switch
                    id="shareData"
                    checked={settings.privacy.shareData}
                    onCheckedChange={() => handlePrivacyToggle('shareData')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showBalance" className="flex-1 text-foreground">
                    Mostrar saldo na tela inicial
                  </Label>
                  <Switch
                    id="showBalance"
                    checked={settings.privacy.showBalance}
                    onCheckedChange={() => handlePrivacyToggle('showBalance')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="bg-sob-blue hover:bg-sob-blue/90 text-white">
            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
          </Button>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
