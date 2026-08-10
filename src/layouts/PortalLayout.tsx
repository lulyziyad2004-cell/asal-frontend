import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useApi";
import { toast } from "sonner";
import {
  Bell,
  LayoutDashboard,
  Gavel,
  FileText,
  Receipt,
  MessagesSquare,
  Users,
  Scale,
  CreditCard,
  Menu,
  LogOut,
  Upload,
} from "lucide-react";

type PortalRole = "admin" | "lawyer" | "consultant" | "client";

const ROLE_TITLES: Record<PortalRole, string> = {
  admin: "بوابة الإدارة",
  lawyer: "بوابة المحامي",
  consultant: "بوابة المستشار",
  client: "بوابة الموكّل",
};

export interface PortalNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: PortalRole[];
}

export const PORTAL_ITEMS: PortalNavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard, roles: ["admin", "lawyer", "consultant", "client"] },
  { href: "/dashboard/cases", label: "القضايا", icon: Gavel, roles: ["admin", "lawyer", "consultant", "client"] },
  { href: "/dashboard/hearings", label: "الجلسات", icon: Scale, roles: ["admin", "lawyer", "consultant"] },
  { href: "/dashboard/documents", label: "المستندات", icon: FileText, roles: ["admin", "lawyer", "consultant", "client"] },
  { href: "/dashboard/invoices", label: "الفواتير والدفع", icon: Receipt, roles: ["admin", "lawyer", "client"] },
  { href: "/dashboard/messages", label: "المراسلة", icon: MessagesSquare, roles: ["admin", "lawyer", "consultant", "client"] },
  { href: "/dashboard/users", label: "المستخدمون", icon: Users, roles: ["admin"] },
  { href: "/dashboard/subscriptions", label: "الاشتراكات", icon: CreditCard, roles: ["admin", "client"] },
  { href: "/dashboard/audit", label: "السجلات", icon: FileText, roles: ["admin"] },
  { href: "/dashboard/upload", label: "رفع مستند", icon: Upload, roles: ["admin", "lawyer", "consultant", "client"] },
];

function UserBadge({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  return (
    <Badge variant="secondary" className="gap-1">
      {ROLE_TITLES[user.role as PortalRole] ?? user.role}
    </Badge>
  );
}

export default function PortalLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: PortalRole;
}) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const notificationsQuery = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  const filteredNotifications = notificationsQuery.data?.filter(n => n.recipientId === user?.id) ?? [];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== role) {
      // Server-side RBAC already enforces this, but route UI by role too.
      toast.error("لا تملك صلاحية الوصول إلى هذه البوابة");
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, role, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-64 w-96 rounded-lg" />
      </div>
    );
  }

  const items = PORTAL_ITEMS.filter(i => i.roles.includes(role));
  const unread = notificationsQuery.data?.filter(n => n.isRead === "no").length ?? 0;

  const navContent = (
    <nav className="space-y-1 px-3 py-4">
      {items.map(item => {
        const active = location === item.href || location.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSheetOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <div className="border-b px-4 py-3">
              <p className="font-semibold">منصة أصال</p>
              <p className="text-xs text-muted-foreground">{ROLE_TITLES[role]}</p>
            </div>
            {navContent}
          </SheetContent>
        </Sheet>
        <Link href={`/dashboard/${role}`} className="flex items-center gap-2 font-bold">
          <Scale className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">منصة أصال</span>
        </Link>
        <div className="mr-auto" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(notificationsQuery.data?.length ?? 0) === 0 && (
              <p className="px-4 py-2 text-sm text-muted-foreground">لا توجد إشعارات</p>
            )}
            {notificationsQuery.data?.map(n => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start gap-1 ${n.isRead === "yes" ? "opacity-70" : "font-medium"}`}
                onClick={() => markReadMutation.mutate({ id: n.id })}
              >
                <span>{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.message}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <span className="hidden sm:inline">{user.name ?? user.email}</span>
              <UserBadge user={user} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="text-destructive"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-l bg-background md:block">
          {navContent}
        </aside>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
