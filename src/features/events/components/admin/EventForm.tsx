"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EVENT_FORMATS,
  EVENT_FORMAT_LABEL,
  EVENT_KINDS,
  EVENT_KIND_LABEL,
  ingestSourceFromUrl,
  type EventFormat,
  type EventItem,
  type EventKind
} from "@/features/events/types/eventItem";
import type { CompanyOption } from "@/features/posts/types";

type FormState = {
  companyId: string;
  url: string;
  title: string;
  kind: EventKind;
  format: EventFormat;
  prefecture: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  applyDeadline: string;
  organizer: string;
  organizerUrl: string;
  prize: string;
  tags: string;
  description: string;
  imageUrl: string;
  capacity: string;
};

const EMPTY: FormState = {
  companyId: "",
  url: "",
  title: "",
  kind: "OTHER",
  format: "OFFLINE",
  prefecture: "",
  venue: "",
  startsAt: "",
  endsAt: "",
  applyDeadline: "",
  organizer: "",
  organizerUrl: "",
  prize: "",
  tags: "",
  description: "",
  imageUrl: "",
  capacity: ""
};

/** ISO 文字列を <input type="datetime-local"> が受け取る形（ローカル時刻）に直す */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function EventForm({ initialEvent, companies = [] }: { initialEvent?: EventItem; companies?: CompanyOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormState>(EMPTY);
  /** ブックマークレットが拾った日程などの手がかり。表示専用で、登録内容には含めない。 */
  const [hints, setHints] = useState("");
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!initialEvent) return;
    setForm({
      companyId: initialEvent.companyId ?? "",
      url: initialEvent.url,
      title: initialEvent.title,
      kind: initialEvent.kind,
      format: initialEvent.format,
      prefecture: initialEvent.prefecture ?? "",
      venue: initialEvent.venue ?? "",
      startsAt: toLocalInput(initialEvent.startsAt),
      endsAt: toLocalInput(initialEvent.endsAt),
      applyDeadline: toLocalInput(initialEvent.applyDeadline),
      organizer: initialEvent.organizer ?? "",
      organizerUrl: initialEvent.organizerUrl ?? "",
      prize: initialEvent.prize ?? "",
      tags: initialEvent.tags.join(", "),
      description: initialEvent.description ?? "",
      imageUrl: initialEvent.imageUrl ?? "",
      capacity: initialEvent.capacity?.toString() ?? ""
    });
  }, [initialEvent]);

  // ブックマークレットから飛んできた場合はクエリで前埋めする
  useEffect(() => {
    const fromQuery: Partial<FormState> = {};
    for (const key of Object.keys(EMPTY) as Array<keyof FormState>) {
      const value = searchParams.get(key);
      if (value) fromQuery[key] = value as never;
    }

    const hintParam = searchParams.get("hints");
    if (hintParam) setHints(hintParam);

    if (Object.keys(fromQuery).length === 0) return;

    setForm((prev) => ({
      ...prev,
      ...fromQuery,
      startsAt: fromQuery.startsAt ? toLocalInput(fromQuery.startsAt) : prev.startsAt,
      endsAt: fromQuery.endsAt ? toLocalInput(fromQuery.endsAt) : prev.endsAt
    }));
    setNotice("ブックマークレットから受け取った内容を入れました。内容を確認してください。");
  }, [searchParams]);

  const handleFetchMeta = useCallback(async () => {
    if (!form.url.trim()) {
      setError("先に URL を入れてください");
      return;
    }
    setError(null);
    setNotice(null);
    setFetching(true);

    try {
      const res = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: form.url.trim() })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? `取得に失敗しました (${res.status})`);
        return;
      }

      const { meta, suggestion } = data;
      setForm((prev) => ({
        ...prev,
        url: meta.url ?? prev.url,
        title: prev.title || (meta.title ?? ""),
        description: prev.description || (meta.description ?? ""),
        imageUrl: prev.imageUrl || (meta.imageUrl ?? ""),
        organizer: prev.organizer || (suggestion.organizer ?? ""),
        venue: prev.venue || (meta.venue ?? ""),
        startsAt: prev.startsAt || toLocalInput(meta.startsAt),
        endsAt: prev.endsAt || toLocalInput(meta.endsAt),
        kind: suggestion.kind ?? prev.kind,
        format: suggestion.format ?? prev.format
      }));

      setNotice(
        meta.startsAt
          ? "取得しました。日程はページの構造化データから拾えています。"
          : "取得しました。開催日時はページから拾えなかったので手で入れてください。"
      );
    } catch {
      setError("取得に失敗しました");
    } finally {
      setFetching(false);
    }
  }, [form.url]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: initialEvent?.id,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : "",
          applyDeadline: form.applyDeadline ? new Date(form.applyDeadline).toISOString() : "",
          tags: form.tags,
          capacity: form.capacity
        })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? `登録に失敗しました (${res.status})`);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  const detectedSource = form.url ? ingestSourceFromUrl(form.url) : null;

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {/* URL + 取得 */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <Field
          label="告知ページ URL（必須・重複登録のキー）"
          hint={detectedSource ? `取得元の判定: ${detectedSource}` : undefined}
        >
          <div className="flex gap-2">
            <Input
              type="url"
              required
              placeholder="https://job.mynavi.jp/... / https://x.com/.../status/..."
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
            />
            <Button type="button" variant="outline" onClick={handleFetchMeta} disabled={fetching}>
              {fetching ? "取得中..." : "取得"}
            </Button>
          </div>
        </Field>
      </div>

      {hints && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mb-1 font-semibold">ページから拾えた手がかり（登録内容には含まれません）</div>
          <p className="leading-relaxed">{hints}</p>
        </div>
      )}

      {notice && (
        <p className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      )}

      <Field label="イベント名（必須）">
        <Input required value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <Field label="企業との紐付け" hint="企業台帳の投稿・イベント件数に反映されます">
        <select className={SELECT_CLASS} value={form.companyId} onChange={(e) => set("companyId", e.target.value)}>
          <option value="">企業に紐付けない</option>
          {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="種別">
          <select
            className={SELECT_CLASS}
            value={form.kind}
            onChange={(e) => set("kind", e.target.value as EventKind)}
          >
            {EVENT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {EVENT_KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="開催形式">
          <select
            className={SELECT_CLASS}
            value={form.format}
            onChange={(e) => set("format", e.target.value as EventFormat)}
          >
            {EVENT_FORMATS.map((format) => (
              <option key={format} value={format}>
                {EVENT_FORMAT_LABEL[format]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="都道府県"
          hint={form.format === "ONLINE" ? "オンライン開催なので保存されません" : "地域フィルタの選択肢になります"}
        >
          <Input
            placeholder="東京都"
            disabled={form.format === "ONLINE"}
            value={form.prefecture}
            onChange={(e) => set("prefecture", e.target.value)}
          />
        </Field>
        <Field label="会場">
          <Input value={form.venue} onChange={(e) => set("venue", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="開催日時（必須）">
          <Input
            type="datetime-local"
            required
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
          />
        </Field>
        <Field label="終了日時">
          <Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
        </Field>
        <Field label="応募締切" hint="入れるとカウントダウンの基準になります">
          <Input
            type="datetime-local"
            value={form.applyDeadline}
            onChange={(e) => set("applyDeadline", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="主催者">
          <Input value={form.organizer} onChange={(e) => set("organizer", e.target.value)} />
        </Field>
        <Field label="主催者URL">
          <Input type="url" value={form.organizerUrl} onChange={(e) => set("organizerUrl", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="賞金・特典">
          <Input placeholder="優勝 30万円" value={form.prize} onChange={(e) => set("prize", e.target.value)} />
        </Field>
        <Field label="定員">
          <Input inputMode="numeric" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
        </Field>
      </div>

      <Field label="タグ" hint="カンマ区切り。最大12個">
        <Input
          placeholder="ハッカソン, 学生, オンライン"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
        />
      </Field>

      <Field
        label="概要"
        hint="200文字で保存されます。詳細は告知ページへのリンクで見せる方針なので、丸ごと転載せず要点だけ書いてください。"
      >
        <textarea
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "保存中..." : initialEvent ? "更新する" : "登録する"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin")}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
