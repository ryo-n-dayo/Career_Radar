import type { RadarItem } from "../types/radarItem";

export const radarItems: RadarItem[] = [
  {
    id: "r1",
    companyName: "株式会社サンプルテック",
    category: "インターン",
    content: "サマーインターン（Web/AIコース）募集開始",
    date: "2026-05-10",
    deadlineLabel: "締切",
    aiHeat: 95,
    keywords: ["裁量", "成長", "技術ブログ"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://sampletech.example.com/careers", fetchedAt: new Date("2026-04-20") },
      { type: "X", url: "https://x.com/sampletech/status/12345", fetchedAt: new Date("2026-04-21") }
    ],
    saved: true,
    xInsights: [
      { author: "元社員A", role: "エンジニア", date: "2026-04-18", message: "裁量が大きく、技術ブログで情報発信する雰囲気がある。" },
      { author: "社員B", role: "人事", date: "2026-04-14", message: "サマーインターンはWeb/AI枠で新卒にも積極的。" }
    ],
    trust: "official"
  },
  {
    id: "r2",
    companyName: "Example Consulting",
    category: "早期選考",
    content: "早期選考ルート（説明会参加者向け）",
    date: "2026-04-28",
    deadlineLabel: "早期選考",
    aiHeat: 88,
    keywords: ["論理", "ケース面接", "教育制度"],
    sources: [
      { type: "X", url: "https://x.com/exampleconsulting/status/24680", fetchedAt: new Date("2026-04-18") },
      { type: "OFFICIAL_WEB", url: "https://exampleconsulting.com/early", fetchedAt: new Date("2026-04-19") }
    ],
    trust: "needs_review"
  },
  {
    id: "r3",
    companyName: "株式会社メディアラボ",
    category: "セミナー",
    content: "オンライン会社説明会（エンジニア職）",
    date: "2026-04-25",
    deadlineLabel: "説明会",
    aiHeat: 72,
    keywords: ["フルリモート", "メディア", "副業可"],
    sources: [
      { type: "X", url: "https://x.com/medialab/status/98765", fetchedAt: new Date("2026-04-15") }
    ],
    xInsights: [
      { author: "元社員C", role: "デザイナー", date: "2026-04-12", message: "説明会ではプロダクトのUXへのこだわりが強調されていた。" }
    ],
    trust: "needs_review"
  },
  {
    id: "r4",
    companyName: "Sunrise FinTech",
    category: "本選考",
    content: "本選考エントリー受付開始",
    date: "2026-05-03",
    deadlineLabel: "締切",
    aiHeat: 79,
    keywords: ["金融", "堅実", "セキュリティ"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://sunrisefintech.com/recruit", fetchedAt: new Date("2026-04-22") }
    ],
    saved: true,
    trust: "official"
  },
  {
    id: "r5",
    companyName: "Green Mobility",
    category: "説明会",
    content: "オフライン説明会（渋谷）",
    date: "2026-04-30",
    deadlineLabel: "説明会",
    aiHeat: 61,
    keywords: ["EV", "社会貢献", "ハード×ソフト"],
    sources: [
      { type: "X", url: "https://x.com/greenmobility/status/13579", fetchedAt: new Date("2026-04-10") },
      { type: "OFFICIAL_WEB", url: "https://greenmobility.jp/session", fetchedAt: new Date("2026-04-11") }
    ],
    trust: "official"
  },
  {
    id: "r6",
    companyName: "Neon Games",
    category: "インターン",
    content: "2週間インターン（ゲームクライアント）",
    date: "2026-05-20",
    deadlineLabel: "締切",
    aiHeat: 83,
    keywords: ["Unity", "チーム開発", "スピード"],
    sources: [
      { type: "X", url: "https://x.com/neongames/status/45678", fetchedAt: new Date("2026-04-25") },
      { type: "OFFICIAL_WEB", url: "https://neongames.co.jp/intern", fetchedAt: new Date("2026-04-26") }
    ],
    trust: "needs_review"
  },
  {
    id: "r7",
    companyName: "Atlas Manufacturing",
    category: "セミナー",
    content: "業界研究セミナー（製造DX）",
    date: "2026-05-01",
    deadlineLabel: "説明会",
    aiHeat: 54,
    keywords: ["DX", "現場", "安定"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://atlas-mfg.example.com/seminar", fetchedAt: new Date("2026-04-12") }
    ],
    trust: "needs_review"
  },
  {
    id: "r8",
    companyName: "Cloud Note",
    category: "早期選考",
    content: "プロダクト職 早期選考（ポートフォリオ必須）",
    date: "2026-04-27",
    deadlineLabel: "早期選考",
    aiHeat: 91,
    keywords: ["プロダクト", "ユーザー志向", "データ"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://cloudnote.io/careers", fetchedAt: new Date("2026-04-14") },
      { type: "X", url: "https://x.com/cloudnote/status/34567", fetchedAt: new Date("2026-04-16") }
    ],
    saved: true,
    trust: "official"
  },
  {
    id: "r9",
    companyName: "Open Education",
    category: "説明会",
    content: "教育×AI ミートアップ（学生向け）",
    date: "2026-05-08",
    deadlineLabel: "説明会",
    aiHeat: 67,
    keywords: ["教育", "AI", "コミュニティ"],
    sources: [
      { type: "X", url: "https://x.com/openedu/status/78901", fetchedAt: new Date("2026-04-08") },
      { type: "OFFICIAL_WEB", url: "https://openedu.example.com/meetup", fetchedAt: new Date("2026-04-09") }
    ],
    trust: "needs_review"
  },
  {
    id: "r10",
    companyName: "Secure Stack",
    category: "本選考",
    content: "セキュリティエンジニア職 本選考",
    date: "2026-05-06",
    deadlineLabel: "締切",
    aiHeat: 86,
    keywords: ["セキュリティ", "SRE", "学習支援"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://securestack.dev/jobs", fetchedAt: new Date("2026-04-23") },
      { type: "X", url: "https://x.com/securestack/status/54321", fetchedAt: new Date("2026-04-24") }
    ],
    trust: "official"
  }
];

