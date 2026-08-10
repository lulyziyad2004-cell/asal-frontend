import type { CaseItem, User } from "@/types/api";
import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import PortalLayout from "@/layouts/PortalLayout";
import { useCases, useUsers, useCreateCase, useUpdateCase } from "@/hooks/useApi";
import { toast } from "sonner";
import { Gavel, Plus } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة",
  in_progress: "قيد العمل",
  closed: "مغلقة",
  cancelled: "ملغاة",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  lawyer: "محامٍ",
  consultant: "مستشار",
  client: "موكّل",
};

export default function Cases() {
  const { user } = useAuth();
  const role = user?.role ?? "client";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    clientId: "",
    court: "",
    city: "",
  });

  const casesQuery = useCases(filter === "all" ? undefined : { status: filter });
  const usersQuery = useUsers();
  const allCasesQuery = useCases();

  const createMutation = useCreateCase({
    onSuccess: () => {
      toast.success("تم إنشاء القضية");
      setDialogOpen(false);
      setForm({ title: "", description: "", clientId: "", court: "", city: "" });
    },
    onError: err => toast.error(err.message),
  });

  const updateMutation = useUpdateCase({
    onSuccess: () => undefined,
    onError: err => toast.error(err.message),
  });

  const clients = useMemo(() => {
    if (role === "admin") {
      return (usersQuery.data ?? []).filter(u => u.role === "client");
    }
    // lawyer/consultant pick their own clients from existing cases
    const ids = new Set(
      (allCasesQuery.data ?? [])
        .filter(
          c =>
            c.lawyerId === user?.id || c.consultantId === user?.id
        )
        .map(c => c.clientId)
    );
    return (usersQuery.data ?? []).filter(u => u.role === "client" && ids.has(u.id));
  }, [role, usersQuery.data, allCasesQuery.data, user?.id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.title.trim()) {
      toast.error("الاسم والموكّل مطلوبان");
      return;
    }
    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      clientId: Number(form.clientId),
      court: form.court || undefined,
      city: form.city || undefined,
    });
  };

  const canCreate = role === "admin" || role === "lawyer" || role === "consultant";

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">القضايا</h1>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="open">مفتوحة</SelectItem>
                <SelectItem value="in_progress">قيد العمل</SelectItem>
                <SelectItem value="closed">مغلقة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
            {canCreate && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                قضية جديدة
              </Button>
            )}
          </div>
        </div>

        {casesQuery.isLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}
        {!casesQuery.isLoading && (casesQuery.data?.length ?? 0) === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد قضايا {filter !== "all" && "بهذه الحالة"}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {casesQuery.data?.map(c => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-start gap-3">
                  <Gavel className="mt-1 h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{c.title}</p>
                      <Badge variant="outline">{c.caseNumber}</Badge>
                      <Select
                        value={c.status}
                        onValueChange={v =>
                          updateMutation.mutate({
                            id: c.id,
                            status: v as "open" | "in_progress" | "closed" | "cancelled",
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">مفتوحة</SelectItem>
                          <SelectItem value="in_progress">قيد العمل</SelectItem>
                          <SelectItem value="closed">مغلقة</SelectItem>
                          <SelectItem value="cancelled">ملغاة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {c.description && (
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>الموكّل: {ROLE_LABELS["client"]} #{c.clientId}</span>
                      {c.court && <span>المحكمة: {c.court}</span>}
                      {c.city && <span>المدينة: {c.city}</span>}
                      {c.lawyerId && <span>المحامي: #{c.lawyerId}</span>}
                      {c.consultantId && <span>المستشار: #{c.consultantId}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء قضية جديدة</DialogTitle>
              <CardDescription>
                إنشاء قضية لموكّل مع بيانات المحكمة
              </CardDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2">
                <Label>عنوان القضية *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>الموكّل *</Label>
                <Select value={form.clientId} onValueChange={v => setForm({ ...form, clientId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموكّل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name ?? u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(role === "lawyer" || role === "consultant") && clients.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    لا يوجد موكّلون مرتبطين بقضاياك الحالية.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>المحكمة</Label>
                  <Input
                    value={form.court}
                    onChange={e => setForm({ ...form, court: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Input
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
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
