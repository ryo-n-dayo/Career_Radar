"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCompanyCredentials, type CompanyCredential } from "../hooks/useCompanyCredentials";

type Props = {
  companyId: string;
  companyName: string;
};

const EMPTY: CompanyCredential = { loginUrl: "", loginId: "", password: "", note: "" };

export function CredentialsSection({ companyId, companyName }: Props) {
  const { get, save, remove } = useCompanyCredentials();
  const stored = get(companyId);

  const [form, setForm] = useState<CompanyCredential>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setForm(stored ?? EMPTY);
    setEditing(!stored);
    setShowPassword(false);
  }, [companyId, stored?.updatedAt]);

  const onSave = () => {
    save(companyId, {
      loginUrl: form.loginUrl?.trim() || undefined,
      loginId: form.loginId?.trim() || undefined,
      password: form.password || undefined,
      note: form.note?.trim() || undefined
    });
    setEditing(false);
    setShowPassword(false);
  };

  const onDelete = () => {
    if (!confirm(`${companyName} の保存済み認証情報を削除しますか?`)) return;
    remove(companyId);
    setForm(EMPTY);
    setEditing(true);
  };

  const hasAny = Boolean(stored?.loginId || stored?.password || stored?.loginUrl);

  if (!editing && hasAny) {
    return (
      <div className="flex flex-col gap-2">
        <div className="divide-y divide-border rounded-xl border border-border bg-muted/30 px-3">
          {stored?.loginUrl && (
            <Row label="URL">
              <a
                href={stored.loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-foreground/90 underline hover:text-foreground"
              >
                {stored.loginUrl}
              </a>
            </Row>
          )}
          {stored?.loginId && (
            <Row label="ID">
              <div className="flex items-center gap-2">
                <span className="truncate text-foreground/90">{stored.loginId}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(stored.loginId!)}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  コピー
                </button>
              </div>
            </Row>
          )}
          {stored?.password && (
            <Row label="パスワード">
              <div className="flex items-center gap-2">
                <span className="truncate font-mono text-foreground/90">
                  {showPassword ? stored.password : "•".repeat(Math.min(stored.password.length, 10))}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "隠す" : "表示"}
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(stored.password!)}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  コピー
                </button>
              </div>
            </Row>
          )}
          {stored?.note && <Row label="メモ">{stored.note}</Row>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="yui-pill"
            onClick={() => setEditing(true)}
          >
            編集
          </Button>
          <Button size="sm" variant="ghost" className="yui-pill" onClick={onDelete}>
            削除
          </Button>
          {stored?.updatedAt && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              更新: {new Date(stored.updatedAt).toLocaleString("ja-JP")}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        ブラウザのlocalStorageに保存されます。共用端末では使用しないでください。
      </p>
      <Field label="ログインURL">
        <Input
          type="url"
          placeholder="https://..."
          value={form.loginUrl ?? ""}
          onChange={(e) => setForm({ ...form, loginUrl: e.target.value })}
        />
      </Field>
      <Field label="ID / メール">
        <Input
          type="text"
          autoComplete="off"
          value={form.loginId ?? ""}
          onChange={(e) => setForm({ ...form, loginId: e.target.value })}
        />
      </Field>
      <Field label="パスワード">
        <div className="flex items-center gap-2">
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.password ?? ""}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            {showPassword ? "隠す" : "表示"}
          </button>
        </div>
      </Field>
      <Field label="メモ">
        <Input
          type="text"
          placeholder="例: 秘密の質問、2FA、登録日など"
          value={form.note ?? ""}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </Field>
      <div className="flex items-center gap-2">
        <Button size="sm" className="yui-pill" onClick={onSave}>
          保存
        </Button>
        {hasAny && (
          <Button
            size="sm"
            variant="ghost"
            className="yui-pill"
            onClick={() => {
              setForm(stored ?? EMPTY);
              setEditing(false);
            }}
          >
            キャンセル
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-sm">
      <div className="w-20 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
