import { Link, useRouterState } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileBarChart 
} from "lucide-react";

export function AndroidMobileBottomNav({ isAdmin }: { isAdmin: boolean }) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "POS Caja", url: "/pos", icon: ShoppingCart },
    { title: "Stock", url: "/inventario", icon: Package },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: isAdmin ? "Reportes" : "Corte", url: "/reportes", icon: FileBarChart },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 z-30 flex h-16 w-full items-center justify-around border-t border-border/80 bg-card/95 backdrop-blur-xl px-2 shadow-lg no-print">
      {navItems.map((item) => {
        const isActive = currentPath === item.url;
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            to={item.url}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
              isActive
                ? "text-primary font-bold scale-105"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-primary/15 text-primary" : ""}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
