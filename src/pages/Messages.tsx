import { useEffect, useRef, useState } from "react";
import type { Message as APIMessage, User } from "@/types/api";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PortalLayout from "@/layouts/PortalLayout";
import { useMessageContacts, useMessageThread, useSendMessage } from "@/hooks/useApi";
import { toast } from "sonner";
import { Send } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  lawyer: "محامٍ",
  consultant: "مستشار",
  client: "موكّل",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0])
    .join("")
    .toUpperCase();
}

export default function Messages() {
  const { user } = useAuth();
  const role = user?.role ?? "client";
  const [peerId, setPeerId] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const contactsQuery = useMessageContacts();
  const threadQuery = useMessageThread(peerId ?? 0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadQuery.data]);

  const sendMutation = useSendMessage({
    onSuccess: () => {
      setBody("");
    },
    onError: err => toast.error(err.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !peerId) return;
    sendMutation.mutate({ recipientId: peerId, body: body.trim() });
  };

  const peerName = contactsQuery.data?.find(c => c.id === peerId)?.name;

  return (
    <PortalLayout role={role as "admin" | "lawyer" | "consultant" | "client"}>
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          <h2 className="px-1 text-sm font-semibold text-muted-foreground">المحادثات</h2>
          {contactsQuery.isLoading &&
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          {(contactsQuery.data?.length ?? 0) === 0 && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                لا يوجد جهات اتصال
              </CardContent>
            </Card>
          )}
          {contactsQuery.data?.map((c: User) => (
            <button
              key={c.id}
              className={`w-full rounded-lg border px-3 py-2 text-start transition-colors hover:bg-accent ${peerId === c.id ? "border-primary bg-accent" : ""}`}
              onClick={() => setPeerId(c.id)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(c.name ?? c.email ?? "")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {c.name ?? c.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[c.role]}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Card className="flex h-[60vh] flex-col">
          {peerId && peerName && (
            <div className="border-b px-4 py-3 font-medium">
              محادثة مع {peerName}
            </div>
          )}
          <CardContent className="flex-1 space-y-2 overflow-y-auto py-4">
            {!peerId && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                اختر محادثة من القائمة لبدء المراسلة
              </p>
            )}
            {threadQuery.isLoading &&
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            {threadQuery.data?.map((m: APIMessage) => {
              const mine = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                      mine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {new Date(m.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </CardContent>
          <form
            className="flex items-center gap-2 border-t p-3"
            onSubmit={submit}
          >
            <Input
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="اكتب رسالة..."
              disabled={!peerId || sendMutation.isPending}
            />
            <Button type="submit" disabled={!body.trim() || !peerId || sendMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </PortalLayout>
  );
}
