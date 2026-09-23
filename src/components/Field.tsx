import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/Sheet";

const base =
  "w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-brand/40";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(base, "h-13 py-3", className)} />;
}

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  title,
  icon: Icon,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          base,
          "tap flex h-14 cursor-pointer items-center gap-3 rounded-2xl pr-4 text-left shadow-card hover:border-brand/60 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60",
          Icon ? "pl-4" : "pl-4",
          className,
        )}
      >
        {Icon ? (
          <Icon className={cn("size-5 shrink-0", open ? "text-brand-light" : "text-muted-foreground")} />
        ) : null}
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground/70")}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.hint ? (
          <span className="num shrink-0 text-sm font-semibold text-brand-light">{selected.hint}</span>
        ) : null}
        <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={title ?? placeholder}>
        <div className="space-y-2">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "tap flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                  active
                    ? "border-brand bg-brand/15 text-foreground"
                    : "border-border bg-background text-foreground hover:border-brand/50",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium">{o.label}</span>
                  {o.hint ? (
                    <span className="block truncate text-sm text-muted-foreground">{o.hint}</span>
                  ) : null}
                </span>
                {active ? <Check className="size-5 shrink-0 text-brand-light" /> : null}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(base, "min-h-20 py-3", className)} />;
}

export function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "tap flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-card hover:bg-brand-light disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "tap flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary text-base font-semibold text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
