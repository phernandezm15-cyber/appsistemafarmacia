import { useEffect, useState } from "react";
import {
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  RefreshCw,
  FolderArchive,
  Package,
  GitBranch,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiUrl } from "@/lib/api";

export function AndroidApkHubModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    const currentUrl = window.location.origin;
    setAppUrl(currentUrl);

    QRCode.toDataURL(currentUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR Code Error:", err));
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadNativeKotlinProjectZip = async () => {
    setDownloadingZip(true);
    try {
      const res = await fetch(apiUrl("/api/android/native-project.zip"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FarmaciaDB-Android-Nativo-Kotlin.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Proyecto Android Nativo descargado", {
        description: "Código 100% Kotlin + Jetpack Compose + SQLite + CameraX + SpeechRecognizer listo para Android Studio.",
      });
    } catch (e: any) {
      console.error("Error downloading native zip:", e);
      toast.error("No se pudo descargar el paquete: " + (e?.message || e));
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="hero"
            size="sm"
            className="glow gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/20"
          >
            <Package className="h-4 w-4" />
            <span>App Nativa Kotlin / APK</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 flex-wrap">
                App Android Nativa desde Cero (Kotlin)
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium text-xs">
                  100% Kotlin + Compose · Sin WebView
                </Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Proyecto Android nativo escrito en Kotlin, Jetpack Compose Material 3, SQLite, SpeechRecognizer y CameraX.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="studio" className="mt-4">
          <TabsList className="grid grid-cols-3 bg-muted/60 p-1 rounded-2xl">
            <TabsTrigger value="studio" className="rounded-xl text-xs font-semibold gap-1.5">
              <FolderArchive className="h-3.5 w-3.5" />
              <span>Android Studio</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="rounded-xl text-xs font-semibold gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              <span>APK en GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="rounded-xl text-xs font-semibold gap-1.5">
              <QrCode className="h-3.5 w-3.5" />
              <span>Vista QR</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Native Kotlin Android Studio Project Download */}
          <TabsContent value="studio" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  Proyecto Android Studio Completo (Escrito desde cero en Kotlin)
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Contiene la carpeta nativa <code className="text-primary font-mono">android-native-app/</code> con todas las pantallas y lógica de FarmaciaDB sin usar HTML ni navegador:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>UI Nativa Jetpack Compose Material 3</span>
                </div>
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Base de datos SQLite local (FarmaciaDbHelper)</span>
                </div>
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Voz nativa Android SpeechRecognizer</span>
                </div>
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Escáner CameraX + Google ML Kit</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-background/60 border border-border/60 text-xs space-y-1.5">
                <p className="font-bold text-foreground">Cómo abrir y compilar el .APK en Android Studio:</p>
                <p className="text-muted-foreground">
                  1. Descarga el ZIP y descomprímelo.<br />
                  2. En Android Studio haz clic en <strong>File &gt; Open</strong> y selecciona la carpeta descomprimida.<br />
                  3. Espera a que termine Gradle Sync y pulsa <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.<br />
                  4. Abre la ruta <code className="text-emerald-400">app/build/outputs/apk/debug/app-debug.apk</code> para instalarlo en tu teléfono.
                </p>
              </div>

              <Button
                onClick={downloadNativeKotlinProjectZip}
                disabled={downloadingZip}
                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 font-bold py-5 text-sm text-white"
              >
                {downloadingZip ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Empaquetando proyecto Kotlin...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Descargar Proyecto Android Nativo Kotlin (.ZIP)</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: Automatic GitHub Actions Native APK Build */}
          <TabsContent value="github" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                Compilación automática de FarmaciaDB-Nativo.apk en GitHub
              </h4>
              <p className="text-xs text-muted-foreground">
                El archivo <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code> compila directamente la carpeta <code className="text-primary font-mono">android-native-app/</code> con Gradle 8.9 y Android SDK en GitHub.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[11px]">
                    1
                  </span>
                  <p className="text-muted-foreground">
                    Sube la carpeta <code className="text-primary">android-native-app/</code> y <code className="text-primary">.github/workflows/build-apk.yml</code> a tu repositorio en GitHub.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[11px]">
                    2
                  </span>
                  <p className="text-muted-foreground">
                    Abre la pestaña <strong>Actions</strong> en GitHub &gt; <strong>Compilar FarmaciaDB Android APK Nativo</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[11px]">
                    3
                  </span>
                  <p className="text-muted-foreground">
                    Descarga el artefacto <code className="text-emerald-400">FarmaciaDB-Nativo-APK</code> que contiene <code className="text-emerald-400">FarmaciaDB-Nativo.apk</code> listo para instalar.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Este APK es 100% nativo en Kotlin: no usa Chrome ni WebView.</span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Quick QR */}
          <TabsContent value="qr" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Vista previa web rápida en teléfono
              </p>
              <div className="inline-block p-3.5 rounded-2xl bg-white shadow-xl border border-slate-200 my-3">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code Android" className="w-44 h-44 mx-auto rounded-lg" />
                ) : (
                  <div className="w-44 h-44 grid place-items-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                <input
                  readOnly
                  value={appUrl}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-muted/70 border border-border text-muted-foreground text-center sm:text-left select-all"
                />
                <Button size="sm" variant="outline" onClick={copyUrl} className="shrink-0 gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
