import { Droplets } from "lucide-react";
import { useEffect, useState } from "react";

export function AppSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveTimer = window.setTimeout(() => setLeaving(true), reducedMotion ? 150 : 900);
    const hideTimer = window.setTimeout(() => setVisible(false), reducedMotion ? 300 : 1250);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`app-splash fixed inset-0 z-[100] grid place-items-center bg-background ${leaving ? "app-splash-leaving" : ""}`}
    >
      <div className="flex flex-col items-center">
        <div className="app-splash-mark relative grid size-20 place-items-center rounded-3xl border border-brand/30 bg-brand/15 text-brand-light shadow-float">
          <span className="app-splash-ring absolute inset-[-9px] rounded-[1.9rem] border border-brand/20" />
          <Droplets className="size-9" strokeWidth={1.8} />
        </div>
        <p className="app-splash-title mt-6 font-display text-xl font-semibold text-foreground">
          Lava-Car <span className="text-brand-light">do Vitinho</span>
        </p>
        <div className="mt-4 h-1 w-20 overflow-hidden rounded-full bg-secondary">
          <span className="app-splash-progress block h-full rounded-full bg-brand-light" />
        </div>
      </div>
    </div>
  );
}