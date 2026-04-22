"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  BookText,
  CalendarCheck2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type DashboardRole = "students" | "staff" | "principal";

type SidebarLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type SidebarSection = {
  title: string;
  links: SidebarLink[];
};

const linksByRole: Record<DashboardRole, SidebarSection[]> = {
  students: [
    {
      title: "Overview",
      links: [
        { label: "Dashboard", href: "/students", icon: LayoutDashboard },
        { label: "Profile", href: "/students/profile", icon: User },
      ],
    },
    {
      title: "Academic",
      links: [
        { label: "Routine", href: "/students/routine", icon: BookOpen },
        { label: "Attendance", href: "/students/attendance", icon: CalendarCheck2 },
        { label: "Results", href: "/students/results", icon: ClipboardCheck },
        { label: "Assignments", href: "/students/assignments", icon: FileText },
        { label: "Study Materials", href: "/students/materials", icon: BookText },
      ],
    },
    {
      title: "Finance & Communication",
      links: [
        { label: "Fees", href: "/students/fees", icon: Wallet },
        { label: "Fee History", href: "/students/fees/history", icon: BarChart3 },
        { label: "Notices", href: "/students/notices", icon: Bell },
        { label: "Messages", href: "/students/messages", icon: MessageSquare },
      ],
    },
  ],

  staff: [
    {
      title: "Overview",
      links: [
        { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
        { label: "Profile", href: "/staff/profile", icon: User },
      ],
    },
    {
      title: "Teaching",
      links: [
        { label: "Classes", href: "/staff/classes", icon: BookOpen },
        { label: "Routine", href: "/staff/routine", icon: CalendarCheck2 },
        { label: "Attendance", href: "/staff/attendance", icon: ClipboardCheck },
        { label: "Assignments", href: "/staff/assignments", icon: FileText },
        { label: "Marks Entry", href: "/staff/results", icon: GraduationCap },
        { label: "Materials Upload", href: "/staff/materials", icon: BookText },
      ],
    },
    {
      title: "Management",
      links: [
        { label: "Notices", href: "/staff/notices", icon: Bell },
        { label: "Messages", href: "/staff/messages", icon: MessageSquare },
        { label: "Leave Requests", href: "/staff/leaves", icon: CalendarCheck2 },
        { label: "Salary", href: "/staff/salary", icon: Wallet },
      ],
    },
  ],

  principal: [
    {
      title: "Overview",
      links: [
        { label: "Dashboard", href: "/principal", icon: LayoutDashboard },
        { label: "Analytics", href: "/principal/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Academic Management",
      links: [
        { label: "Students", href: "/principal/students", icon: Users },
        { label: "Admissions", href: "/principal/admissions", icon: ClipboardCheck },
        { label: "Home Content", href: "/principal/home-content", icon: FileText },
        { label: "Staff", href: "/principal/staff", icon: User },
        { label: "Classes", href: "/principal/classes", icon: BookOpen },
        { label: "Subjects", href: "/principal/subjects", icon: BookText },
        { label: "Routine", href: "/principal/routine", icon: CalendarCheck2 },
        { label: "Exams", href: "/principal/exams", icon: GraduationCap },
      ],
    },
    {
      title: "Administration",
      links: [
        { label: "Finance", href: "/principal/finance", icon: Wallet },
        { label: "Notices", href: "/principal/notices", icon: Bell },
        { label: "Messages", href: "/principal/messages", icon: MessageSquare },
        { label: "Leave Approvals", href: "/principal/leaves", icon: CalendarCheck2 },
        { label: "Settings", href: "/principal/settings", icon: Settings },
      ],
    },
  ],
};

export function AppSidebar({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const sections = linksByRole[role];
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const scrollKey = `sidebar-scroll:${role}`;

  const isLinkActive = (href: string) => {
    const isRootDashboard = href === `/${role}`;
    return isRootDashboard
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  };

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const saved = sessionStorage.getItem(scrollKey);
    if (!saved) return;

    el.scrollTop = Number(saved);
  }, [scrollKey]);

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const saved = sessionStorage.getItem(scrollKey);
    if (!saved) return;

    requestAnimationFrame(() => {
      el.scrollTop = Number(saved);
    });
  }, [pathname, scrollKey]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className={cn("flex flex-col", !open && "items-center w-full")}>
          <span
            className={cn(
              "text-xs uppercase tracking-wide text-muted-foreground",
              !open && "hidden"
            )}
          >
            School ERP
          </span>
          <span className={cn("font-semibold capitalize", !open && "hidden")}>
            {role} Panel
          </span>
          {!open && (
            <span className="text-sm font-semibold uppercase">{role.slice(0, 1)}</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent
        ref={contentRef}
        onScroll={(event) => {
          sessionStorage.setItem(
            scrollKey,
            String(event.currentTarget.scrollTop)
          );
        }}
      >
        {sections.map((section) => (
          <SidebarGroup key={section.title}>
            <div
              className={cn(
                "px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                !open && "hidden"
              )}
            >
              {section.title}
            </div>

            <div className="space-y-1">
              {section.links.map((link) => {
                const isActive = isLinkActive(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={!open ? link.label : undefined}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      open ? "gap-2 justify-start" : "justify-center",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {open && link.label}
                  </Link>
                );
              })}
            </div>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <p className={cn("text-sm text-muted-foreground capitalize", !open && "hidden")}>
          Signed in as {role}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
