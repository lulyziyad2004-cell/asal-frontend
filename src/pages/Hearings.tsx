import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Hearing } from "@/types/api";
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
import { useHearings, useCases, useCreateHearing, useUpdateHearing, useDeleteHearing } from "@/hooks/useApi";
import { toast } from "sonner";
import { Calendar, Plus, Trash2 } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "مجدولة",
  postponed: "مؤجلة",
  done: "منجزة",
  cancelled: "ملغاة",
};

type HearingForm = {
  caseId: string;
  title: string;
  court: string;
  city: string;
  circuitNumber: string;
  scheduledAt: string;
  defenseNotes: string;
  requirements: string;
};

export default function Hearings() {
  const { user } = useAuth();
  const role = user?.role ?? "client";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<HearingForm>({
    caseId: "",
    title: "",
    court: "",
    city: "",
    circuitNumber: "",
    scheduledAt: "",
    defenseNotes: "",
    requirements: "",
  });

  const hearingsQuery = useHearings();
  const casesQuery = useCases();

  const createMutation = useCreateHearing({
    onSuccess: () => {
      toast.success("تمت إضافة الجلسة");
      setDialogOpen(false);
      setForm({
        caseId: "",
        title: "",
        court: "",
        city: "",
        circuitNumber: "",
        scheduledAt: "",
        defenseNotes: "",
        requirements: "",
      });
    },
    onError: err => toast.error(err.message),
  });

  const updateMutation = useUpdateHearing({
    onSuccess: () => undefined,
    onError: err => toast.error(err.message),
  });

  const deleteMutation = useDeleteHearing({
    onSuccess: () => undefined,
    onError: err => toast.error(err.message),
  });

  const caseMap = useMemo(() => {
    const m = new Map<number, string>();
    (casesQuery.data ?? []).forEach(c => m.set(c.id, c.title));
    return m;
  }, [casesQuery.data]);

  const staffCanCreate =
    role === "admin" || role === "lawyer" || role === "consultant";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.caseId || !form.title.trim()) {
      toast.error("القضية والعنوان مطلوبان");
      return;
    }
    createMutation.mutate({
      caseId: Number(form.caseId),
      title: form.title.trim(),
      court: form.court || undefined,
      city: form.city || undefined,
      circuitNumber: form.circuitNumber || undefined,
      scheduledAt: form.scheduledAt || undefined,
      defenseNotes: form.defenseNotes || undefined,
      requirements: form.requirements || undefined,
    });
  };

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">الجلسات</h1>
          {staffCanCreate && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              جلسة جديدة
            </Button>
          )}
        </div>

        {hearingsQuery.isLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}
        {!hearingsQuery.isLoading && (hearingsQuery.data?.length ?? 0) === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد جلسات
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {hearingsQuery.data?.map((h: Hearing) => (
            <Card key={h.id}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{h.title}</p>
                      <Badge variant="outline">{caseMap.get(h.caseId) ?? `قضية #${h.caseId}`}</Badge>
                      <Select
                        value={h.status}
                        onValueChange={v =>
                          updateMutation.mutate({
                            id: h.id,
                            status: v as "scheduled" | "postponed" | "done" | "cancelled",
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">مجدولة</SelectItem>
                          <SelectItem value="postponed">مؤجلة</SelectItem>
                          <SelectItem value="done">منجزة</SelectItem>
                          <SelectItem value="cancelled">ملغاة</SelectItem>
                        </SelectContent>
                      </Select>
                      {staffCanCreate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteMutation.mutate({ id: h.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {h.scheduledAt && (
                        <span>
                          الموعد:{" "}
                          {new Date(h.scheduledAt).toLocaleString("ar-SA")}
                        </span>
                      )}
                      {h.court && <span>المحكمة: {h.court}</span>}
                      {h.city && <span>المدينة: {h.city}</span>}
                      {h.circuitNumber && <span>الدائرة: {h.circuitNumber}</span>}
                    </div>
                    {h.defenseNotes && (
                      <p className="text-sm text-muted-foreground">
                        ملاحظات الدفاع: {h.defenseNotes}
                      </p>
                    )}
                    {h.requirements && (
                      <p className="text-sm text-muted-foreground">
                        المتطلبات: {h.requirements}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة جلسة جديدة</DialogTitle>
              <CardDescription>
                جدولة جلسة لقضية مع بيانات المحكمة
              </CardDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2">
                <Label>القضية *</Label>
                <Select value={form.caseId} onValueChange={v => setForm({ ...form, caseId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القضية" />
                  </SelectTrigger>
                  <SelectContent>
                    {(casesQuery.data ?? []).map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.title} ({c.caseNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>عنوان الجلسة *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>المحكمة</Label>
                  <Input value={form.court} onChange={e => setForm({ ...form, court: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>الدائرة القضائية</Label>
                  <Input value={form.circuitNumber} onChange={e => setForm({ ...form, circuitNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>الموعد</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات الدفاع</Label>
                <Textarea value={form.defenseNotes} onChange={e => setForm({ ...form, defenseNotes: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>المتطلبات</Label>
                <Textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={2} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  إضافة
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}
