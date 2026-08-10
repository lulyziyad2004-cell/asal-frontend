import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import PortalLayout from "@/layouts/PortalLayout";
import type { Invoice } from "@/types/api";
import { useInvoices, useUsers, useCases, useCreateInvoice, useCancelInvoice, useRefundInvoice, useCreatePaymentSession } from "@/hooks/useApi";
import { toast } from "sonner";
import { CreditCard, Plus, Receipt } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  unpaid: "غير مدفوعة",
  paid: "مدفوعة",
  cancelled: "ملغاة",
  refunded: "مستردة",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  unpaid: "outline",
  cancelled: "secondary",
  refunded: "secondary",
};

export default function Invoices() {
  const { user } = useAuth();
  const role = user?.role ?? "client";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    caseId: "none",
    title: "",
    amount: "",
    dueDate: "",
  });

  const invoicesQuery = useInvoices();
  const usersQuery = useUsers();
  const casesQuery = useCases();
  const canCreate = role === "admin" || role === "lawyer";
  const isClient = role === "client";

  const clients = useMemo(
    () => (usersQuery.data ?? []).filter(u => u.role === "client"),
    [usersQuery.data]
  );

  const createMutation = useCreateInvoice({
    onSuccess: () => {
      toast.success("تم إنشاء الفاتورة");
      setDialogOpen(false);
      setForm({ clientId: "", caseId: "none", title: "", amount: "", dueDate: "" });
    },
    onError: err => toast.error(err.message),
  });

  const cancelMutation = useCancelInvoice({
    onSuccess: () => undefined,
    onError: err => toast.error(err.message),
  });

  const refundMutation = useRefundInvoice({
    onSuccess: () => {
      toast.success("تمت معالجة الاسترداد");
    },
    onError: err => toast.error(err.message),
  });

  const payMutation = useCreatePaymentSession({
    onError: err => toast.error(err.message),
  });

  const startPayment = async (invoiceId: number) => {
    try {
      const result = await payMutation.mutateAsync({ invoiceId });
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل بدء الدفع");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.title.trim() || !form.amount.trim()) {
      toast.error("الموكل والمبلغ مطلوبان");
      return;
    }
    createMutation.mutate({
      clientId: Number(form.clientId),
      caseId: form.caseId === "none" ? undefined : Number(form.caseId),
      title: form.title.trim(),
      amount: form.amount.trim(),
      currency: "SAR",
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
    });
  };

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">الفواتير</h1>
          {canCreate && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          الدفع يتم عبر بوابة PayTabs الآمنة. بعد إتمام الدفع يتم تحديث حالة الفاتورة تلقائيًا عبر إشعار البوابة.
        </p>

        {invoicesQuery.isLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}
        {!invoicesQuery.isLoading && (invoicesQuery.data?.length ?? 0) === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد فواتير
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {invoicesQuery.data?.map((inv: Invoice) => (
            <Card key={inv.id}>
              <CardContent className="flex flex-wrap items-center gap-3 py-4">
                <Receipt className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{inv.title}</p>
                    <Badge variant={STATUS_VARIANT[inv.status] ?? "outline"}>
                      {STATUS_LABELS[inv.status] ?? inv.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {inv.invoiceNumber} — {inv.amount} {inv.currency}
                    {inv.dueDate && ` — مستحقة: ${new Date(inv.dueDate).toLocaleDateString("ar-SA")}`}
                    {inv.caseId && ` — ${casesQuery.data?.find(c => c.id === inv.caseId)?.title ?? `قضية #${inv.caseId}`}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.status === "unpaid" && (
                    <Button
                      size="sm"
                      disabled={payMutation.isPending}
                      onClick={() => startPayment(inv.id)}
                    >
                      <CreditCard className="h-4 w-4" />
                      ادفع الآن
                    </Button>
                  )}
                  {canCreate && inv.status === "unpaid" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => cancelMutation.mutate({ id: inv.id })}
                    >
                      إلغاء
                    </Button>
                  )}
                  {role === "admin" && inv.status === "paid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refundMutation.mutate({ id: inv.id })}
                    >
                      استرداد
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
              <CardDescription>فوترة خدمات لموكل مرتبطة بقضية</CardDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2">
                <Label>الموكل *</Label>
                <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموكل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name ?? u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>القضية (اختياري)</Label>
                <Select value={form.caseId} onValueChange={v => setForm({ ...form, caseId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون قضية</SelectItem>
                    {(casesQuery.data ?? []).map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>العنوان *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>المبلغ (SAR) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الاستحقاق</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  إنشاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}
