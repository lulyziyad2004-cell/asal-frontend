import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PortalLayout from "@/layouts/PortalLayout";
import type { CaseItem, Document as APIDocument } from "@/types/api";
import { useCases, useDocuments, useDeleteDocument } from "@/hooks/useApi";
import { toast } from "sonner";
import { FileText, Trash2, ExternalLink } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  contract: "عقد",
  memo: "مذكرة",
  poa: "وكالة",
  hearing_related: "مستند جلسة",
  other: "آخر",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const { user } = useAuth();
  const role = user?.role ?? "client";
  const [caseFilter, setCaseFilter] = useState<string>("all");

  const casesQuery = useCases();
  const docsQuery = useDocuments(caseFilter === "all" ? undefined : { caseId: Number(caseFilter) });

  const deleteMutation = useDeleteDocument({
    onSuccess: () => {
      toast.success("تم حذف المستند");
    },
    onError: err => toast.error(err.message),
  });

  const caseMap = useMemo(() => {
    const m = new Map<number, string>();
    (casesQuery.data ?? []).forEach(c => m.set(c.id, c.title));
    return m;
  }, [casesQuery.data]);

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">المستندات</h1>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={caseFilter}
              onChange={e => setCaseFilter(e.target.value)}
            >
              <option value="all">كل القضايا</option>
              {casesQuery.data?.map((c: CaseItem) => (
                <option key={c.id} value={String(c.id)}>
                  {c.title}
                </option>
              ))}
            </select>
            <Button
              onClick={() => (window.location.href = "/dashboard/upload")}
            >
              <FileText className="h-4 w-4" />
              رفع مستند
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          المستندات تُخزَّن في سحابة آمنة، وروابط التحميل مؤقتة (15 دقيقة). الحد الأقصى 25 MB لكل ملف.
        </p>

        {docsQuery.isLoading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        )}
        {!docsQuery.isLoading && (docsQuery.data?.length ?? 0) === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              لا توجد مستندات {caseFilter !== "all" && "لهذه القضية"}
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {docsQuery.data?.map((d: APIDocument) => (
            <Card key={d.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.fileName} — {formatBytes(d.sizeBytes ?? 0)} —{" "}
                    {CATEGORY_LABELS[d.category] ?? d.category}
                    {d.caseId && ` — ${caseMap.get(d.caseId) ?? `قضية #${d.caseId}`}`}
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:inline">
                  {d.uploaderRole === "admin" && "مدير"}
                  {d.uploaderRole === "lawyer" && "محامٍ"}
                  {d.uploaderRole === "consultant" && "مستشار"}
                  {d.uploaderRole === "client" && "موكّل"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  title="فتح"
                >
                  <a href={d.fileUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                {(user?.role === "admin" || user?.id === d.uploaderId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate({ id: d.id })}
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
