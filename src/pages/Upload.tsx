import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PortalLayout from "@/layouts/PortalLayout";
import { useCases, useUploadDocument } from "@/hooks/useApi";
import { toast } from "sonner";
import { Upload as UploadIcon, FileText } from "lucide-react";

const MAX_BYTES = 25 * 1024 * 1024;
const CATEGORY_LABELS: Record<string, string> = {
  contract: "عقد",
  memo: "مذكرة",
  poa: "وكالة",
  hearing_related: "مستند جلسة",
  other: "آخر",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Upload() {
  const { user } = useAuth();
  const role = user?.role ?? "client";
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [caseId, setCaseId] = useState("none");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const casesQuery = useCases();
  const uploadMutation = useUploadDocument({
    onSuccess: () => {
      toast.success("تم رفع المستند بنجاح");
      navigate("/dashboard/documents");
    },
    onError: err => toast.error(err.message),
    onSettled: () => setUploading(false),
  });

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error(`حجم الملف يتجاوز 25 ميغابايت (${Math.round(f.size / 1024 / 1024)} MB)`);
      return;
    }
    if (f.size === 0) {
      toast.error("الملف فارغ");
      return;
    }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("العنوان والملف مطلوبان");
      return;
    }
    setUploading(true);
    try {
      const data = await fileToBase64(file);
      uploadMutation.mutate({
        title: title.trim(),
        category: category as "contract" | "memo" | "poa" | "hearing_related" | "other",
        caseId: caseId === "none" ? undefined : Number(caseId),
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        data,
      });
    } catch {
      toast.error("تعذّر قراءة الملف");
      setUploading(false);
    }
  };

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">رفع مستند</h1>
        <Card>
          <CardHeader>
            <CardTitle>مستند قانوني جديد</CardTitle>
            <CardDescription>
              يُرفع الملف إلى تخزين سحابي آمن وتُنشأ روابط تحميل مؤقتة. الأنواع المسموحة: PDF، Word، Excel، صور، نصوص. الحد 25 MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان المستند *</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: عقد تأسيس الشركة"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ربط بقضية (اختياري)</Label>
                <Select value={caseId} onValueChange={setCaseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="بدون قضية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون قضية</SelectItem>
                    {(casesQuery.data ?? []).map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.title} ({c.caseNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الملف *</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary/50"
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={e => pickFile(e.target.files?.[0])}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
                  />
                  <UploadIcon className="h-8 w-8" />
                  <span className="text-sm">
                    {file ? file.name : "اضغط لاختيار ملف أو اسحبه"}
                  </span>
                  {file && (
                    <span className="text-xs">
                      {file.name} — {Math.round(file.size / 1024 / 1024 * 10) / 10} MB
                    </span>
                  )}
                </div>
              </div>
              {uploading && <Progress value={50} className="animate-pulse" />}
              <Button type="submit" className="w-full" disabled={uploading || !file || !title.trim()}>
                <FileText className="h-4 w-4" />
                {uploading ? "جاري الرفع..." : "رفع المستند"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
