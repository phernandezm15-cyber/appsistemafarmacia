import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  BookOpen, FileText, Printer, Download, Sparkles, 
  ExternalLink, ArrowLeft, CheckCircle2, Bookmark,
  Layers, Database, Workflow, ShieldCheck, Terminal,
  ShoppingCart, Package, Users, Truck, FileBarChart, HardDrive,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { ManualTecnico } from "@/components/manuales/ManualTecnico";
import { ManualUsuario } from "@/components/manuales/ManualUsuario";
import { 
  downloadManualTecnicoPDF, 
  downloadManualUsuarioPDF, 
  downloadVisualManualPDF 
} from "@/lib/manuales-pdf";

export const Route = createFileRoute("/_app/manuales")({
  head: () => ({
    meta: [
      { title: "Manuales del Sistema — FarmaciaDB" },
      { name: "description", content: "Manual Técnico y Manual de Usuario de FarmaciaDB con descarga directa a PDF visual con capturas." },
      { property: "og:title", content: "Manuales del Sistema — FarmaciaDB" },
      { property: "og:description", content: "Manual Técnico y Manual de Usuario de FarmaciaDB con descarga directa a PDF visual con capturas." },
    ],
  }),
  component: ManualesPage,
});

function ManualesPage() {
  const [tab, setTab] = useState<"tecnico" | "usuario">("tecnico");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qTab = params.get("tab");
      if (qTab === "tecnico" || qTab === "usuario") {
        setTab(qTab);
      }
    } catch {}
  }, []);

  // Descarga del manual visual tal como aparece en pantalla con capturas y estilos
  const handleDownloadSpecific = async (targetTab: "tecnico" | "usuario") => {
    if (downloading) return;
    setDownloading(true);

    if (tab !== targetTab) {
      setTab(targetTab);
      // Esperar brevemente a que React actualice el DOM de la pestaña seleccionada
      await new Promise((r) => setTimeout(r, 400));
    }

    const filename = targetTab === "tecnico" ? "Manual_Tecnico_FarmaciaDB.pdf" : "Manual_Usuario_FarmaciaDB.pdf";
    const title = targetTab === "tecnico" ? "Manual Técnico" : "Manual de Usuario";

    toast.info(`Generando PDF visual con capturas de ${title}...`, {
      description: "Procesando capturas de pantalla, colores y tablas en alta resolución.",
    });

    try {
      await downloadVisualManualPDF("manual-printable", filename);
      toast.success(`¡${title} descargado con éxito!`, {
        description: `Se guardó '${filename}' idéntico a la vista en pantalla.`,
      });
    } catch (err: any) {
      console.warn("Fallo renderizado canvas, usando generador estructurado de respaldo:", err);
      if (targetTab === "tecnico") {
        downloadManualTecnicoPDF();
      } else {
        downloadManualUsuarioPDF();
      }
      toast.success(`Descarga completada: ${filename}`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    toast.info("Generando vista de impresión...", {
      description: "Seleccione 'Guardar como PDF' en el destino de su navegador.",
    });
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabecera Web (Oculta al imprimir) */}
      <div className="no-print space-y-4">
        <PageHeader
          title="Manuales y Documentación Oficial"
          subtitle="Centro interactivo de entrega académica con descarga directa de PDFs con capturas reales y formato idéntico a la pantalla."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => handleDownloadSpecific("tecnico")}
                disabled={downloading}
                variant="outline"
                size="sm"
                className="border-sky-500/40 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold gap-1.5 shadow-xs"
              >
                {downloading && tab === "tecnico" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>Descargar M. Técnico (PDF)</span>
              </Button>

              <Button
                onClick={() => handleDownloadSpecific("usuario")}
                disabled={downloading}
                variant="outline"
                size="sm"
                className="border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold gap-1.5 shadow-xs"
              >
                {downloading && tab === "usuario" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>Descargar M. Usuario (PDF)</span>
              </Button>

              <Button
                onClick={() => handleDownloadSpecific(tab)}
                disabled={downloading}
                className="bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all gap-2"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Descargar {tab === "tecnico" ? "Manual Técnico" : "Manual de Usuario"} (Visual)</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                title="Imprimir con Navegador"
                aria-label="Imprimir vista"
              >
                <Printer className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          }
        />

        {/* Barra de Pestañas y Navegación Rápida */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-border bg-card p-2.5 shadow-xs">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "tecnico" | "usuario")} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-2 w-full md:w-[420px]">
              <TabsTrigger value="tecnico" className="flex items-center gap-2 text-xs font-semibold">
                <FileText className="h-4 w-4 text-sky-500" />
                <span>Manual Técnico</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 ml-1">Arquitectura</Badge>
              </TabsTrigger>
              <TabsTrigger value="usuario" className="flex items-center gap-2 text-xs font-semibold">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <span>Manual de Usuario</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 ml-1">Paso a Paso</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Atajos de Secciones */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground px-2">
            <Bookmark className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-[11px]">Secciones:</span>
            {tab === "tecnico" ? (
              <>
                <a href="#herramientas" className="hover:text-primary transition-colors underline-offset-2 hover:underline">1. Stack</a>
                <span>•</span>
                <a href="#arquitectura" className="hover:text-primary transition-colors underline-offset-2 hover:underline">2. Arquitectura</a>
                <span>•</span>
                <a href="#erd" className="hover:text-primary transition-colors underline-offset-2 hover:underline">3. ERD</a>
                <span>•</span>
                <a href="#endpoints" className="hover:text-primary transition-colors underline-offset-2 hover:underline">4. REST API</a>
                <span>•</span>
                <a href="#seguridad" className="hover:text-primary transition-colors underline-offset-2 hover:underline">5. RBAC</a>
                <span>•</span>
                <a href="#ia-investigacion" className="hover:text-primary transition-colors underline-offset-2 hover:underline text-purple-600 font-semibold">6. Inv. IA</a>
                <span>•</span>
                <a href="#evidencias" className="hover:text-primary transition-colors underline-offset-2 hover:underline text-emerald-600 font-semibold">7. Capturas</a>
              </>
            ) : (
              <>
                <a href="#login" className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline">1. Login</a>
                <span>•</span>
                <a href="#dashboard" className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline">2. Dashboard</a>
                <span>•</span>
                <a href="#pos" className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline">3. POS con IA</a>
                <span>•</span>
                <a href="#inventario" className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline">4. Inventario</a>
                <span>•</span>
                <a href="#reportes" className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline">7. Corte</a>
                <span>•</span>
                <a href="#entrega" className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline font-bold text-emerald-600">9. PDF</a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor Imprimible del Manual Seleccionado */}
      <main id="manual-printable" className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Cabecera Exclusiva de Impresión */}
        <div className="hidden print:block mb-8 pb-4 border-b border-gray-300">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>FARMACIADB — SISTEMA DE GESTIÓN FARMACÉUTICA EN LA NUBE</span>
            <span>ENTREGA DE PROYECTO 2026</span>
          </div>
        </div>

        {tab === "tecnico" ? (
          <ManualTecnico />
        ) : (
          <ManualUsuario />
        )}

        {/* Pie de Página de Impresión */}
        <div className="hidden print:block mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>FarmaciaDB Cloud • Desarrollado con React 19, Express, Google Cloud SQL PostgreSQL y Google Gemini 2.5 Flash</p>
          <p>Documento de Entrega Académica • {new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </main>
    </div>
  );
}
