import { useAuth } from "@/_core/hooks/useAuth";
import { useAuditLogs } from "@/hooks/useApi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PortalLayout from "@/layouts/PortalLayout";

const ACTION_LABELS: Record<string, string> = {
  "user.register": "تسجيل مستخدم",
  "user.login": "تسجيل دخول",
  "case.create": "إنشاء قضية",
  "case.update": "تحديث قضية",
  "hearing.create": "إنشاء جلسة",
  "invoice.create": "إنشاء فاتورة",
  "document.upload": "رفع مستند",
  "subscription.upgrade": "ترقية اشتراك",
  "admin.set_role": "تغيير دور",
};

export default function Audit() {
  const { user } = useAuth();
  const logsQuery = useAuditLogs();

  return (
    <PortalLayout role="admin">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">سجل التدقيق</h1>
        <p className="text-sm text-muted-foreground">
          تسجيل كامل للعمليات المهمة على المنصة (إضافة، تعديل، دفع، إلخ)
        </p>

        {logsQuery.isLoading &&
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}

        {!logsQuery.isLoading && (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>العملية</TableHead>
                    <TableHead>التفاصيل</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(logsQuery.data?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        لا توجد سجلات بعد
                      </TableCell>
                    </TableRow>
                  )}
                  {logsQuery.data?.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(l.createdAt).toLocaleString("ar-SA")}
                      </TableCell>
                      <TableCell>{l.actorId ? `#${l.actorId}` : "—"}</TableCell>
                      <TableCell>
                        {l.actorRole === "admin" && "مدير"}
                        {l.actorRole === "lawyer" && "محامٍ"}
                        {l.actorRole === "consultant" && "مستشار"}
                        {l.actorRole === "client" && "موكّل"}
                      </TableCell>
                      <TableCell>
                        {ACTION_LABELS[l.action] ?? l.action}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">{l.details ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.ipAddress ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
