"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("Sidebar components must be used inside SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((prev) => !prev),
    }),
    [open]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex h-screen w-full overflow-hidden bg-background">{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useSidebar();

  return (
    <aside
      className={cn(
        "border-sidebar-border bg-sidebar text-sidebar-foreground hidden h-screen shrink-0 overflow-hidden border-r md:flex md:flex-col md:transition-[width] md:duration-200",
        open ? "md:w-64" : "md:w-20",
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-sidebar-border flex min-h-16 items-center border-b px-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(function SidebarContent({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-1 flex-col gap-3 overflow-auto overflow-x-hidden p-3", className)}
      {...props}
    >
      {children}
    </div>
  );
});

SidebarContent.displayName = "SidebarContent";

export function SidebarGroup({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("space-y-1", className)}>{children}</section>;
}

export function SidebarFooter({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-sidebar-border border-t p-3 text-sm", className)}>
      {children}
    </div>
  );
}

export function SidebarTrigger({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "border-border bg-background hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md border text-lg",
        className
      )}
      aria-label="Toggle sidebar"
    >
      {children ?? "☰"}
    </button>
  );
}
