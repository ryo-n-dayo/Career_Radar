import { Suspense } from "react";

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { PostManager } from "@/features/posts/PostManager";
import { PostBookmarklet } from "@/features/posts/PostBookmarklet";
import type { PostItem } from "@/features/posts/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const [rows, companies] = await Promise.all([
    prisma.savedPost.findMany({ orderBy: { savedAt: "desc" }, include: { company: true } }),
    prisma.company.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);
  const posts: PostItem[] = rows.map((post) => ({ id: post.id, url: post.url, author: post.author ?? undefined, account: post.account ?? undefined, content: post.content, summary: post.summary ?? undefined, memo: post.memo ?? undefined, tags: Array.isArray(post.tags) ? post.tags as string[] : [], postedAt: post.postedAt?.toISOString(), savedAt: post.savedAt.toISOString(), companyId: post.companyId ?? undefined, companyName: post.company?.name }));
  return <WorkspaceShell><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">X投稿</h1><p className="mt-1 text-sm text-muted-foreground">残したい投稿を要約し、企業やタグと一緒に保存します。</p></div><PostBookmarklet /></div><p className="mt-2 text-[11px] text-muted-foreground">右のボタンをブックマークバーへドラッグし、Xの投稿ページで実行してください。</p><div className="mt-6"><Suspense fallback={<p>読み込み中...</p>}><PostManager posts={posts} companies={companies} /></Suspense></div></div></WorkspaceShell>;
}
