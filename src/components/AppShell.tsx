import { Link } from "@tanstack/react-router";
import {
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Droplets,
  PanelLeftClose,
  PanelLeftOpen,
  SprayCan,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Pátio", icon: Droplets, exact: true },
  { to: "/agenda", label: "Agenda", icon: CalendarDays, exact: false },
  { to: "/estoque", label: "Estoque", icon: Boxes, exact: false },
  { to: "/despesas", label: "Despesas", icon: Wallet, exact: false },
  { to: "/analise", label: "Análise", icon: CircleDollarSign, exact: false },
  { to: "/servicos", label: "Serviços", icon: SprayCan, exact: false },
] as const;


export function AppShell({
  children,
  theme = "sales",
}: {
  children: ReactNode;
  theme?: "sales" | "expense";
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("lcv:sidebar-collapsed") === "true");
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("lcv:sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className={cn("min-h-screen bg-background", theme === "expense" && "theme-expense")}>
      {/* Sidebar (desktop) */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 hidden h-screen flex-col border-r border-border bg-surface py-5 transition-[width,padding] duration-300 lg:flex",
          sidebarCollapsed ? "w-[4.5rem] px-3" : "w-60 px-4",
        )}
      >
        <div className={cn("flex min-h-12 items-start", sidebarCollapsed ? "justify-center" : "justify-between pl-2")}>
          {sidebarCollapsed ? (
            <span className="grid size-10 place-items-center rounded-xl bg-brand/15 font-display text-lg font-bold text-brand-light">
              V
            </span>
          ) : (
            <p className="font-display text-base font-semibold leading-tight">
              Lava-Car
              <br />
              <span className="text-brand-light">do Vitinho</span>
            </p>
          )}
          {!sidebarCollapsed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 text-muted-foreground"
              onClick={toggleSidebar}
              aria-label="Recolher menu lateral"
              title="Recolher menu"
            >
              <PanelLeftClose />
            </Button>
          )}
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              aria-label={label}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                "tap flex min-h-12 items-center rounded-xl text-sm font-medium text-muted-foreground data-[status=active]:bg-brand/15 data-[status=active]:text-brand-light",
                sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3",
              )}
            >
              <Icon className="size-5" />
              {!sidebarCollapsed && label}
            </Link>
          ))}
        </nav>
        {sidebarCollapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-auto size-12 self-center text-muted-foreground"
            onClick={toggleSidebar}
            aria-label="Abrir menu lateral"
            title="Abrir menu"
          >
            <PanelLeftOpen />
          </Button>
        )}
      </aside>

      <main
        className={cn(
          "w-full px-4 pt-5 pb-28 transition-[padding] duration-300 lg:pb-10 lg:pr-8",
          sidebarCollapsed ? "lg:pl-[6.5rem]" : "lg:pl-[17rem]",
        )}
      >
        <div className="mx-auto w-full max-w-xl lg:max-w-3xl">{children}</div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-6">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              aria-label={label}
              className="flex flex-col items-center gap-1 px-0.5 py-3 text-[10px] font-medium text-muted-foreground data-[status=active]:text-brand-light"
            >
              <Icon className="size-5" />
              <span className="w-full truncate text-center">{label}</span>
            </Link>
          ))}
        </div>

      </nav>
    </div>
  );
}
