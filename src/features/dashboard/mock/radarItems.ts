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
    trust: "official",
    companyProfile: {
      overview: "Web/AI領域のプロダクト開発を主軸に、SaaSと受託を組み合わせた事業展開。技術ブログ・OSS活動に積極的。",
      industry: "情報・通信 / SaaS",
      founded: "2014年",
      headquarters: "東京都渋谷区",
      employees: "約420名",
      revenue: "78億円（2025年3月期）",
      hiringCount: "新卒30名 / 26卒予定",
      hiringRoles: ["ソフトウェアエンジニア", "AIリサーチャー", "プロダクトデザイナー"],
      selectionFlow: ["書類選考", "コーディング課題", "1次面接", "最終面接"],
      website: "https://sampletech.example.com"
    }
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
    trust: "needs_review",
    companyProfile: {
      overview: "戦略系コンサルティングファーム。大企業のDX・新規事業立ち上げ支援を中心に、ケース面接を重視した選考。",
      industry: "コンサルティング",
      founded: "2008年",
      headquarters: "東京都千代田区",
      employees: "約650名",
      revenue: "非公開",
      hiringCount: "新卒20〜25名",
      hiringRoles: ["コンサルタント", "ビジネスアナリスト"],
      selectionFlow: ["ES/WEBテスト", "ケース面接(2回)", "最終面接"],
      website: "https://exampleconsulting.com"
    }
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
    trust: "needs_review",
    companyProfile: {
      overview: "自社メディア運営とコンテンツ配信プラットフォーム開発。フルリモート・副業可の柔軟な働き方が特徴。",
      industry: "メディア / インターネット",
      founded: "2017年",
      headquarters: "東京都港区",
      employees: "約150名",
      hiringCount: "新卒10名程度",
      hiringRoles: ["エンジニア", "編集者", "ビジネス職"],
      selectionFlow: ["書類選考", "カジュアル面談", "最終面接"],
      website: "https://medialab.example.com"
    }
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
    trust: "official",
    companyProfile: {
      overview: "金融機関向けのAPI・セキュリティ基盤を提供。安定した収益と高いコンプライアンス基準が特徴。",
      industry: "金融 / FinTech",
      founded: "2011年",
      headquarters: "東京都中央区",
      employees: "約800名",
      revenue: "120億円（2025年3月期）",
      hiringCount: "新卒40名",
      hiringRoles: ["エンジニア", "セキュリティ", "総合職"],
      selectionFlow: ["ES", "適性検査", "技術面接", "最終面接"],
      website: "https://sunrisefintech.com"
    }
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
    trust: "official",
    companyProfile: {
      overview: "EV・MaaS領域のハードウェア×ソフトウェア開発。社会貢献とモビリティ未来創造をミッションに掲げる。",
      industry: "モビリティ / 製造",
      founded: "2019年",
      headquarters: "東京都渋谷区",
      employees: "約280名",
      hiringCount: "新卒15名",
      hiringRoles: ["組込みエンジニア", "機械設計", "ソフトウェア"],
      selectionFlow: ["書類選考", "面接(2回)", "最終面接"],
      website: "https://greenmobility.jp"
    }
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
    trust: "needs_review",
    companyProfile: {
      overview: "オリジナルIPゲームの企画・開発。Unityを用いたチーム開発とスピード感のある意思決定が強み。",
      industry: "ゲーム / エンタメ",
      founded: "2015年",
      headquarters: "東京都新宿区",
      employees: "約320名",
      hiringCount: "新卒25名",
      hiringRoles: ["ゲームプランナー", "Unityエンジニア", "3Dアーティスト"],
      selectionFlow: ["ポートフォリオ提出", "面接(2回)", "最終面接"],
      website: "https://neongames.co.jp"
    }
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
    trust: "needs_review",
    companyProfile: {
      overview: "大手製造業向けのDXソリューション。工場の現場に入り込んだコンサルティング×システム導入が強み。",
      industry: "製造 / SIer",
      founded: "2005年",
      headquarters: "愛知県名古屋市",
      employees: "約1,200名",
      revenue: "230億円（2025年3月期）",
      hiringCount: "新卒50名",
      hiringRoles: ["SE", "生産技術", "営業"],
      selectionFlow: ["ES", "WEBテスト", "面接(2回)", "最終面接"],
      website: "https://atlas-mfg.example.com"
    }
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
    trust: "official",
    companyProfile: {
      overview: "ノートSaaSを主力に、データ駆動のプロダクト開発とユーザー志向を徹底。海外展開も視野に。",
      industry: "SaaS / 生産性ツール",
      founded: "2016年",
      headquarters: "東京都目黒区",
      employees: "約210名",
      revenue: "45億円（2025年12月期）",
      hiringCount: "新卒12名",
      hiringRoles: ["プロダクトマネージャー", "エンジニア", "デザイナー"],
      selectionFlow: ["ポートフォリオ提出", "カジュアル面談", "面接(2回)", "最終面接"],
      website: "https://cloudnote.io"
    }
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
    trust: "needs_review",
    companyProfile: {
      overview: "教育×AIのEdTech企業。学習体験の個別最適化をミッションに、コミュニティ運営にも注力。",
      industry: "EdTech",
      founded: "2018年",
      headquarters: "東京都文京区",
      employees: "約95名",
      hiringCount: "新卒5〜8名",
      hiringRoles: ["エンジニア", "コンテンツ開発", "カスタマーサクセス"],
      selectionFlow: ["書類選考", "面接(2回)"],
      website: "https://openedu.example.com"
    }
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
    trust: "official",
    companyProfile: {
      overview: "セキュリティ領域のクラウド基盤・SREを提供。エンジニアの学習支援制度が充実。",
      industry: "セキュリティ / クラウド",
      founded: "2013年",
      headquarters: "東京都品川区",
      employees: "約380名",
      revenue: "62億円（2025年12月期）",
      hiringCount: "新卒18名",
      hiringRoles: ["セキュリティエンジニア", "SRE", "バックエンド"],
      selectionFlow: ["ES", "技術課題", "面接(2回)", "最終面接"],
      website: "https://securestack.dev"
    }
  }
];

