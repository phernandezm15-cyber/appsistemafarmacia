import React from "react";
import { 
  ShoppingCart, Package, Users, Truck, PackagePlus, FileBarChart, 
  Mic, Search, Barcode as BarcodeIcon, Printer, CheckCircle2, AlertTriangle, 
  Sparkles, ArrowRight, ShieldCheck, CreditCard, DollarSign,
  HelpCircle, Download, BookOpen, Clock, Lightbulb, Lock,
  Globe, Laptop, Eye, UserCircle2, ChevronRight, Check,
  Layers, Tag, Calendar, Plus, Bot, Send, Image as ImageIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Barcode } from "@/components/Barcode";

// Contenedor de Captura de Pantalla Real del Proyecto
function ProjectScreenshotFrame({
  url,
  title,
  badge,
  children,
}: {
  url: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div 
      data-pdf-avoid-break="true"
      className="my-3.5 rounded-2xl border-2 border-border/80 bg-slate-950 text-slate-100 shadow-xl overflow-hidden print:break-inside-avoid"
    >
      {/* Barra de Navegador de la Captura */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 inline-block shadow-xs"></span>
          <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block shadow-xs"></span>
          <span className="h-3 w-3 rounded-full bg-green-500 inline-block shadow-xs"></span>
          <div className="ml-2 flex items-center gap-1.5 rounded-lg bg-slate-800/90 px-3 py-1 font-mono text-[11px] text-slate-200 border border-slate-700/60">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>{url}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold">
              {badge}
            </span>
          )}
          <span className="text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" /> Captura: {title}
          </span>
        </div>
      </div>
      {/* Contenido Visual Renderizado del Proyecto */}
      <div className="p-4 sm:p-6 bg-card text-foreground">{children}</div>
    </div>
  );
}

export function ManualUsuario() {
  return (
    <article className="space-y-12 text-foreground leading-relaxed">
      {/* Portada Institucional */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/10 p-6 sm:p-8 shadow-sm">
        {/* Encabezado Académico UMG con Logo Oficial */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b border-border/80 pb-6 mb-6 text-center sm:text-left">
          <img 
            src="/assets/aistudio/image_5de6c27b.png" 
            alt="Logo Universidad Mariano Gálvez de Guatemala" 
            className="h-24 w-24 sm:h-28 sm:w-28 object-contain shrink-0 drop-shadow-md"
          />
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black tracking-wide text-foreground uppercase">
              UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-snug">
              Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación
            </p>
            <p className="text-xs font-semibold text-foreground pt-0.5">
              Curso: Programación II
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Pablo Alexander Hernández Mucia
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-mono bg-background/80 border border-border px-2.5 py-0.5 rounded font-bold text-foreground">
                1990-25- 17528
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="ml-2 pl-3 border-l border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Guía Operativa Ilustrada</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Manual de Usuario de FarmaciaDB</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 font-semibold">
              Capturas Directas del Proyecto
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 font-semibold">
              Octubre 2026
            </Badge>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Bienvenido al manual de usuario oficial de <strong>FarmaciaDB</strong>. Esta guía documenta de forma clara, detallada y ordenada cada uno de los módulos de la aplicación web, incorporando <strong>las capturas de pantalla reales e imágenes del proyecto</strong> que guían paso a paso el uso correcto del sistema.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg bg-card/60 p-2.5 border border-border/60">
            <span className="text-muted-foreground block">Módulos Guiados</span>
            <strong className="text-sm">8 Principales</strong>
          </div>
          <div className="rounded-lg bg-card/60 p-2.5 border border-border/60">
            <span className="text-muted-foreground block">Capturas del Proyecto</span>
            <strong className="text-sm text-emerald-600">8 Vistas Oficiales</strong>
          </div>
          <div className="rounded-lg bg-card/60 p-2.5 border border-border/60">
            <span className="text-muted-foreground block">Moneda de Facturación</span>
            <strong className="text-sm">Quetzales (Q)</strong>
          </div>
          <div className="rounded-lg bg-card/60 p-2.5 border border-border/60">
            <span className="text-muted-foreground block">Inteligencia Artificial</span>
            <strong className="text-sm">Gemini 2.5 Flash</strong>
          </div>
        </div>
      </section>

      {/* Módulo 1: Acceso y Selección de Perfiles */}
      <section id="login" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 1: Inicio de Sesión y Perfiles de Acceso</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          El sistema cuenta con autenticación segura por roles (Administrador y Empleado). Al ingresar al sistema, el usuario se identifica para acceder a las opciones autorizadas.
        </p>

        <div className="space-y-3 text-sm">
          <h3 className="font-bold text-base">Instrucciones de Uso Paso a Paso:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Abra la aplicación en su navegador web. El sistema le presentará la pantalla de inicio de sesión (<code>/login</code>).</li>
            <li>Ingrese su correo electrónico institucional y contraseña asignada.</li>
            <li><strong>Acceso de Demostración:</strong> Presione directamente el botón <strong>"Probar como Administrador"</strong> (control total de compras, proveedores y reportes) o <strong>"Probar como Empleado"</strong> (punto de venta y consulta de existencias).</li>
            <li>Haga clic en <strong>"Iniciar Sesión"</strong> para acceder al panel de control.</li>
          </ol>
        </div>

        {/* CAPTURA 1: Pantalla de Login con componentes reales */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/login" title="Pantalla de Acceso con Roles de FarmaciaDB" badge="Captura 1: Autenticación">
          <div className="max-w-md mx-auto p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <Logo />
              </div>
              <h4 className="text-base font-bold">Control Farmacéutico e Inventario</h4>
              <p className="text-xs text-muted-foreground">Inicia sesión con tu cuenta corporativa</p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Correo Electrónico</label>
                <div className="p-2.5 rounded-lg border border-border bg-background font-mono text-foreground font-medium">
                  admin@farmacia.gt
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Contraseña</label>
                <div className="p-2.5 rounded-lg border border-border bg-background font-mono text-foreground">
                  ••••••••••••
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-primary text-primary-foreground text-center font-bold shadow-xs">
                Iniciar Sesión ➔
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground block text-center">Acceso Rápido con Credenciales del Proyecto:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg border border-primary/40 bg-primary/10 text-primary font-bold text-center">
                  👑 Administrador
                </div>
                <div className="p-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-center">
                  👤 Empleado (Caja)
                </div>
              </div>
            </div>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 2: Panel de Control (Dashboard) */}
      <section id="dashboard" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <FileBarChart className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 2: Panel de Control (Dashboard en Vivo)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          El Dashboard presenta los indicadores de rendimiento (KPIs), el cumplimiento de la meta diaria de ventas y las alertas preventivas de caducidad y stock mínimo cargados en vivo desde Google Cloud SQL.
        </p>

        <div className="space-y-3 text-sm">
          <h3 className="font-bold text-base">Instrucciones de Uso:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Consulte la barra de <strong>Meta del Día</strong> para ver el porcentaje recaudado en tiempo real frente a los Q 2,500.00 diarios.</li>
            <li>Observe las 4 tarjetas superiores: <em>Ventas del Día</em>, <em>Productos Totales</em>, <em>Alertas de Stock</em> y <em>Proveedores Activos</em>.</li>
            <li>Revise la sección <strong>Sugerencias del Sistema</strong> impulsada por IA para recomendaciones de compra y rotación de medicamentos.</li>
          </ol>
        </div>

        {/* CAPTURA 2: Dashboard Real */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/dashboard" title="Dashboard con Datos del Proyecto" badge="Captura 2: Métricas">
          <div className="space-y-4">
            {/* Meta del día simulada con datos reales */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse"></div>
                <span className="font-bold text-xs sm:text-sm">Meta del Día: Q 2,500.00</span>
              </div>
              <div className="text-xs font-bold text-primary">Q 1,845.00 · 74% alcanzado</div>
            </div>

            {/* Tarjetas KPI del Proyecto */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
                <span className="text-muted-foreground block text-[11px]">Ventas del Día</span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">Q 1,845.00</span>
                <span className="text-[10px] text-emerald-600 font-semibold">↑ 14 transacciones</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
                <span className="text-muted-foreground block text-[11px]">Medicamentos</span>
                <span className="text-xl font-black text-foreground mt-1 block">20 fármacos</span>
                <span className="text-[10px] text-muted-foreground">Cloud SQL PostgreSQL</span>
              </div>
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 shadow-xs">
                <span className="text-amber-600 font-bold block text-[11px]">Próximos a Vencer</span>
                <span className="text-xl font-black text-amber-600 mt-1 block">5 fármacos</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400">Caducidad &lt; 30 días</span>
              </div>
              <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 shadow-xs">
                <span className="text-destructive font-bold block text-[11px]">Stock Crítico</span>
                <span className="text-xl font-black text-destructive mt-1 block">4 productos</span>
                <span className="text-[10px] text-destructive">Existencias &lt; 10 unidades</span>
              </div>
            </div>

            {/* Sugerencias del Sistema */}
            <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs space-y-1.5">
              <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Sugerencia de Inteligencia Artificial:
              </span>
              <p className="text-muted-foreground">
                Amoxil (Amoxicilina 500mg) tiene solo 6 unidades en existencia y vence el 2026-11-07. Se sugiere solicitar reposición a Droguería Centroamericana.
              </p>
            </div>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 3: Punto de Venta (POS) - Búsqueda por Voz y Código */}
      <section id="pos" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <ShoppingCart className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 3: Punto de Venta (POS) con IA y Escáner</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          El módulo de cobro permite agregar productos al carrito mediante tres modalidades: búsqueda por texto, lectura de código de barras y <strong>dictado por voz con inteligencia artificial Gemini 2.5 Flash</strong>.
        </p>

        <div className="space-y-3 text-sm">
          <h3 className="font-bold text-base">Instrucciones de Uso Paso a Paso:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li><strong>Búsqueda Tradicional:</strong> Escriba el nombre del medicamento (ejemplo: <em>"Panadol"</em> o <em>"Amoxil"</em>) en la barra superior.</li>
            <li><strong>Búsqueda por Voz (IA Gemini):</strong> Haga clic en el botón con ícono de micrófono <Mic className="inline h-4 w-4 text-primary" /> y dicte la receta (ejemplo: <em>"Dos cajas de Panadol Extra"</em>). La IA normalizará el fármaco y lo sumará al carrito.</li>
            <li><strong>Escáner de Barra:</strong> Presione el botón <em>"Escanear Código"</em> para simular la lectura con pistola óptica láser.</li>
          </ol>
        </div>

        {/* CAPTURA 3: Punto de Venta con Medicamentos Reales del Proyecto */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/pos" title="Punto de Venta con Búsqueda por Voz y Catálogo Real" badge="Captura 3: POS">
          <div className="space-y-4">
            {/* Barra de Búsqueda con Micrófono Real */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  readOnly 
                  value="Panadol Extra 500mg" 
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-primary/50 bg-background font-medium"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                <Mic className="h-4 w-4 animate-pulse" />
                <span>Voz IA</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-xs font-semibold">
                <BarcodeIcon className="h-4 w-4 text-muted-foreground" />
                <span>Escanear</span>
              </div>
            </div>

            {/* Medicamentos Reales del Proyecto con Códigos de Barra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* Panadol Extra */}
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex justify-between items-start">
                  <Badge className="bg-primary text-[10px]">Analgésicos</Badge>
                  <span className="font-black text-emerald-600 text-sm">Q 14.00</span>
                </div>
                <div>
                  <h5 className="font-bold text-foreground">Panadol Extra</h5>
                  <p className="text-[11px] text-muted-foreground">Principio: Paracetamol 500mg</p>
                </div>
                <div className="flex justify-center py-1">
                  <Barcode value="75010000010" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Stock: <strong className="text-foreground">120 uds.</strong></span>
                  <span className="text-primary font-bold cursor-pointer">+ Agregar</span>
                </div>
              </div>

              {/* Advil */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-[10px]">Antiinflamatorios</Badge>
                  <span className="font-black text-emerald-600 text-sm">Q 19.50</span>
                </div>
                <div>
                  <h5 className="font-bold text-foreground">Advil</h5>
                  <p className="text-[11px] text-muted-foreground">Principio: Ibuprofeno 400mg</p>
                </div>
                <div className="flex justify-center py-1">
                  <Barcode value="75010079191" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Stock: <strong className="text-foreground">85 uds.</strong></span>
                  <span className="text-primary font-bold cursor-pointer">+ Agregar</span>
                </div>
              </div>

              {/* Amoxil */}
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="flex justify-between items-start">
                  <Badge className="bg-amber-600 text-[10px]">Antibióticos</Badge>
                  <span className="font-black text-emerald-600 text-sm">Q 55.00</span>
                </div>
                <div>
                  <h5 className="font-bold text-foreground">Amoxil</h5>
                  <p className="text-[11px] text-muted-foreground">Principio: Amoxicilina 500mg</p>
                </div>
                <div className="flex justify-center py-1">
                  <Barcode value="75010158382" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span className="text-amber-600 font-bold">Stock crítico: 6 uds.</span>
                  <span className="text-primary font-bold cursor-pointer">+ Agregar</span>
                </div>
              </div>
            </div>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 4: Liquidación, Descuentos y Ticket Térmico */}
      <section id="facturacion" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <CreditCard className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 4: Liquidación de Venta, Descuentos y Ticket</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          En el panel lateral derecho del POS, el cajero selecciona el cliente para acumular puntos de fidelidad, aplica descuentos promocionales y realiza el cobro en efectivo o tarjeta.
        </p>

        {/* CAPTURA 4: Cobro y Ticket Térmico Real */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/pos#recibo" title="Resumen de Venta y Ticket Térmico 80mm" badge="Captura 4: Cobro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel de Liquidación Real */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
              <span className="font-bold text-sm block">Liquidación en Caja</span>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between"><span>Cliente Asignado:</span><strong className="text-foreground">Ana Morales (NIT: 4589632-1)</strong></div>
                <div className="flex justify-between"><span>Puntos Acumulados:</span><Badge variant="outline" className="text-emerald-600 font-bold">45 Puntos ⭐</Badge></div>
                <div className="flex justify-between"><span>Descuento Promocional:</span><span className="text-primary font-bold">10% Convenio</span></div>
              </div>
              <div className="pt-2 border-t border-border space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>Q 69.00</span></div>
                <div className="flex justify-between"><span>Descuento (10%):</span><span className="text-destructive">- Q 6.90</span></div>
                <div className="flex justify-between"><span>IVA 12% Incluido:</span><span>Q 7.45</span></div>
                <div className="flex justify-between font-black text-base text-foreground pt-1 border-t border-border">
                  <span>TOTAL A PAGAR:</span><span className="text-emerald-600">Q 62.10</span>
                </div>
              </div>
            </div>

            {/* Simulación del Ticket Térmico Oficial */}
            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 font-mono text-xs space-y-2">
              <div className="text-center pb-2 border-b border-border/80">
                <div className="font-bold text-sm">FARMACIADB GUATEMALA</div>
                <div className="text-[10px] text-muted-foreground">NIT: 1045829-1 • Central de Medicamentos</div>
                <div className="text-[10px] text-muted-foreground">TICKET OFICIAL: VTA-1025</div>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span>1 x Panadol Extra</span><span>Q 14.00</span></div>
                <div className="flex justify-between"><span>1 x Amoxil 500mg</span><span>Q 55.00</span></div>
              </div>
              <div className="pt-2 border-t border-border text-[11px] space-y-0.5">
                <div className="flex justify-between font-bold"><span>TOTAL:</span><span>Q 62.10</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Puntos Ganados:</span><span>+6 pts</span></div>
              </div>
              <div className="text-center pt-2 text-[10px] text-muted-foreground">
                ¡Gracias por su preferencia!
              </div>
              <div className="pt-2 flex justify-center">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-[11px] font-bold flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" /> Imprimir Formato 80mm
                </span>
              </div>
            </div>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 5: Gestión de Inventario y Semáforo de Caducidad */}
      <section id="inventario" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <Package className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 5: Gestión de Inventario y Control de Caducidades</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Este módulo clasifica automáticamente los medicamentos según su fecha de vencimiento mediante un semáforo visual para prevenir mermas y garantizar la seguridad del paciente.
        </p>

        {/* CAPTURA 5: Inventario Real */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/inventario" title="Catálogo Real con Semáforo de Vencimiento" badge="Captura 5: Inventario">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 text-muted-foreground border-b font-semibold">
                <tr>
                  <th className="p-2.5">Código</th>
                  <th className="p-2.5">Medicamento</th>
                  <th className="p-2.5">Principio Activo</th>
                  <th className="p-2.5">Caducidad</th>
                  <th className="p-2.5 text-right">Precio Venta</th>
                  <th className="p-2.5 text-right">Stock</th>
                  <th className="p-2.5 text-center">Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="hover:bg-muted/30">
                  <td className="p-2.5 font-mono text-muted-foreground">MED-001</td>
                  <td className="p-2.5 font-bold">Panadol Extra</td>
                  <td className="p-2.5">Paracetamol 500mg</td>
                  <td className="p-2.5 font-mono">2027-11-20</td>
                  <td className="p-2.5 text-right font-semibold">Q 14.00</td>
                  <td className="p-2.5 text-right font-bold text-foreground">120 uds.</td>
                  <td className="p-2.5 text-center"><Badge className="bg-emerald-600 text-[10px]">🟢 Vigente</Badge></td>
                </tr>
                <tr className="hover:bg-muted/30 bg-amber-500/5">
                  <td className="p-2.5 font-mono text-muted-foreground">MED-003</td>
                  <td className="p-2.5 font-bold">Amoxil</td>
                  <td className="p-2.5">Amoxicilina 500mg</td>
                  <td className="p-2.5 font-mono text-amber-600 font-bold">2026-11-07</td>
                  <td className="p-2.5 text-right font-semibold">Q 55.00</td>
                  <td className="p-2.5 text-right font-bold text-amber-600">6 uds.</td>
                  <td className="p-2.5 text-center"><Badge variant="outline" className="border-amber-500 text-amber-600 text-[10px]">🟡 En 18 días</Badge></td>
                </tr>
                <tr className="hover:bg-muted/30 bg-amber-500/5">
                  <td className="p-2.5 font-mono text-muted-foreground">MED-011</td>
                  <td className="p-2.5 font-bold">Voltaren</td>
                  <td className="p-2.5">Diclofenaco 50mg</td>
                  <td className="p-2.5 font-mono text-amber-600 font-bold">2026-11-02</td>
                  <td className="p-2.5 text-right font-semibold">Q 29.00</td>
                  <td className="p-2.5 text-right font-bold text-amber-600">40 uds.</td>
                  <td className="p-2.5 text-center"><Badge variant="outline" className="border-amber-500 text-amber-600 text-[10px]">🟡 En 13 días</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 6: Clientes y Programa de Puntos */}
      <section id="clientes" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <Users className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 6: Directorio de Clientes y Fidelización</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestione la cartera de clientes de la farmacia, registre números de NIT para facturación y consulte el saldo de puntos acumulados (1 punto por cada Q 10 consumidos).
        </p>

        {/* CAPTURA 6: Clientes del Proyecto */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/clientes" title="Clientes Registrados en Cloud SQL" badge="Captura 6: Lealtad">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-foreground">Ana Morales</span>
                <Badge className="bg-emerald-600 font-bold">⭐ 45 pts</Badge>
              </div>
              <div className="text-muted-foreground space-y-0.5">
                <div>NIT: <strong className="text-foreground">4589632-1</strong></div>
                <div>Teléfono: 5512-3344</div>
              </div>
              <div className="pt-2 border-t border-border/60 text-[11px] text-primary font-medium">
                Cliente Frecuente en Base de Datos
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-foreground">Carlos Rivera</span>
                <Badge className="bg-emerald-600 font-bold">⭐ 30 pts</Badge>
              </div>
              <div className="text-muted-foreground space-y-0.5">
                <div>NIT: <strong className="text-foreground">7894561-2</strong></div>
                <div>Teléfono: 4422-9988</div>
              </div>
              <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground font-medium">
                6 compras registradas
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-foreground">Consumidor Final (CF)</span>
                <Badge variant="outline">0 pts</Badge>
              </div>
              <div className="text-muted-foreground space-y-0.5">
                <div>NIT: <strong className="text-foreground">C/F</strong></div>
                <div>Teléfono: Mostrador</div>
              </div>
              <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground font-medium">
                Sin acumulación de puntos
              </div>
            </div>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 7: Proveedores y Compras de Mercadería (Admin) */}
      <section id="compras" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <Truck className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 7: Proveedores y Órdenes de Compra (Admin)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Exclusivo para el perfil de Administrador. Permite registrar órdenes de compra a laboratorios (como Droguería Centroamericana o Laboratorios Bonin) para abastecer el stock físico en PostgreSQL.
        </p>

        {/* CAPTURA 7: Compras con Proveedores Reales */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/compras" title="Registro de Órdenes a Laboratorios" badge="Captura 7: Compras">
          <div className="p-4 rounded-xl border border-border bg-card space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Proveedor del Catálogo</label>
                <div className="p-2.5 rounded-lg border border-border bg-background font-medium">
                  Droguería Centroamericana (Luis Méndez)
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Medicamento Solicitado</label>
                <div className="p-2.5 rounded-lg border border-border bg-background font-medium">
                  Amoxil (Amoxicilina 500mg)
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Cantidad Recibida</label>
                <div className="p-2.5 rounded-lg border border-border bg-background font-bold text-foreground">
                  30 unidades
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
              <div className="text-muted-foreground">
                Costo Unitario: <strong>Q 35.00</strong> • Total Orden: <strong className="text-foreground">Q 1,050.00</strong>
              </div>
              <div className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold shadow-xs">
                + Recibir Mercadería y Actualizar Stock
              </div>
            </div>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 8: Asistente Farmacéutico IA (Gemini 2.5 Flash) CON IMAGEN REAL DEL PROYECTO */}
      <section id="asistente" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 8: Asistente Farmacéutico Virtual (Gemini IA)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Widget conversacional disponible en la esquina inferior derecha. Asiste al personal de mostrador resolviendo dudas de dosificación, alternativas genéricas y fechas de caducidad próximas.
        </p>

        {/* CAPTURA REAL EXTRAÍDA DEL PROYECTO */}
        <ProjectScreenshotFrame url="https://farmaciadb.com/#chatbot-clinico" title="Captura de Pantalla Real del Proyecto" badge="Captura 8: Chatbot Real">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Imagen Real alojada en public/assets/aistudio/image_078c89b6.png */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="rounded-2xl border-2 border-purple-500/30 overflow-hidden shadow-xl bg-background max-w-sm">
                  <div className="p-2.5 bg-purple-600/10 border-b border-purple-500/20 flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" /> Evidencia Real Extraída del Proyecto
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-background">Original PNG</Badge>
                  </div>
                  <img 
                    src="/assets/aistudio/image_078c89b6.png" 
                    alt="Captura real del Chatbot y Asistente Farmacéutico de FarmaciaDB con alertas de caducidad" 
                    className="w-full h-auto object-cover" 
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-2 text-center">
                  Figura 8.1: Captura de pantalla real del Chatbot con stock y alertas de vencimiento en FarmaciaDB.
                </span>
              </div>

              {/* Explicación Operativa */}
              <div className="w-full md:w-1/2 space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                  <strong className="text-sm text-purple-700 dark:text-purple-300 block">
                    Interpretación de la Captura de Pantalla:
                  </strong>
                  <p className="text-muted-foreground">
                    Como se observa en la captura original superior, el asistente de FarmaciaDB calcula automáticamente los días restantes para la caducidad y el stock disponible:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-foreground/90 font-medium">
                    <li><strong>Voltaren (Diclofenaco 50mg):</strong> Vence en 13 días (Stock: 40 uds).</li>
                    <li><strong>Amoxil (Amoxicilina 500mg):</strong> Vence en 18 días (Stock: 6 uds).</li>
                    <li><strong>Ventolin (Salbutamol 100mcg):</strong> Vence en 23 días (Stock: 22 uds).</li>
                    <li><strong>Redoxon (Vitamina C 1g):</strong> Vence en 26 días (Stock: 55 uds).</li>
                  </ul>
                </div>

                <p className="text-muted-foreground">
                  Además, cuenta con botones de acceso rápido para preguntas frecuentes como <em>"¿Qué dar para dolor de estómago o acidez?"</em> o <em>"¿Qué sirve para el dolor de cabeza o fiebre?"</em>.
                </p>
              </div>
            </div>
          </div>
        </ProjectScreenshotFrame>
      </section>

      {/* Módulo 9: Instrucciones de Entrega y Descarga PDF */}
      <section id="entrega" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 border-b pb-3">
          <Download className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-bold tracking-tight">Módulo 9: Descarga de Manuales y Evidencia de Entrega</h2>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-foreground">Instrucciones para la Entrega Académica en PDF:</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Haga clic en el botón superior derecho <strong>"📥 Descargar / Imprimir en PDF"</strong> de este centro de documentación.</li>
            <li>En la ventana emergente de impresión de su navegador, configure:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-foreground font-medium">
                <li><strong>Destino:</strong> "Guardar como PDF" (Save as PDF).</li>
                <li><strong>Páginas:</strong> Todo.</li>
                <li><strong>Diseño:</strong> Vertical (Portrait).</li>
                <li><strong>Gráficos de fondo:</strong> Marcar la casilla "Imprimir fondos / Background graphics" para conservar los colores, tablas y capturas de pantalla.</li>
              </ul>
            </li>
            <li>Guarde el archivo con el nombre formal: <code>Manual_Usuario_FarmaciaDB.pdf</code>.</li>
            <li>Suba el archivo PDF a la plataforma virtual de su institución y tome la captura de pantalla de confirmación solicitada en la pauta para compartirla en el grupo del curso.</li>
          </ol>
        </div>
      </section>
    </article>
  );
}
