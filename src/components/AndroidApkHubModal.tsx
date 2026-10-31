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
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  FolderArchive
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import JSZip from "jszip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function AndroidApkHubModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BIP | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    // Detect standalone PWA mode
    const standalone = window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for install prompt
    const h = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIP);
    };
    window.addEventListener("beforeinstallprompt", h);

    // Get current URL
    const currentUrl = window.location.origin;
    setAppUrl(currentUrl);

    // Generate QR code for mobile testing
    QRCode.toDataURL(currentUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).then(setQrDataUrl).catch((err) => console.error("QR Code Error:", err));

    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const handleInstallPWA = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        toast.success("¡FarmaciaDB instalada exitosamente en Android!");
        setIsStandalone(true);
      }
      setDeferred(null);
    } else {
      toast.info("Para instalar en Android:", {
        description: "Abre el menú de Chrome (3 puntos) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.",
      });
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAndroidProjectZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();

      // Android Manifest
      const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="gt.farmaciadb.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="FarmaciaDB"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FarmaciaDB"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:theme="@style/Theme.FarmaciaDB.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

      // capacitor.config.json
      const capacitorConfig = {
        appId: "gt.farmaciadb.app",
        appName: "FarmaciaDB",
        webDir: "dist",
        bundledWebRuntime: false,
        server: {
          url: appUrl,
          cleartext: true,
        },
        android: {
          allowMixedContent: true,
          captureInput: true,
          webContentsDebuggingEnabled: true,
        },
      };

      // MainActivity.java
      const mainActivityJava = `package gt.farmaciadb.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}`;

      // build.gradle (app)
      const buildGradle = `apply plugin: 'com.android.application'

android {
    namespace "gt.farmaciadb.app"
    compileSdkVersion 34
    defaultConfig {
        applicationId "gt.farmaciadb.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation project(':capacitor-android')
}`;

      // README instructions
      const readmeMd = `# FarmaciaDB Móvil - Generación de APK Android

Este paquete contiene la configuración completa y el proyecto base para compilar la aplicación **FarmaciaDB** en un archivo **.apk** instalable en cualquier dispositivo Android.

## Opción 1: Compilar APK con Android Studio (Recomendado)
1. Descomprime este archivo .zip.
2. Abre **Android Studio**.
3. Selecciona **Open** y abre la carpeta descomprimida.
4. Espera a que Gradle sincronice las dependencias.
5. Ve al menú superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Android Studio generará tu archivo **app-debug.apk** listo para instalar en tu celular.

## Opción 2: Generar APK en 1 comando con Bubblewrap (TWA Oficial de Google)
Bubblewrap convierte directamente la PWA en un APK nativo firmado:
\`\`\`bash
# 1. Instalar la herramienta oficial de Google
npm install -g @bubblewrap/cli

# 2. Inicializar el proyecto con la URL de FarmaciaDB
bubblewrap init --manifest="${appUrl}/manifest.json"

# 3. Compilar el APK
bubblewrap build
\`\`\`
El comando generará el archivo \`app-release-signed.apk\` listo para instalar o subir a Google Play Store.

## Opción 3: Compilar con Capacitor CLI
\`\`\`bash
npm install -g @capacitor/cli @capacitor/core @capacitor/android
npx cap add android
npx cap copy
npx cap open android
\`\`\`
`;

      zip.file("capacitor.config.json", JSON.stringify(capacitorConfig, null, 2));
      zip.file("README-COMO-COMPILAR-APK.md", readmeMd);
      zip.file("android/app/src/main/AndroidManifest.xml", manifestXml);
      zip.file("android/app/src/main/java/gt/farmaciadb/app/MainActivity.java", mainActivityJava);
      zip.file("android/app/build.gradle", buildGradle);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "FarmaciaDB-Android-APK-Project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Proyecto Android descargado con éxito", {
        description: "Contiene AndroidManifest.xml, Gradle y la guía completa para compilar tu APK.",
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
            <Smartphone className="h-4 w-4" />
            <span>App Android / APK</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Centro de App Android & APK
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium text-xs">
                  Android 14+ / PWA Ready
                </Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Prueba en tu móvil, instala la aplicación nativa o genera el archivo APK compilable.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="qr" className="mt-4">
          <TabsList className="grid grid-cols-3 bg-muted/60 p-1 rounded-2xl">
            <TabsTrigger value="qr" className="rounded-xl text-xs font-semibold gap-1.5">
              <QrCode className="h-3.5 w-3.5" />
              <span>Probar en Celular</span>
            </TabsTrigger>
            <TabsTrigger value="install" className="rounded-xl text-xs font-semibold gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Instalar WebAPK</span>
            </TabsTrigger>
            <TabsTrigger value="project" className="rounded-xl text-xs font-semibold gap-1.5">
              <FolderArchive className="h-3.5 w-3.5" />
              <span>Generar APK</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: QR & Live Mobile Test */}
          <TabsContent value="qr" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Escanea con la cámara de tu teléfono Android
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                Abre la cámara de tu smartphone o Google Lens para abrir la aplicación directamente en tu dispositivo con todas las funciones táctiles.
              </p>

              <div className="inline-block p-3.5 rounded-2xl bg-white shadow-xl border border-slate-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code Android" className="w-52 h-52 mx-auto rounded-lg" />
                ) : (
                  <div className="w-52 h-52 grid place-items-center text-muted-foreground">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 text-xs space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> 1. Escanear
                </span>
                <p className="text-muted-foreground">Apunta tu cámara al código QR y toca el enlace sugerido en Chrome.</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 text-xs space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5 text-cyan-500" /> 2. Instalar
                </span>
                <p className="text-muted-foreground">En el aviso inferior o menú (⋮), pulsa "Instalar aplicación".</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 text-xs space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 3. Listo
                </span>
                <p className="text-muted-foreground">Se creará el ícono en tu pantalla de inicio funcionando como app nativa.</p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: PWA WebAPK Direct Install */}
          <TabsContent value="install" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Estado de Instalación Android (WebAPK)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cumple al 100% los estándares de Progressive Web App de Google Play y Android.
                  </p>
                </div>
                {isStandalone ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Instalada
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Modo Navegador
                  </Badge>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
                <p className="font-semibold text-emerald-400">Ventajas de la App en Android:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Ejecución a pantalla completa sin barra de navegación
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Acceso táctil optimizado para cajeros y POS
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Cámara para escaneo de códigos de barra
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Micrófono para búsqueda clínica por voz
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleInstallPWA} 
                  className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 font-bold"
                >
                  <Download className="h-4 w-4" />
                  <span>{deferred ? "Instalar en este Dispositivo" : "Ver Instrucciones de Instalación"}</span>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                  <a href="/manifest.json" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span>Ver Manifest Android</span>
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: APK Project Zip & Compilation Guide */}
          <TabsContent value="project" className="space-y-4 pt-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-500" />
                  Descargar Paquete Android Studio / Capacitor
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Genera un archivo .zip completo con AndroidManifest.xml, Gradle, Capacitor y el código listo para compilar un archivo .apk independiente.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] text-primary">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Método 1: Crear APK con Bubblewrap (Oficial de Google):</span>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto">
{`npm i -g @bubblewrap/cli
bubblewrap init --manifest="${appUrl}/manifest.json"
bubblewrap build`}
                </pre>
                <p className="text-muted-foreground text-[11px]">
                  Generará automáticamente <code className="text-emerald-400">app-release-signed.apk</code> listo para instalar en cualquier teléfono.
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={downloadAndroidProjectZip} 
                  disabled={downloadingZip}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 font-bold py-5 text-sm"
                >
                  {downloadingZip ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Empaquetando archivos del proyecto...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Descargar Proyecto Android & Guía (.zip)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
