import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Wifi, 
  Signal, 
  Battery, 
  Sparkles,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AndroidApkHubModal } from "./AndroidApkHubModal";

interface Props {
  children: React.ReactNode;
}

export type DeviceModel = "pixel" | "galaxy" | "tablet";

export function AndroidSimulatorFrame({ children }: Props) {
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);
  const [device, setDevice] = useState<DeviceModel>("pixel");
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentTime, setCurrentTime] = useState("10:45");

  // Keep Android status bar clock updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const deviceDimensions = {
    pixel: isLandscape ? { w: 852, h: 393 } : { w: 393, h: 852 },
    galaxy: isLandscape ? { w: 915, h: 412 } : { w: 412, h: 915 },
    tablet: isLandscape ? { w: 1024, h: 768 } : { w: 768, h: 1024 },
  };

  const currentDim = deviceDimensions[device];

  return (
    <div className="relative min-h-screen w-full bg-slate-950">
      {/* Floating Control Bar for Android Simulation Mode */}
      <header className="fixed top-2 right-4 z-50 flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-2xl no-print text-xs text-slate-200">
        <Button
          variant={isSimulatorActive ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsSimulatorActive(!isSimulatorActive)}
          className={`h-8 gap-1.5 rounded-xl px-2.5 font-bold transition-all ${
            isSimulatorActive 
              ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md shadow-emerald-500/20" 
              : "hover:bg-slate-800 text-slate-300"
          }`}
          title="Alternar vista de dispositivo Android"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isSimulatorActive ? "Modo Android Activo" : "Simular Android"}
          </span>
        </Button>

        {isSimulatorActive && (
          <>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value as DeviceModel)}
              className="h-8 rounded-xl bg-slate-800 border border-slate-700 px-2 text-[11px] font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="pixel">Google Pixel 8</option>
              <option value="galaxy">Galaxy S24</option>
              <option value="tablet">Android Tablet</option>
            </select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLandscape(!isLandscape)}
              className="h-8 w-8 rounded-xl hover:bg-slate-800 text-slate-300"
              title="Girar orientación"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        <AndroidApkHubModal
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-xl px-2.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-medium"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Instalar / APK</span>
            </Button>
          }
        />
      </header>

      {/* Main Content: Normal Responsive Mode or Realistic Android Shell Frame */}
      {!isSimulatorActive ? (
        <div className="w-full min-h-screen">
          {children}
        </div>
      ) : (
        <div className="flex min-h-screen w-full items-center justify-center p-3 sm:p-6 lg:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-auto">
          {/* Outer Phone Shell */}
          <div
            style={{
              width: `${currentDim.w}px`,
              height: `${currentDim.h}px`,
              maxHeight: "94vh",
            }}
            className="relative flex flex-col rounded-[48px] border-[10px] border-slate-800 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden transition-all duration-300"
          >
            {/* Top Android Status Bar */}
            <div className="relative z-30 flex h-7 w-full shrink-0 items-center justify-between px-6 bg-slate-950 text-[11px] font-semibold text-slate-300 select-none">
              <span>{currentTime}</span>

              {/* Front Camera Punch-hole Notch */}
              <div className="absolute left-1/2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-slate-900 border border-slate-700/80 shadow-inner flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-800/80" />
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Signal className="h-3 w-3" />
                <Wifi className="h-3 w-3" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px]">98%</span>
                  <Battery className="h-3.5 w-3.5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Inner App Content Scrollable Container */}
            <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden bg-background">
              {children}
            </div>

            {/* Bottom Android Gesture Navigation Bar */}
            <div className="relative z-30 flex h-5 w-full shrink-0 items-center justify-center bg-slate-950 select-none">
              <div className="h-1 w-28 rounded-full bg-slate-600/70 hover:bg-slate-400 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
