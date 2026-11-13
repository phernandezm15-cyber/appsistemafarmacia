import { useEffect, useState } from "react";
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
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
import JSZip from "jszip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AndroidApkHubModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
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

  const studioCommands = `npm install
npm install @capacitor/core @capacitor/android @capacitor/cli
npm run build
npx cap add android
npx cap sync android
npx cap open android`;

  const copyStudioCommands = () => {
    navigator.clipboard.writeText(studioCommands);
    setCopiedCmd(true);
    toast.success("Comandos copiados");
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const downloadAndroidProjectZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();

      const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="FarmaciaDB"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

      // Standalone Capacitor config: bundles compiled app locally inside the APK (no remote website wrapper!)
      const capacitorConfig = {
        appId: "gt.farmaciadb.app",
        appName: "FarmaciaDB",
        webDir: "dist",
        bundledWebRuntime: false,
        server: {
          androidScheme: "https",
          cleartext: true,
        },
        android: {
          allowMixedContent: true,
          captureInput: true,
          webContentsDebuggingEnabled: true,
        },
      };

      // Native MainActivity with runtime Microphone & Camera permission bridge for Android APK
      const mainActivityJava = `package gt.farmaciadb.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERM_REQUEST_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestRuntimePermissions();
    }

    @Override
    public void onStart() {
        super.onStart();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> request.grant(request.getResources()));
                }
            });
        }
    }

    private void requestRuntimePermissions() {
        String[] needed = new String[] {
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA
        };
        List<String> toRequest = new ArrayList<>();
        for (String p : needed) {
            if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                toRequest.add(p);
            }
        }
        if (!toRequest.isEmpty()) {
            ActivityCompat.requestPermissions(this, toRequest.toArray(new String[0]), PERM_REQUEST_CODE);
        }
    }
}`;

      const readmeMd = `# FarmaciaDB - Compilar APK Android Nativo (Standalone)

Esta configuración empaqueta toda la aplicación dentro del archivo **.apk** (sin depender de Chrome ni abrir un sitio web).

## Cómo generar el APK real en tu computadora con Android Studio:
1. Abre una terminal en la carpeta raíz de tu proyecto (clonado de GitHub).
2. Copia estos archivos dentro de la raíz (si aún no los tienes) y ejecuta:
   \`\`\`bash
   npm install
   npm install @capacitor/core @capacitor/android @capacitor/cli
   npm run build
   npx cap add android
   npx cap sync android
   npx cap open android
   \`\`\`
3. En **Android Studio**, espera que termine Gradle Sync y haz clic en:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. Tu instalador real estará en:
   \`android/app/build/outputs/apk/debug/app-debug.apk\`

## Cómo generar el APK automático desde GitHub (Sin instalar Android Studio):
El repositorio ya incluye \`.github/workflows/build-apk.yml\`.
Cada vez que hagas push a \`main\`, ve en GitHub a la pestaña **Actions > Compilar FarmaciaDB Android APK** y descarga el archivo **FarmaciaDB-Android-APK**.
`;

      zip.file("capacitor.config.json", JSON.stringify(capacitorConfig, null, 2));
      zip.file("README-COMPILAR-APK-NATIVO.md", readmeMd);
      zip.file("android-overrides/AndroidManifest.xml", manifestXml);
      zip.file("android-overrides/MainActivity.java", mainActivityJava);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FarmaciaDB-Native-APK-Config.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Paquete nativo Android descargado", {
        description: "Incluye capacitor.config.json (empaquetado local), MainActivity.java con permisos de micrófono/cámara y guía.",
      });
    } catch (e: any) {
      console.error("Error creating zip:", e);
      toast.error("Error al generar el paquete Android: " + (e?.message || e));
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
            <span>Compilar APK Android</span>
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
                Generador de APK Nativo Android
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium text-xs">
                  APK Standalone Real
                </Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Empaqueta la app completa dentro de un archivo .apk instalable (sin abrir navegador ni depender de acceso web).
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="github" className="mt-4">
          <TabsList className="grid grid-cols-3 bg-muted/60 p-1 rounded-2xl">
            <TabsTrigger value="github" className="rounded-xl text-xs font-semibold gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              <span>APK en GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="studio" className="rounded-xl text-xs font-semibold gap-1.5">
              <FolderArchive className="h-3.5 w-3.5" />
              <span>Android Studio</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="rounded-xl text-xs font-semibold gap-1.5">
              <QrCode className="h-3.5 w-3.5" />
              <span>Vista Previa QR</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Automatic GitHub Actions APK Build */}
          <TabsContent value="github" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    Compilación automática de FarmaciaDB.apk en GitHub
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Como ya tienes el proyecto en GitHub, agregamos el flujo automático{" "}
                    <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code> que compila el APK real con Java 17 y Android SDK en la nube sin instalar nada en tu PC.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/60 border border-border/60">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[11px]">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Sube estos archivos actualizados a tu repositorio de GitHub</p>
                    <p className="text-muted-foreground">
                      Incluye <code className="text-primary">.github/workflows/build-apk.yml</code> y{" "}
                      <code className="text-primary">capacitor.config.json</code> (ya configurados para app nativa offline).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/60 border border-border/60">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[11px]">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Abre la pestaña "Actions" en tu GitHub</p>
                    <p className="text-muted-foreground">
                      Entra a <strong>Compilar FarmaciaDB Android APK</strong> (se ejecuta automático al hacer push o al pulsar <em>Run workflow</em>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/60 border border-border/60">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[11px]">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Descarga tu archivo ejecutable FarmaciaDB.apk</p>
                    <p className="text-muted-foreground">
                      En la sección <strong>Artifacts</strong> baja <code className="text-emerald-400">FarmaciaDB-Android-APK</code>, descomprime el <code className="text-emerald-400">FarmaciaDB.apk</code> y envíalo por WhatsApp o USB a cualquier teléfono Android.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  El APK generado empaqueta el código completo dentro de la app con permisos nativos de micrófono (búsqueda por voz) y cámara (escáner de códigos).
                </span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Android Studio Native APK */}
          <TabsContent value="studio" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-500" />
                  Compilar archivo .apk en tu PC con Android Studio
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Usa Capacitor para empaquetar los archivos compilados (<code className="text-primary">dist/</code>) dentro de un proyecto nativo Java/Gradle y generar tu <code className="text-emerald-400">app-debug.apk</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-primary">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Ejecuta en la carpeta de tu repositorio:</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={copyStudioCommands} className="h-7 text-[11px] gap-1">
                    {copiedCmd ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCmd ? "Copiado" : "Copiar"}</span>
                  </Button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {studioCommands}
                </pre>
                <p className="text-muted-foreground text-[11px]">
                  Luego en Android Studio haz clic en <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> para obtener{" "}
                  <code className="text-emerald-400">android/app/build/outputs/apk/debug/app-debug.apk</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-muted/30 border border-border/50">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>App embebida 100% en el APK (sin URL web)</span>
                </div>
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-muted/30 border border-border/50">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Permisos nativos de Voz y Cámara en MainActivity</span>
                </div>
              </div>

              <Button
                onClick={downloadAndroidProjectZip}
                disabled={downloadingZip}
                className="w-full gap-2 bg-primary hover:bg-primary/90 font-bold py-5 text-sm"
              >
                {downloadingZip ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Empaquetando configuración nativa...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Descargar Config Nativa Android & Guía (.zip)</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: Quick QR Preview for Testing */}
          <TabsContent value="qr" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Prueba rápida en teléfono antes de compilar el APK
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                Escanea este código con tu teléfono Android para verificar botones, búsqueda por voz y diseño táctil en vivo antes de generar el instalador .apk.
              </p>

              <div className="inline-block p-3.5 rounded-2xl bg-white shadow-xl border border-slate-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code Android" className="w-48 h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="w-48 h-48 grid place-items-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
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
