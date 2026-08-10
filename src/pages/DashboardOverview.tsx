import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PortalLayout from "@/layouts/PortalLayout";
import { useStats, useCases, useMySubscription } from "@/hooks/useApi";
import {
  Gavel,
  Scale,
  FileText,
  Users,
  MessagesSquare,
  CreditCard,
} from "lucide-react";

const STATS = [
  { key: "totalClients", label: "الموكّلون", icon: Users, color: "text-blue-600" },
  { key: "openCases", label: "القضايا المفتوحة", icon: Gavel, color: "text-amber-600" },
  { key: "totalHearings", label: "الجلسات", icon: Scale, color: "text-purple-600" },
  { key: "totalDocuments", label: "المستندات", icon: FileText, color: "text-emerald-600" },
  { key: "unreadMessages", label: "الرسائل غير المقروءة", icon: MessagesSquare, color: "text-rose-600" },
  { key: "totalRevenue", label: "الإيرادات المحصّلة (SAR)", icon: CreditCard, color: "text-teal-600" },
];

export default function DashboardOverview() {
  const { user } = useAuth();
  const role = user?.role ?? "client";
  const statsQuery = useStats();
  const casesQuery = useCases();
  const subQuery = useMySubscription();

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            مرحبًا، {user?.name ?? "مستخدم"}
          </h1>
          <p className="text-muted-foreground">
            {role === "admin" && "نظرة عامة على المنصة"}
            {role === "lawyer" && "قضاياك المسندة إليك"}
            {role === "consultant" && "قضاياك الاستشارية"}
            {role === "client" && "متابعة قضاياك واشتراكك"}
          </p>
        </div>

        {role === "admin" && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {statsQuery.isLoading &&
              STATS.map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            {statsQuery.error && (
              <Card className="col-span-full bg-destructive/10">
                <CardContent className="py-4">
                  حدث خطأ في تحميل الإحصائيات
                </CardContent>
              </Card>
            )}
            {statsQuery.data &&
              STATS.map(s => {
                const Icon = s.icon;
                const value = statsQuery.data[s.key as keyof typeof statsQuery.data];
                return (
                  <Card key={s.key}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {s.label}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${s.color}`} />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{value}</p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {role === "client" && subQuery.data && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">حالة اشتراكك</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Badge
                variant={
                  subQuery.data.status === "active" ? "default" : "destructive"
                }
              >
                {subQuery.data.plan === "free" && "مجاني"}
                {subQuery.data.plan === "monthly" && "شهري"}
                {subQuery.data.plan === "yearly" && "سنوي"}
                {subQuery.data.status !== "active" && " — الاشتراك غير فعّال"}
              </Badge>
              {subQuery.data.expiresAt && (
                <span className="text-sm text-muted-foreground">
                  ينتهي في {new Date(subQuery.data.expiresAt).toLocaleDateString("ar-SA")}
                </span>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-3 text-lg font-semibold">
            {role === "admin" ? "آخر القضايا" : "قضاياك"}
          </h2>
          {casesQuery.isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          )}
          {!casesQuery.isLoading && (casesQuery.data?.length ?? 0) === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                لا توجد قضايا بعد
              </CardContent>
            </Card>
          )}
          <div className="space-y-2">
            {casesQuery.data?.slice(0, 5).map(c => (
              <Card key={c.id}>
                <CardContent className="flex items-center gap-3 py-4">
                  <Gavel className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.caseNumber}
                      {c.court ? ` — ${c.court}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      c.status === "closed"
                        ? "secondary"
                        : c.status === "cancelled"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {c.status === "open" && "مفتوحة"}
                    {c.status === "in_progress" && "قيد العمل"}
                    {c.status === "closed" && "مغلقة"}
                    {c.status === "cancelled" && "ملغاة"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
