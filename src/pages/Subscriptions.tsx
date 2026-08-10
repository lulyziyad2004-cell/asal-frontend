import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PortalLayout from "@/layouts/PortalLayout";
import type { SubscriptionPlan, SubscriptionRecord } from "@/types/api";
import { useMySubscription, useMySubscriptionRecords, useSubscriptionPlans, useUpgradeSubscription, useCancelSubscription } from "@/hooks/useApi";
import { toast } from "sonner";

export default function Subscriptions() {
  const { user } = useAuth();
  const role = user?.role ?? "client";

  const mineQuery = useMySubscription();
  const myRecordsQuery = useMySubscriptionRecords();
  const plansQuery = useSubscriptionPlans();

  const upgradeMutation = useUpgradeSubscription({
    onSuccess: () => {
      toast.success("تم تفعيل الخطة الجديدة");
    },
    onError: err => toast.error(err.message),
  });

  const cancelMutation = useCancelSubscription({
    onSuccess: () => {
      toast.success("تم إلغاء الاشتراك — يظل نشطًا حتى نهاية الفترة");
    },
    onError: err => toast.error(err.message),
  });

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الاشتراكات</h1>

        {mineQuery.data && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">اشتراكك الحالي</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Badge
                variant={mineQuery.data.status === "active" ? "default" : "destructive"}
              >
                {mineQuery.data.plan === "free" && "مجاني"}
                {mineQuery.data.plan === "monthly" && "شهري"}
                {mineQuery.data.plan === "yearly" && "سنوي"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {mineQuery.data.status === "active" && "نشط"}
                {mineQuery.data.status === "cancelled" && "ملغى"}
                {mineQuery.data.status === "expired" && "منتهي"}
                {mineQuery.data.status === "past_due" && "متأخر"}
              </span>
              {mineQuery.data.expiresAt && (
                <span className="text-sm text-muted-foreground">
                  ينتهي في {new Date(mineQuery.data.expiresAt).toLocaleDateString("ar-SA")}
                </span>
              )}
              {mineQuery.data.status === "active" && mineQuery.data.plan !== "free" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Find the active subscription record id from the admin list when available.
                    const active = (myRecordsQuery.data ?? []).find(
                      (s: SubscriptionRecord) =>
                        s.userId === user!.id &&
                        s.status === "active" &&
                        (s.plan === "monthly" || s.plan === "yearly")
                    );
                    if (active) cancelMutation.mutate({ id: active.id });
                  }}
                  disabled={cancelMutation.isPending}
                >
                  إلغاء الاشتراك
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {plansQuery.data?.map((p: SubscriptionPlan) => {
            const current = mineQuery.data?.plan === p.plan;
            return (
              <Card key={p.plan} className={current ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <p className="text-3xl font-bold">
                    {p.price === 0 ? "مجاني" : `${p.price} ريال`}
                    {p.plan === "monthly" && <span className="text-sm font-normal text-muted-foreground">/شهر</span>}
                    {p.plan === "yearly" && <span className="text-sm font-normal text-muted-foreground">/سنة</span>}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {p.features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className="text-primary">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {p.plan === "free" ? (
                    <Button variant="outline" className="w-full" disabled>
                      الخطة الأساسية
                    </Button>
                  ) : current ? (
                    <Button variant="outline" className="w-full" disabled>
                      خطتك الحالية
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => upgradeMutation.mutate({ plan: p.plan as "monthly" | "yearly" })}
                      disabled={upgradeMutation.isPending}
                    >
                      {upgradeMutation.isPending ? "جاري التفعيل..." : "ترقية الآن"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </PortalLayout>
  );
}
