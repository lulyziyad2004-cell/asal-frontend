import { useState } from "react";
import type { User } from "@/types/api";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PortalLayout from "@/layouts/PortalLayout";
import { useUsers, useRegister, useSetUserRole, useSuspendUser, useDeleteUser, useSetPassword } from "@/hooks/useApi";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Trash2, UserPlus } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  lawyer: "محامٍ",
  consultant: "مستشار",
  client: "موكّل",
};

export default function Users() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "client" as "admin" | "lawyer" | "consultant" | "client",
  });

  const usersQuery = useUsers();

  const createMutation = useRegister({
    onSuccess: () => {
      toast.success("تم إنشاء الحساب");
      setDialogOpen(false);
      setForm({ email: "", password: "", name: "", phone: "", role: "client" });
    },
    onError: err => toast.error(err.message),
  });

  const setRoleMutation = useSetUserRole({
    onSuccess: () => undefined,
    onError: err => toast.error(err.message),
  });

  const suspendMutation = useSuspendUser({
    onSuccess: () => undefined,
    onError: err => toast.error(err.message),
  });

  const deleteMutation = useDeleteUser({
    onSuccess: () => undefined,
    onError: err => toast.error(err.message),
  });

  const setPasswordMutation = useSetPassword({
    onSuccess: () => toast.success("تم تحديث كلمة المرور"),
    onError: err => toast.error(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name) {
      toast.error("البيانات الأساسية مطلوبة");
      return;
    }
    createMutation.mutate({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone || undefined,
      role: form.role,
    });
  };

  const resetPassword = (userId: number) => {
    const password = prompt("أدخل كلمة المرور الجديدة (8 أحرف على الأقل):");
    if (!password) return;
    setPasswordMutation.mutate({ userId, password });
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            مستخدم جديد
          </Button>
        </div>

        {usersQuery.isLoading &&
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}

        {!usersQuery.isLoading && (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-end">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.data?.map((u: User) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name ?? "—"}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone ?? "—"}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={v =>
                            setRoleMutation.mutate({
                              userId: u.id,
                              role: v as "admin" | "lawyer" | "consultant" | "client",
                            })
                          }
                        >
                          <SelectTrigger className="h-7 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="lawyer">محامٍ</SelectItem>
                            <SelectItem value="consultant">مستشار</SelectItem>
                            <SelectItem value="client">موكّل</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {u.status === "active" ? (
                          <Badge variant="outline">نشط</Badge>
                        ) : (
                          <Badge variant="destructive">معطّل</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={u.status === "active" ? "تعطيل" : "تفعيل"}
                            onClick={() =>
                              suspendMutation.mutate({
                                userId: u.id,
                                suspended: u.status === "active",
                              })
                            }
                          >
                            {u.status === "active" ? (
                              <ShieldOff className="h-4 w-4" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="تغيير كلمة المرور"
                            onClick={() => resetPassword(u.id)}
                          >
                            🔑
                          </Button>
                          {user?.id !== u.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              title="حذف"
                              onClick={() => deleteMutation.mutate(u.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء مستخدم جديد</DialogTitle>
              <CardDescription>يُنشأ الحساب بكلمة مرور مشفرة</CardDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور * (8 أحرف على الأقل)</Label>
                <Input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>الهاتف</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>الدور *</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as "admin" | "lawyer" | "consultant" | "client" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">موكّل</SelectItem>
                      <SelectItem value="lawyer">محامٍ</SelectItem>
                      <SelectItem value="consultant">مستشار</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
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
