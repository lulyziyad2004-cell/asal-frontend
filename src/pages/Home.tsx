import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlans } from "@/hooks/useApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Gavel,
  FileText,
  MessagesSquare,
  CreditCard,
  ShieldCheck,
  Scale,
  Calendar,
} from "lucide-react";

const FEATURES = [
  {
    icon: Gavel,
    title: "إدارة القضايا",
    desc: "تتبع قضاياك من الافتتاح إلى الإغلاق مع أرقام قضايا موحدة وحالات محدثة لحظيًا",
  },
  {
    icon: Calendar,
    title: "جدولة الجلسات",
    desc: "حجز الجلسات والمذكرات والمتطلبات مع تنبيهات لكل الأطراف",
  },
  {
    icon: FileText,
    title: "مستندات آمنة",
    desc: "تخزين سحابي مشفر للعقود والوكالات والمذكرات مع صلاحيات وصول دقيقة",
  },
  {
    icon: CreditCard,
    title: "دفع إلكتروني",
    desc: "فوترة ومدفوعات عبر بوابة PayTabs المعتمدة، مع فواتير وسجلات معاملات",
  },
  {
    icon: MessagesSquare,
    title: "مراسلة داخلية",
    desc: "تواصل مباشر بين الموكّل والمحامٍ والمستشار داخل المنصة",
  },
  {
    icon: ShieldCheck,
    title: "أدوار وصلاحيات",
    desc: "تحكم صارم بالأدوار (مدير، محامٍ، مستشار، موكّل) على مستوى الخادم",
  },
];

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const plansQuery = useSubscriptionPlans();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">منصة أصال</span>
          </div>
          <div className="flex items-center gap-2">
            {loading ? null : isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">
                  لوحة التحكم
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login?mode=login">تسجيل الدخول</Link>
                </Button>
                <Button asChild>
                  <Link href="/login?mode=register">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4" variant="secondary">
            منصة المحاماة والاستشارات القانونية
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            إدارة قانونية متكاملة لمكتبك
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            منصة أصال الرقمية تجمع إدارة القضايا والجلسات والمستندات والفواتير
            والمدفوعات في مكان واحد، بأمان مؤسسي وصلاحيات واضحة لكل دور.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  افتح لوحة التحكم
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link href="/login?mode=register">ابدأ مجانًا</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">كل ما يحتاجه مكتبك</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <Card key={f.title}>
                <CardContent className="space-y-2 py-6">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="container pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold">خطط الاشتراك</h2>
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {plansQuery.data?.map(p => (
            <Card key={p.plan}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>
                  {p.price === 0
                    ? "مجاني"
                    : `${p.price} ريال ${p.plan === "monthly" ? "/شهر" : "/سنة"}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          منصة أصال للمحاماة والاستشارات القانونية — جميع الحقوق محفوظة © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
