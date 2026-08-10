import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLogin, useRegister } from "@/hooks/useApi";
import { toast } from "sonner";
import { Scale, Loader2 } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  lawyer: "محامٍ",
  consultant: "مستشار قانوني",
  client: "موكّل",
};

const emailSchema = z
  .string()
  .email("البريد الإلكتروني غير صالح")
  .max(320)
  .transform(value => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(128);

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(128),
  phone: z.string().max(32).optional(),
  role: z.enum(["admin", "lawyer", "consultant", "client"]),
});

function getApiErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    const zodErrors = err.data?.zodError?.fieldErrors;
    if (zodErrors) {
      const firstFieldError = Object.values(zodErrors)
        .flatMap((messages: unknown) => (Array.isArray(messages) ? messages : []))
        .find(message => typeof message === "string");
      if (firstFieldError) return firstFieldError as string;
    }

    if (typeof err.message === "string" && err.message.trim()) {
      if (err.message.includes("Failed query")) {
        return "تعذّر الاتصال بقاعدة البيانات حالياً. حاول مرة أخرى لاحقاً.";
      }
      return err.message;
    }
  }

  return "حدث خطأ غير متوقع. حاول مرة أخرى.";
}

export default function Auth() {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mode, setMode] = useState<"login" | "register">(
    typeof URLSearchParams !== "undefined" &&
    new URLSearchParams(location.split("?")[1] ?? "").get("mode") === "register"
      ? "register"
      : "login"
  );
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "client",
  });
  const [busy, setBusy] = useState(false);
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSuccess = async () => {
    toast.success("تم تسجيل الدخول بنجاح");
    navigate("/dashboard", { replace: true });
  };

  const handleRegisterSuccess = async () => {
    toast.success("تم إنشاء الحساب وتسجيل الدخول");
    navigate("/dashboard", { replace: true });
  };

  const loginMutationConfig = {
    onSuccess: handleSuccess,
    onError: (err: unknown) => toast.error(getApiErrorMessage(err)),
  };

  const registerMutationConfig = {
    onSuccess: handleRegisterSuccess,
    onError: (err: unknown) => toast.error(getApiErrorMessage(err)),
  };

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <Card className="w-[380px]">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    if (mode === "login") {
      const validation = loginSchema.safeParse({
        email: form.email,
        password: form.password,
      });

      if (!validation.success) {
        toast.error(validation.error.issues[0]?.message ?? "البيانات غير صحيحة");
        setBusy(false);
        return;
      }

      loginMutation.mutate(validation.data, {
        onSettled: () => setBusy(false),
        ...loginMutationConfig,
      });
      return;
    }

    const validation = registerSchema.safeParse({
      email: form.email,
      password: form.password,
      name: form.name || form.email,
      phone: form.phone || undefined,
      role: form.role as "admin" | "lawyer" | "consultant" | "client",
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "البيانات غير صحيحة");
      setBusy(false);
      return;
    }

    registerMutation.mutate(validation.data, {
      onSettled: () => setBusy(false),
      ...registerMutationConfig,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">منصة أصال</CardTitle>
          <CardDescription>
            للمحاماة والاستشارات القانونية — {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <Select
                    value={form.role}
                    onValueChange={v => setForm({ ...form, role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    حسابات المحامين والمستشارين والمديرين تحتاج موافقة الإدارة قبل الاستخدام.
                  </p>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                dir="ltr"
                className="text-right"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="8 أحرف على الأقل"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin h-4 w-4" />}
              {mode === "login" ? "دخول" : "إنشاء حساب"}
            </Button>
          </form>
          <Separator className="my-4" />
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "أنشئ حسابًا" : "سجّل الدخول"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
