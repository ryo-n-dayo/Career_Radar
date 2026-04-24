import type { RadarItem } from "../types/radarItem";

export const radarItems: RadarItem[] = [
  {
    id: "r1",
    companyName: "株式会社サイバーエージェント",
    category: "インターン",
    content: "サマーインターン「ACE」エンジニアコース募集開始",
    date: "2026-05-10",
    deadlineLabel: "締切",
    aiHeat: 95,
    keywords: ["裁量", "若手抜擢", "メディア"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.cyberagent.co.jp/careers/students/", fetchedAt: new Date("2026-04-20") },
      { type: "X", url: "https://x.com/CyberAgent_PR", fetchedAt: new Date("2026-04-21") }
    ],
    saved: true,
    xInsights: [
      { author: "元インターン生", role: "エンジニア", date: "2026-04-18", message: "若手に裁量が大きく、新規事業の立ち上げに関われる機会が多かった。" },
      { author: "現役社員", role: "人事", date: "2026-04-14", message: "ABEMAやゲーム、広告など多様な事業領域から選べるのが特徴。" }
    ],
    trust: "official",
    companyProfile: {
      overview: "ABEMA・ゲーム・インターネット広告・メディアを展開するメガベンチャー。新規事業と若手抜擢の文化で知られる。",
      mission: "新しい力とインターネットで日本の閉塞感を打破する",
      industry: "インターネット / メディア / 広告",
      ceo: "藤田 晋（代表取締役）",
      founded: "1998年3月",
      headquarters: "東京都渋谷区（渋谷スクランブルスクエア）",
      capital: "72億3,990万円",
      employees: "連結 約7,400名",
      revenue: "連結 7,202億円（2024年9月期）",
      listed: "東証プライム",
      ticker: "4751",
      businessSegments: [
        "メディア事業（ABEMA / WINTICKET / TapTap等）",
        "インターネット広告事業（広告代理事業・広告プロダクト）",
        "ゲーム事業（Cygames, サイバーエージェント ゲーム部門）",
        "投資育成事業（藤田ファンド等）"
      ],
      hiringCount: "新卒100名以上",
      hiringRoles: ["ビジネスコース", "エンジニアコース", "デザイナーコース"],
      selectionFlow: ["エントリー", "適性検査", "面接(複数回)", "最終面接"],
      website: "https://www.cyberagent.co.jp"
    }
  },
  {
    id: "r2",
    companyName: "アクセンチュア株式会社",
    category: "早期選考",
    content: "ビジネスコンサルタント職 早期選考エントリー受付",
    date: "2026-04-28",
    deadlineLabel: "早期選考",
    aiHeat: 88,
    keywords: ["戦略", "DX", "グローバル"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.accenture.com/jp-ja/careers", fetchedAt: new Date("2026-04-19") },
      { type: "X", url: "https://x.com/AccentureJapan", fetchedAt: new Date("2026-04-18") }
    ],
    trust: "official",
    companyProfile: {
      overview: "世界最大級の総合コンサルティングファーム。戦略からデジタル・テクノロジー・オペレーションまで一気通貫で支援。",
      mission: "Let there be change.（変革を起こす）",
      industry: "コンサルティング / ITサービス",
      ceo: "江川 昌史（日本法人 代表取締役社長）",
      founded: "1989年（日本法人）",
      headquarters: "東京都港区（赤坂インターシティAIR）",
      employees: "日本 約23,000名 / 世界 約77万名",
      revenue: "グローバル 649億USD（2024年8月期）",
      listed: "親会社NYSE上場",
      ticker: "ACN (NYSE)",
      businessSegments: [
        "ストラテジー＆コンサルティング（経営戦略・DX戦略）",
        "テクノロジー（システム構築・クラウド・AI）",
        "オペレーションズ（BPO・マネージドサービス）",
        "Song（デジタルマーケティング・顧客体験）",
        "インダストリーX（製造・エンジニアリングDX）"
      ],
      hiringCount: "新卒 数百名規模",
      hiringRoles: ["ビジネスコンサルタント", "デジタルコンサルタント", "テクノロジーコンサルタント"],
      selectionFlow: ["ES/適性検査", "ケース面接", "複数回面接", "最終面接"],
      website: "https://www.accenture.com/jp-ja"
    }
  },
  {
    id: "r3",
    companyName: "note株式会社",
    category: "セミナー",
    content: "オンライン会社説明会（エンジニア・デザイナー職）",
    date: "2026-04-25",
    deadlineLabel: "説明会",
    aiHeat: 72,
    keywords: ["クリエイター", "メディア", "フルリモート"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://note.jp/n/n0dcc914b81e8", fetchedAt: new Date("2026-04-15") }
    ],
    xInsights: [
      { author: "現役社員", role: "デザイナー", date: "2026-04-12", message: "「だれもが創作をはじめ、続けられるようにする」ミッションへの共感が強い人が多い。" }
    ],
    trust: "official",
    companyProfile: {
      overview: "クリエイター向けメディアプラットフォーム「note」を運営。創作を後押しするサービス設計と社内カルチャーが特徴。",
      mission: "だれもが創作をはじめ、続けられるようにする",
      industry: "インターネット / メディア",
      ceo: "加藤 貞顕（代表取締役CEO）",
      founded: "2011年12月（旧：株式会社ピースオブケイク）",
      headquarters: "東京都千代田区（麹町）",
      employees: "約300名",
      listed: "東証グロース",
      ticker: "5243",
      businessSegments: [
        "コンテンツ配信プラットフォーム「note」",
        "法人向け情報発信SaaS「note pro」",
        "有料購読マガジン・定期購読課金",
        "クリエイター支援プログラム / イベント"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["エンジニア", "デザイナー", "ビジネス職"],
      selectionFlow: ["書類選考", "カジュアル面談", "面接(複数回)", "最終面接"],
      website: "https://note.jp"
    }
  },
  {
    id: "r4",
    companyName: "株式会社マネーフォワード",
    category: "本選考",
    content: "総合職・エンジニア職 本選考エントリー開始",
    date: "2026-05-03",
    deadlineLabel: "締切",
    aiHeat: 79,
    keywords: ["FinTech", "SaaS", "成長"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://recruit.moneyforward.com/", fetchedAt: new Date("2026-04-22") }
    ],
    saved: true,
    trust: "official",
    companyProfile: {
      overview: "個人向け家計簿アプリと法人向けバックオフィスSaaSを展開するFinTech企業。",
      mission: "お金を前へ。人生をもっと前へ。",
      industry: "FinTech / SaaS",
      ceo: "辻 庸介（代表取締役社長 グループCEO）",
      founded: "2012年5月",
      headquarters: "東京都港区（芝浦シーバンス）",
      employees: "連結 約2,200名",
      revenue: "連結 353億円（2024年11月期）",
      listed: "東証プライム",
      ticker: "3994",
      businessSegments: [
        "Business ドメイン（クラウドERP『マネーフォワード クラウド』）",
        "Home ドメイン（家計簿アプリ『マネーフォワード ME』）",
        "Finance ドメイン（SaaSマーケットプレイス・資金調達支援）",
        "X ドメイン（地方金融機関向けサービス）"
      ],
      hiringCount: "新卒数十名規模",
      hiringRoles: ["エンジニア", "デザイナー", "ビジネス職"],
      selectionFlow: ["ES", "適性検査", "面接(複数回)", "最終面接"],
      website: "https://corp.moneyforward.com"
    }
  },
  {
    id: "r5",
    companyName: "株式会社ディー・エヌ・エー",
    category: "説明会",
    content: "エンジニア職 会社説明会（ライブ配信 / ヘルスケア / ゲーム）",
    date: "2026-04-30",
    deadlineLabel: "説明会",
    aiHeat: 78,
    keywords: ["多事業", "AI", "若手裁量"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://dena.com/jp/recruit/newgrads/", fetchedAt: new Date("2026-04-11") },
      { type: "X", url: "https://x.com/DeNAOfficial", fetchedAt: new Date("2026-04-12") }
    ],
    trust: "official",
    companyProfile: {
      overview: "ゲーム・ライブストリーミング・ヘルスケア・スポーツ・オートモーティブを展開。インターネットとAIで多領域に挑む。",
      mission: "一人ひとりに想像を超えるDelightを",
      industry: "インターネット / ゲーム / ヘルスケア",
      ceo: "岡村 信悟（代表取締役会長 兼 社長CEO）",
      founded: "1999年3月",
      headquarters: "東京都渋谷区（渋谷ヒカリエ）",
      employees: "連結 約2,100名",
      revenue: "連結 1,367億円（2024年3月期）",
      listed: "東証プライム",
      ticker: "2432",
      businessSegments: [
        "ゲーム事業（Pococha廃止後の新ゲーム群）",
        "ライブストリーミング事業（IRIAM）",
        "スポーツ事業（横浜DeNAベイスターズ / 川崎ブレイブサンダース）",
        "ヘルスケア・メディカル事業",
        "オートモーティブ（タクシー配車等）"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["ソフトウェアエンジニア", "AIスペシャリスト", "ビジネス", "デザイナー"],
      selectionFlow: ["ES", "コーディング試験", "面接(複数回)", "最終面接"],
      website: "https://dena.com/jp/"
    }
  },
  {
    id: "r6",
    companyName: "株式会社Cygames",
    category: "インターン",
    content: "ゲームクライアント2週間インターン募集",
    date: "2026-05-20",
    deadlineLabel: "締切",
    aiHeat: 83,
    keywords: ["ゲーム", "Unity", "クオリティ"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.cygames.co.jp/recruit/", fetchedAt: new Date("2026-04-26") },
      { type: "X", url: "https://x.com/Cygames_PR", fetchedAt: new Date("2026-04-25") }
    ],
    trust: "official",
    companyProfile: {
      overview: "『ウマ娘 プリティーダービー』『グランブルーファンタジー』等を開発するゲーム企業。高品質への徹底的なこだわりが特徴。",
      mission: "最高のコンテンツを作る会社",
      industry: "ゲーム / エンタメ",
      ceo: "渡邊 耕一（代表取締役社長）",
      founded: "2011年5月",
      headquarters: "東京都渋谷区",
      employees: "約3,100名",
      listed: "非上場（サイバーエージェントグループ）",
      businessSegments: [
        "モバイルゲーム事業（ウマ娘 / グラブル / プリコネR等）",
        "コンシューマーゲーム（GRANBLUE FANTASY: Relink 等）",
        "IPコンテンツ展開（アニメ・書籍・音楽）",
        "eスポーツ / ブランドマーケティング"
      ],
      hiringCount: "新卒数十名規模",
      hiringRoles: ["ゲームプランナー", "エンジニア", "デザイナー", "サウンド"],
      selectionFlow: ["ES/ポートフォリオ", "適性検査", "面接(複数回)", "最終面接"],
      website: "https://www.cygames.co.jp"
    }
  },
  {
    id: "r7",
    companyName: "富士通株式会社",
    category: "セミナー",
    content: "業界研究セミナー（製造業DX / Uvance）",
    date: "2026-05-01",
    deadlineLabel: "説明会",
    aiHeat: 54,
    keywords: ["DX", "Uvance", "安定"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.fujitsu.com/jp/about/careers/newgraduates/", fetchedAt: new Date("2026-04-12") }
    ],
    trust: "official",
    companyProfile: {
      overview: "国内最大級のITサービス企業。サステナビリティ起点の新事業ブランド「Fujitsu Uvance」で社会課題解決型DXを推進。",
      mission: "イノベーションによって社会に信頼をもたらし、世界をより持続可能にしていく",
      industry: "ITサービス / SIer",
      ceo: "時田 隆仁（代表取締役社長CEO）",
      founded: "1935年6月",
      headquarters: "神奈川県川崎市（本社）/ 東京都港区（汐留）",
      capital: "3,246億円",
      employees: "連結 約124,000名",
      revenue: "連結 3兆7,560億円（2024年3月期）",
      listed: "東証プライム",
      ticker: "6702",
      businessSegments: [
        "サービスソリューション（Fujitsu Uvance / 業種別DX）",
        "ハードウェアソリューション（PRIMERGY / ETERNUS等）",
        "ユビキタスソリューション（PC・スマホ・車載機器）",
        "デバイスソリューション（半導体パッケージ・電子部品）"
      ],
      hiringCount: "新卒 約700名",
      hiringRoles: ["SE / ITスペシャリスト", "ビジネスプロデューサー", "研究開発", "スタッフ職"],
      selectionFlow: ["ES", "WEBテスト", "面接(複数回)", "最終面接"],
      website: "https://www.fujitsu.com/jp/"
    }
  },
  {
    id: "r8",
    companyName: "株式会社SmartHR",
    category: "早期選考",
    content: "プロダクト職 早期選考（ポートフォリオ必須）",
    date: "2026-04-27",
    deadlineLabel: "早期選考",
    aiHeat: 91,
    keywords: ["HR Tech", "SaaS", "ユーザー志向"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://hello-world.smarthr.co.jp/", fetchedAt: new Date("2026-04-14") },
      { type: "X", url: "https://x.com/SmartHR_jp", fetchedAt: new Date("2026-04-16") }
    ],
    saved: true,
    trust: "official",
    companyProfile: {
      overview: "クラウド人事労務ソフト「SmartHR」を開発・提供。国内HR SaaS領域のリーディングカンパニー。",
      mission: "well-working 労働にまつわる社会課題をなくし、誰もがその人らしく働ける社会をつくる。",
      industry: "SaaS / HR Tech",
      ceo: "芹澤 雅人（代表取締役CEO）",
      founded: "2013年1月",
      headquarters: "東京都港区（六本木ヒルズ森タワー）",
      employees: "約1,000名",
      listed: "非上場（ユニコーン）",
      businessSegments: [
        "クラウド人事労務ソフト「SmartHR」",
        "タレントマネジメント機能（従業員サーベイ / 人事評価等）",
        "労務手続き電子化・マイナンバー管理",
        "SmartHR Plus（サードパーティーアプリ連携）"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["プロダクトエンジニア", "プロダクトデザイナー", "プロダクトマネージャー"],
      selectionFlow: ["ES/ポートフォリオ", "カジュアル面談", "面接(複数回)", "最終面接"],
      website: "https://smarthr.co.jp"
    }
  },
  {
    id: "r9",
    companyName: "atama plus株式会社",
    category: "説明会",
    content: "教育×AI ミートアップ（学生エンジニア向け）",
    date: "2026-05-08",
    deadlineLabel: "説明会",
    aiHeat: 67,
    keywords: ["EdTech", "AI", "個別最適"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://corp.atama.plus/recruit/", fetchedAt: new Date("2026-04-09") },
      { type: "X", url: "https://x.com/atamaplus", fetchedAt: new Date("2026-04-08") }
    ],
    trust: "official",
    companyProfile: {
      overview: "AI教材「atama+」を全国の塾・予備校向けに提供するEdTechスタートアップ。",
      mission: "教育に、人に、社会に、次の可能性を。",
      industry: "EdTech",
      ceo: "稲田 大輔（代表取締役）",
      founded: "2017年4月",
      headquarters: "東京都品川区（東京オフィス）",
      employees: "約250名",
      listed: "非上場",
      businessSegments: [
        "AI教材「atama+」（塾・予備校向けSaaS）",
        "atama+ オンライン塾（学習者向け直接提供）",
        "教育データ解析・学習科学研究"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["エンジニア", "プロダクトデザイナー", "ビジネス職"],
      selectionFlow: ["書類選考", "カジュアル面談", "面接(複数回)"],
      website: "https://corp.atama.plus"
    }
  },
  {
    id: "r10",
    companyName: "株式会社ラック",
    category: "本選考",
    content: "セキュリティエンジニア職 本選考",
    date: "2026-05-06",
    deadlineLabel: "締切",
    aiHeat: 86,
    keywords: ["セキュリティ", "JSOC", "インシデント対応"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.lac.co.jp/recruit/", fetchedAt: new Date("2026-04-23") }
    ],
    trust: "official",
    companyProfile: {
      overview: "国内最大級のセキュリティ監視センター「JSOC」を運営するサイバーセキュリティ専門企業。",
      mission: "社会課題の解決を追求し、DXとセキュリティで安全・安心な社会を実現する",
      industry: "情報セキュリティ / ITサービス",
      ceo: "西本 逸郎（代表取締役社長）",
      founded: "1986年10月",
      headquarters: "東京都千代田区（平河町）",
      employees: "連結 約2,700名",
      revenue: "連結 488億円（2024年3月期）",
      listed: "東証プライム",
      ticker: "3857",
      businessSegments: [
        "セキュリティソリューション（JSOC監視・緊急対応・脆弱性診断）",
        "システムインテグレーション（金融・公共向けSI）",
        "先進技術研究（サイバー救急センター / デジタルペンテスト）"
      ],
      hiringCount: "新卒 約70名",
      hiringRoles: ["セキュリティエンジニア", "システムエンジニア", "ビジネス職"],
      selectionFlow: ["ES", "適性検査", "面接(複数回)", "最終面接"],
      website: "https://www.lac.co.jp"
    }
  },
  {
    id: "r11",
    companyName: "株式会社メルカリ",
    category: "インターン",
    content: "Summer Internship for Gophers（バックエンドエンジニア）",
    date: "2026-06-15",
    deadlineLabel: "締切",
    aiHeat: 92,
    keywords: ["Go", "マイクロサービス", "英語公用語"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://careers.mercari.com/jp/", fetchedAt: new Date("2026-04-22") },
      { type: "X", url: "https://x.com/mercari_jp", fetchedAt: new Date("2026-04-22") }
    ],
    trust: "official",
    companyProfile: {
      overview: "CtoCフリマアプリ「メルカリ」「メルペイ」を運営。ダイバーシティを重視し、エンジニア組織は英語公用語化を推進。",
      mission: "あらゆる価値を循環させ、あらゆる人の可能性を広げる",
      industry: "インターネット / FinTech",
      ceo: "山田 進太郎（代表取締役 CEO）",
      founded: "2013年2月",
      headquarters: "東京都港区（六本木ヒルズ森タワー）",
      employees: "連結 約2,200名",
      revenue: "連結 1,878億円（2024年6月期）",
      listed: "東証プライム",
      ticker: "4385",
      businessSegments: [
        "マーケットプレイス事業（フリマアプリ『メルカリ』JP/US）",
        "フィンテック事業（『メルペイ』決済・後払い・信用）",
        "メルカリShops（EC出店）",
        "暗号資産 / Web3（メルコイン）"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["ソフトウェアエンジニア", "機械学習エンジニア", "デザイナー", "PM"],
      selectionFlow: ["ES/コーディング課題", "技術面接", "最終面接"],
      website: "https://about.mercari.com"
    }
  },
  {
    id: "r12",
    companyName: "LINEヤフー株式会社",
    category: "本選考",
    content: "エンジニア職 本選考（新卒採用）",
    date: "2026-06-01",
    deadlineLabel: "締切",
    aiHeat: 90,
    keywords: ["大規模サービス", "検索", "メッセージング"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.lycorp.co.jp/ja/recruit/newgraduate/", fetchedAt: new Date("2026-04-20") }
    ],
    trust: "official",
    companyProfile: {
      overview: "LINE・Yahoo! JAPAN・PayPay等のサービス群を擁する国内最大級のインターネット企業。",
      mission: "WOW！なライフプラットフォームを創り、日本や世界の人々の生活を豊かにする",
      industry: "インターネット / 検索 / メッセージング",
      ceo: "出澤 剛（代表取締役社長CEO）",
      founded: "2023年10月（経営統合）",
      headquarters: "東京都千代田区（紀尾井町）",
      employees: "連結 約28,500名",
      revenue: "連結 1兆8,146億円（2024年3月期）",
      listed: "東証プライム",
      ticker: "4689",
      businessSegments: [
        "メディア事業（Yahoo!検索、ニュース、広告）",
        "コマース事業（Yahoo!ショッピング、ZOZO、ASKUL）",
        "戦略事業（LINE / PayPay / その他FinTech）",
        "ソフトバンク/Naver連携の統合プラットフォーム"
      ],
      hiringCount: "新卒 数百名規模",
      hiringRoles: ["ソフトウェアエンジニア", "データサイエンティスト", "デザイナー", "PM"],
      selectionFlow: ["ES/コーディング試験", "技術面接", "最終面接"],
      website: "https://www.lycorp.co.jp"
    }
  },
  {
    id: "r13",
    companyName: "株式会社リクルート",
    category: "本選考",
    content: "プロダクト職（エンジニア・データサイエンティスト）本選考",
    date: "2026-05-25",
    deadlineLabel: "締切",
    aiHeat: 84,
    keywords: ["プロダクト", "データ", "スケール"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.recruit.co.jp/employment/students/", fetchedAt: new Date("2026-04-21") }
    ],
    trust: "official",
    companyProfile: {
      overview: "『Airビジネスツールズ』『SUUMO』『リクナビ』等を展開。マッチングプラットフォームとHR Technologyが柱。",
      mission: "まだ、ここにない、出会い。",
      industry: "インターネット / 人材 / SaaS",
      ceo: "出木場 久征（親会社リクルートHD 代表取締役社長）",
      founded: "1963年8月 / 2012年10月（分社化）",
      headquarters: "東京都千代田区（丸の内グラントウキョウサウスタワー）",
      employees: "連結 約58,000名（HD全体）",
      revenue: "連結 3兆4,222億円（2024年3月期・HD）",
      listed: "親会社リクルートHD 東証プライム",
      ticker: "6098",
      businessSegments: [
        "HR Technology（Indeed / Glassdoor）",
        "マッチング＆ソリューション（SUUMO / ゼクシィ / じゃらん / カーセンサー）",
        "HRソリューション（リクナビ / リクルートエージェント）",
        "Air ビジネスツール（決済・業務支援SaaS）"
      ],
      hiringCount: "新卒 約200名",
      hiringRoles: ["ソフトウェアエンジニア", "データサイエンティスト", "プロダクトマネージャー", "ビジネス"],
      selectionFlow: ["ES", "適性検査", "面接(複数回)", "最終面接"],
      website: "https://www.recruit.co.jp"
    }
  },
  {
    id: "r14",
    companyName: "楽天グループ株式会社",
    category: "早期選考",
    content: "エンジニア職 早期選考（英語面接あり）",
    date: "2026-05-12",
    deadlineLabel: "早期選考",
    aiHeat: 76,
    keywords: ["ECエコシステム", "英語公用語", "大規模基盤"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://corp.rakuten.co.jp/careers/students/", fetchedAt: new Date("2026-04-22") }
    ],
    trust: "official",
    companyProfile: {
      overview: "EC・FinTech・モバイル・コンテンツを展開するインターネットサービス企業。社内公用語は英語。",
      mission: "イノベーションを通じて、人々と社会をエンパワーメントする",
      industry: "EC / FinTech / 通信",
      ceo: "三木谷 浩史（代表取締役会長兼社長）",
      founded: "1997年2月",
      headquarters: "東京都世田谷区（玉川クリスタルパーク）",
      employees: "連結 約32,000名",
      revenue: "連結 2兆0,713億円（2024年12月期）",
      listed: "東証プライム",
      ticker: "4755",
      businessSegments: [
        "インターネットサービス（楽天市場 / 楽天トラベル / Rakuten USA）",
        "フィンテック（楽天カード / 楽天銀行 / 楽天証券）",
        "モバイル（楽天モバイル / 楽天シンフォニー）",
        "投資・コンテンツ（Viber / Viki等）"
      ],
      hiringCount: "新卒 数百名",
      hiringRoles: ["ソフトウェアエンジニア", "データサイエンティスト", "ビジネス"],
      selectionFlow: ["ES", "適性検査", "面接(複数回・英語含む)", "最終面接"],
      website: "https://corp.rakuten.co.jp"
    }
  },
  {
    id: "r15",
    companyName: "フリー株式会社（freee）",
    category: "説明会",
    content: "エンジニア向け会社説明会（クラウド会計/人事労務）",
    date: "2026-05-14",
    deadlineLabel: "説明会",
    aiHeat: 74,
    keywords: ["SaaS", "スモールビジネス", "アクセシビリティ"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://jobs.freee.co.jp/newgrad/", fetchedAt: new Date("2026-04-19") },
      { type: "X", url: "https://x.com/freee_jp", fetchedAt: new Date("2026-04-19") }
    ],
    trust: "official",
    companyProfile: {
      overview: "クラウド会計・人事労務SaaSを中心にスモールビジネスの業務効率化を支援。アクセシビリティ文化で知られる。",
      mission: "スモールビジネスを、世界の主役に。",
      industry: "SaaS / FinTech / HR Tech",
      ceo: "佐々木 大輔（CEO 代表取締役）",
      founded: "2012年7月",
      headquarters: "東京都品川区（大崎）",
      employees: "連結 約1,500名",
      revenue: "連結 252億円（2024年6月期）",
      listed: "東証グロース",
      ticker: "4478",
      businessSegments: [
        "freee会計（クラウド会計ソフト）",
        "freee人事労務（給与計算・勤怠管理）",
        "freeeサイン（電子契約）",
        "freeeカード Unlimited（事業者向け後払いカード）",
        "統合型ERP（企業版 freee）"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["エンジニア", "デザイナー", "PM", "セールス"],
      selectionFlow: ["ES", "コーディング課題", "面接(複数回)", "最終面接"],
      website: "https://corp.freee.co.jp"
    }
  },
  {
    id: "r16",
    companyName: "Sansan株式会社",
    category: "早期選考",
    content: "エンジニア職 早期選考（名刺/契約SaaS）",
    date: "2026-05-18",
    deadlineLabel: "早期選考",
    aiHeat: 73,
    keywords: ["B2B SaaS", "データ", "AI-OCR"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://jp.corp-sansan.com/recruit/newgraduate/", fetchedAt: new Date("2026-04-18") }
    ],
    trust: "official",
    companyProfile: {
      overview: "法人向け名刺管理「Sansan」、個人向け「Eight」、契約管理「Contract One」等を展開するB2B SaaS企業。",
      mission: "出会いからイノベーションを生み出す",
      industry: "B2B SaaS / AI",
      ceo: "寺田 親弘（代表取締役社長/CEO）",
      founded: "2007年6月",
      headquarters: "東京都渋谷区（表参道）",
      employees: "連結 約1,900名",
      revenue: "連結 379億円（2024年5月期）",
      listed: "東証プライム",
      ticker: "4443",
      businessSegments: [
        "Sansan事業（法人向け営業DXサービス）",
        "Eight事業（個人向け名刺アプリ / Eight Team）",
        "Bill One事業（インボイス管理クラウド）",
        "Contract One事業（契約管理クラウド）"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["Webエンジニア", "モバイルエンジニア", "研究開発(R&D)", "ビジネス"],
      selectionFlow: ["ES", "コーディング試験", "面接(複数回)", "最終面接"],
      website: "https://jp.corp-sansan.com"
    }
  },
  {
    id: "r17",
    companyName: "株式会社LayerX",
    category: "インターン",
    content: "ソフトウェアエンジニア向けサマーインターン",
    date: "2026-06-10",
    deadlineLabel: "締切",
    aiHeat: 89,
    keywords: ["SaaS", "AI-OCR", "爆速成長"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://jobs.layerx.co.jp/", fetchedAt: new Date("2026-04-22") },
      { type: "X", url: "https://x.com/LayerX_inc", fetchedAt: new Date("2026-04-22") }
    ],
    trust: "official",
    companyProfile: {
      overview: "法人支出管理SaaS「バクラク」シリーズと、三井物産デジタル・アセットマネジメント（MDM）を展開。AI-OCRに強み。",
      mission: "すべての経済活動を、デジタル化する。",
      industry: "B2B SaaS / FinTech / AI",
      ceo: "福島 良典（代表取締役CEO）",
      founded: "2018年8月",
      headquarters: "東京都中央区（日本橋）",
      employees: "約550名",
      listed: "非上場",
      businessSegments: [
        "バクラク事業（請求書処理 / 電子帳簿保存 / 法人カード）",
        "Fintech事業（三井物産デジタル・アセットマネジメント）",
        "AI・LLM事業（業務プロセスのAI自動化）",
        "Privacy Tech事業（分散ID / ブロックチェーン）"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["ソフトウェアエンジニア", "MLエンジニア", "デザイナー", "PM"],
      selectionFlow: ["書類選考", "コーディング課題", "面接(複数回)", "最終面接"],
      website: "https://layerx.co.jp"
    }
  },
  {
    id: "r18",
    companyName: "PayPay株式会社",
    category: "本選考",
    content: "ソフトウェアエンジニア 本選考エントリー",
    date: "2026-05-30",
    deadlineLabel: "締切",
    aiHeat: 85,
    keywords: ["キャッシュレス", "マイクロサービス", "グローバル"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://about.paypay.ne.jp/career/", fetchedAt: new Date("2026-04-20") }
    ],
    trust: "official",
    companyProfile: {
      overview: "国内シェアNo.1のQRコード決済サービス「PayPay」を運営。エンジニア組織は多国籍で英語も公用語に近い。",
      mission: "UNLIMIT YOUR POTENTIAL",
      industry: "FinTech / 決済",
      ceo: "中山 一郎（代表取締役社長）",
      founded: "2018年10月",
      headquarters: "東京都港区（海岸）",
      employees: "約3,000名",
      listed: "非上場（ソフトバンクグループ傘下）",
      businessSegments: [
        "決済サービス「PayPay」",
        "PayPayカード（クレジットカード）",
        "PayPay銀行 / PayPay証券（金融連携）",
        "PayPayミニアプリ / マーケットプレイス"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["バックエンドエンジニア", "モバイルエンジニア", "SRE", "セキュリティ"],
      selectionFlow: ["ES", "コーディング試験", "技術面接", "最終面接"],
      website: "https://about.paypay.ne.jp"
    }
  },
  {
    id: "r19",
    companyName: "株式会社ZOZO",
    category: "セミナー",
    content: "ZOZO Tech Meetup（エンジニア向け）",
    date: "2026-05-15",
    deadlineLabel: "説明会",
    aiHeat: 68,
    keywords: ["EC", "検索/推薦", "計測テック"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://corp.zozo.com/recruit/newgraduate/", fetchedAt: new Date("2026-04-17") }
    ],
    trust: "official",
    companyProfile: {
      overview: "ファッションEC「ZOZOTOWN」を運営。検索・推薦、計測テック（ZOZOMAT等）、大規模ECの開発が強み。",
      mission: "ファッションを変える。世界を変える。",
      industry: "EC / ファッションテック",
      ceo: "澤田 宏太郎（代表取締役社長兼CEO）",
      founded: "1998年5月",
      headquarters: "千葉県千葉市美浜区（幕張）",
      employees: "連結 約1,900名",
      revenue: "連結 2,082億円（2024年3月期）",
      listed: "東証プライム",
      ticker: "3092",
      businessSegments: [
        "ZOZOTOWN事業（ファッションEC）",
        "BtoB事業（ブランド公式サイト基盤 FULFILLMENT by ZOZO）",
        "広告事業 / データマーケティング",
        "計測テクノロジー事業（ZOZOMAT / ZOZOFIT等）"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["Webエンジニア", "モバイルエンジニア", "MLエンジニア", "SRE"],
      selectionFlow: ["ES", "コーディング試験", "面接(複数回)", "最終面接"],
      website: "https://corp.zozo.com"
    }
  },
  {
    id: "r20",
    companyName: "クックパッド株式会社",
    category: "インターン",
    content: "サマーインターン（Web/iOS/Androidエンジニア）",
    date: "2026-06-20",
    deadlineLabel: "締切",
    aiHeat: 70,
    keywords: ["レシピ", "グローバル", "Ruby"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://cookpad-careers.jp/", fetchedAt: new Date("2026-04-18") }
    ],
    trust: "official",
    companyProfile: {
      overview: "世界最大級のレシピサービス「クックパッド」を運営。Ruby/Rails文化で知られ、グローバル展開も推進。",
      mission: "毎日の料理を楽しみにする",
      industry: "インターネット / レシピ",
      ceo: "岩田 林平（代表執行役）",
      founded: "1997年10月",
      headquarters: "神奈川県横浜市（みなとみらい）",
      employees: "連結 約300名",
      listed: "東証プライム",
      ticker: "2193",
      businessSegments: [
        "国内レシピサービス「クックパッド」（プレミアム課金）",
        "海外レシピサービス（70カ国以上・30以上の言語）",
        "クックパッドマート（生鮮食品EC）",
        "広告・法人向けタイアップ"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["Webエンジニア", "モバイルエンジニア", "研究開発"],
      selectionFlow: ["書類選考", "コーディング課題", "面接(複数回)"],
      website: "https://info.cookpad.com"
    }
  },
  {
    id: "r21",
    companyName: "株式会社MIXI",
    category: "インターン",
    content: "エンジニア向け就業型インターン（家族/スポーツ/ゲーム）",
    date: "2026-06-05",
    deadlineLabel: "締切",
    aiHeat: 75,
    keywords: ["モンスト", "家族アルバム", "ゲーム"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://mixi.co.jp/recruit/newgraduate/", fetchedAt: new Date("2026-04-20") },
      { type: "X", url: "https://x.com/mixi_pr", fetchedAt: new Date("2026-04-20") }
    ],
    trust: "official",
    companyProfile: {
      overview: "『モンスターストライク』等のデジタルエンタメに加え、『家族アルバム みてね』等のライフスタイル事業、スポーツ事業を展開。",
      mission: "豊かなコミュニケーションを広げ、世界をもっと、やさしさで満たす。",
      industry: "ゲーム / インターネット / スポーツ",
      ceo: "木村 弘毅（代表取締役社長）",
      founded: "1997年11月",
      headquarters: "東京都渋谷区（渋谷スクランブルスクエア）",
      employees: "連結 約1,400名",
      revenue: "連結 1,468億円（2024年3月期）",
      listed: "東証プライム",
      ticker: "2121",
      businessSegments: [
        "デジタルエンターテインメント（モンスターストライク / 星のドラゴンクエスト）",
        "ライフスタイル（家族アルバム みてね / みてね年賀状）",
        "スポーツ（FC東京 / 千葉ジェッツふなばし / TIPSTAR）",
        "ソーシャルネットワーク（SNS『mixi』 / みてねコールドクター）"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["ソフトウェアエンジニア", "ゲームエンジニア", "デザイナー", "企画"],
      selectionFlow: ["ES", "適性検査", "面接(複数回)", "最終面接"],
      website: "https://mixi.co.jp"
    }
  },
  {
    id: "r22",
    companyName: "株式会社NTTデータグループ",
    category: "本選考",
    content: "総合職（SE/コンサルタント）本選考エントリー",
    date: "2026-05-22",
    deadlineLabel: "締切",
    aiHeat: 65,
    keywords: ["SIer", "社会基盤", "海外M&A"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://nttdata-recruit.com/", fetchedAt: new Date("2026-04-21") }
    ],
    trust: "official",
    companyProfile: {
      overview: "金融・公共・法人向けのシステムインテグレーションを手掛ける国内最大級のITサービス企業。海外M&Aでグローバル展開。",
      mission: "Trusted Global Innovator - 情報技術で、新しい「しくみ」や「価値」を創造し、より豊かで調和のとれた社会の実現に貢献する",
      industry: "ITサービス / SIer",
      ceo: "本間 洋（代表取締役社長）",
      founded: "1988年5月",
      headquarters: "東京都江東区（豊洲センタービル）",
      capital: "1,425億円",
      employees: "連結 約195,000名",
      revenue: "連結 4兆3,673億円（2024年3月期）",
      listed: "東証プライム",
      ticker: "9613",
      businessSegments: [
        "金融分野（メガバンク・証券・保険のシステム）",
        "公共・社会基盤分野（官公庁・自治体・防衛）",
        "法人分野（通信・製造・流通・サービス）",
        "グローバル事業（北米・EMEA・APAC/NTT DATA, Inc.）"
      ],
      hiringCount: "新卒 約500名",
      hiringRoles: ["SE", "コンサルタント", "研究開発", "スタッフ"],
      selectionFlow: ["ES", "WEBテスト", "面接(複数回)", "最終面接"],
      website: "https://www.nttdata.com/global/ja/"
    }
  },
  {
    id: "r23",
    companyName: "GMOペパボ株式会社",
    category: "インターン",
    content: "サマーインターン「ペパボキャンプ」エンジニアコース",
    date: "2026-06-25",
    deadlineLabel: "締切",
    aiHeat: 71,
    keywords: ["ホスティング", "minne", "SUZURI"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://recruit.pepabo.com/", fetchedAt: new Date("2026-04-16") },
      { type: "X", url: "https://x.com/pepabo", fetchedAt: new Date("2026-04-16") }
    ],
    trust: "official",
    companyProfile: {
      overview: "ホスティング（ロリポップ等）、ハンドメイドマーケット（minne）、グッズ作成（SUZURI）等を展開。技術発信とOSS文化。",
      mission: "もっとおもしろくできる",
      industry: "ホスティング / EC / ハンドメイド",
      ceo: "佐藤 健太郎（代表取締役社長）",
      founded: "2003年1月",
      headquarters: "東京都渋谷区（セルリアンタワー）",
      employees: "約400名",
      listed: "東証スタンダード",
      ticker: "3633",
      businessSegments: [
        "ホスティング事業（ロリポップ! / ムームードメイン / ヘテムル）",
        "ハンドメイド事業（minne）",
        "EC支援事業（カラーミーショップ / SUZURI）",
        "金融支援事業（FREENANCE）"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["Webエンジニア", "デザイナー", "ディレクター"],
      selectionFlow: ["書類選考", "コーディング課題", "面接(複数回)"],
      website: "https://pepabo.com"
    }
  },
  {
    id: "r24",
    companyName: "株式会社はてな",
    category: "早期選考",
    content: "Webアプリケーションエンジニア 早期選考",
    date: "2026-05-19",
    deadlineLabel: "早期選考",
    aiHeat: 80,
    keywords: ["Perl/Scala", "マンガビューワ", "Mackerel"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://hatenacorp.jp/recruit/newgraduate/", fetchedAt: new Date("2026-04-17") }
    ],
    trust: "official",
    companyProfile: {
      overview: "はてなブログ、マンガビューワ「GigaViewer」、サーバー監視SaaS「Mackerel」等を展開。技術ブログ文化が強い。",
      mission: "「知る」「つながる」「表現する」で新しい体験を提供し、人の生活を豊かにする",
      industry: "インターネット / SaaS",
      ceo: "大西 康裕（代表取締役社長）",
      founded: "2001年7月",
      headquarters: "京都府京都市中京区（本社）/ 東京都千代田区",
      employees: "約250名",
      listed: "東証グロース",
      ticker: "3930",
      businessSegments: [
        "コンテンツプラットフォームサービス（はてなブログ / はてなブックマーク）",
        "コンテンツマーケティングサービス（企業メディア構築・運用支援）",
        "テクノロジーソリューションサービス（GigaViewer / Mackerel）"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["Webアプリケーションエンジニア", "SRE", "デザイナー"],
      selectionFlow: ["書類選考", "コーディング試験", "面接(複数回)", "最終面接"],
      website: "https://hatenacorp.jp"
    }
  },
  {
    id: "r25",
    companyName: "サイボウズ株式会社",
    category: "インターン",
    content: "kintone開発・フロントエンド・SREインターン",
    date: "2026-06-12",
    deadlineLabel: "締切",
    aiHeat: 77,
    keywords: ["kintone", "リモート", "多様性"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://cybozu.co.jp/recruit/entry/new-graduate/", fetchedAt: new Date("2026-04-19") }
    ],
    trust: "official",
    companyProfile: {
      overview: "業務改善プラットフォーム「kintone」、グループウェア「Garoon」を中心に展開。働き方の多様性を推進する企業文化。",
      mission: "チームワークあふれる社会を創る",
      industry: "B2B SaaS / グループウェア",
      ceo: "青野 慶久（代表取締役社長）",
      founded: "1997年8月",
      headquarters: "東京都中央区（日本橋タワー）",
      employees: "連結 約1,100名",
      revenue: "連結 253億円（2023年12月期）",
      listed: "東証プライム",
      ticker: "4776",
      businessSegments: [
        "kintone（業務改善プラットフォーム）",
        "サイボウズ Office / Garoon（グループウェア）",
        "メールワイズ（メール共有・顧客対応）",
        "チームワーク総研（組織開発コンサル）"
      ],
      hiringCount: "新卒数十名",
      hiringRoles: ["Webエンジニア", "モバイルエンジニア", "SRE", "QA"],
      selectionFlow: ["ES", "コーディング課題", "面接(複数回)", "最終面接"],
      website: "https://cybozu.co.jp"
    }
  },
  {
    id: "r26",
    companyName: "面白法人カヤック",
    category: "セミナー",
    content: "エンジニア向けオープンセッション（鎌倉から世界へ）",
    date: "2026-05-09",
    deadlineLabel: "説明会",
    aiHeat: 62,
    keywords: ["ゲーム", "地域活性化", "ユニーク"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.kayac.com/recruit/fresh", fetchedAt: new Date("2026-04-15") }
    ],
    trust: "official",
    companyProfile: {
      overview: "鎌倉本社のユニークな面白コンテンツ企業。ゲーム、受託、地域資本主義領域などに挑戦。",
      mission: "つくる人を増やす",
      industry: "ゲーム / 受託開発 / 地域",
      ceo: "柳澤 大輔（代表取締役CEO）",
      founded: "1998年8月",
      headquarters: "神奈川県鎌倉市",
      employees: "連結 約500名",
      revenue: "連結 78億円（2023年12月期）",
      listed: "東証グロース",
      ticker: "3904",
      businessSegments: [
        "ゲーム事業（自社タイトル・受託）",
        "クライアントワーク事業（Webサービス・アプリ受託）",
        "地域資本主義事業（まちのコイン / SMOUT 移住マッチング）",
        "アミューズメント / その他"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["エンジニア", "ディレクター", "デザイナー"],
      selectionFlow: ["ES/ポートフォリオ", "面接(複数回)", "最終面接"],
      website: "https://www.kayac.com"
    }
  },
  {
    id: "r27",
    companyName: "クラスメソッド株式会社",
    category: "本選考",
    content: "AWSエンジニア 本選考エントリー",
    date: "2026-06-02",
    deadlineLabel: "締切",
    aiHeat: 82,
    keywords: ["AWS", "DevelopersIO", "技術発信"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://classmethod.jp/recruit/new-graduate/", fetchedAt: new Date("2026-04-18") }
    ],
    trust: "official",
    companyProfile: {
      overview: "AWSプレミアティアサービスパートナー。技術ブログ「DevelopersIO」で有名で、エンジニアの情報発信文化が強い。",
      mission: "オープンな発想と高度な技術力により、すべての人々の創造活動に貢献し続ける",
      industry: "クラウドインテグレーション / データ分析",
      ceo: "横田 聡（代表取締役）",
      founded: "2004年7月",
      headquarters: "東京都港区（西新橋）",
      employees: "約1,000名",
      listed: "非上場",
      businessSegments: [
        "AWSコンサルティング・構築・運用",
        "データアナリティクス（DWH / BI / データ基盤）",
        "モバイル開発（iOS/Android/Flutter受託）",
        "LINEソリューション（メッセージングAPI活用）"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["クラウドエンジニア", "データエンジニア", "モバイルエンジニア"],
      selectionFlow: ["ES", "コーディング課題", "面接(複数回)", "最終面接"],
      website: "https://classmethod.jp"
    }
  },
  {
    id: "r28",
    companyName: "株式会社ゆめみ",
    category: "説明会",
    content: "エンジニア採用 オープンカンパニー",
    date: "2026-05-16",
    deadlineLabel: "説明会",
    aiHeat: 64,
    keywords: ["内製化支援", "自律", "給与自己決定"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://hrmos.co/pages/yumemi", fetchedAt: new Date("2026-04-14") }
    ],
    trust: "official",
    companyProfile: {
      overview: "大手クライアントの内製開発支援を行うDXパートナー企業。給与自己決定制度等、独自の組織運営で知られる。",
      mission: "ともに、日常にあたらしい「できる」をつくる。",
      industry: "受託開発 / DX支援",
      ceo: "片岡 俊行（代表取締役）",
      founded: "2000年1月",
      headquarters: "東京都品川区（天王洲）",
      employees: "約500名",
      listed: "非上場",
      businessSegments: [
        "サービスデザイン（UX/UIコンサル）",
        "システム受託開発（iOS / Android / Web）",
        "内製化支援・伴走開発",
        "DX人材育成"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["iOS/Androidエンジニア", "Webフロント", "サーバサイド", "デザイナー"],
      selectionFlow: ["書類選考", "コーディング課題", "面接(複数回)"],
      website: "https://www.yumemi.co.jp"
    }
  },
  {
    id: "r29",
    companyName: "株式会社ミラティブ",
    category: "インターン",
    content: "ライブ配信サービス開発インターン（Unity/サーバ）",
    date: "2026-06-18",
    deadlineLabel: "締切",
    aiHeat: 69,
    keywords: ["ライブ配信", "アバター", "スマホゲーム"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://www.mirrativ.co.jp/recruit", fetchedAt: new Date("2026-04-19") },
      { type: "X", url: "https://x.com/mirrativ_jp", fetchedAt: new Date("2026-04-19") }
    ],
    trust: "official",
    companyProfile: {
      overview: "スマホゲーム実況/アバター配信アプリ「Mirrativ」を運営。ライブ配信基盤とアバター技術が強み。",
      mission: "「わかりあう願いをつなごう」",
      industry: "ライブ配信 / ゲーム",
      ceo: "赤川 隼一（代表取締役CEO）",
      founded: "2018年2月（DeNAから分社化）",
      headquarters: "東京都渋谷区",
      employees: "約150名",
      listed: "非上場",
      businessSegments: [
        "ライブ配信プラットフォーム「Mirrativ」",
        "アバター配信（Emomo）",
        "配信者支援・収益化プログラム",
        "スマホゲームの二次配信連携"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["サーバサイドエンジニア", "モバイルエンジニア", "Unityエンジニア"],
      selectionFlow: ["書類選考", "コーディング課題", "面接(複数回)"],
      website: "https://www.mirrativ.co.jp"
    }
  },
  {
    id: "r30",
    companyName: "株式会社マネーフォワードケッサイ",
    category: "早期選考",
    content: "バックエンドエンジニア（Go/Rails）早期選考",
    date: "2026-05-27",
    deadlineLabel: "早期選考",
    aiHeat: 72,
    keywords: ["BtoB", "決済", "与信"],
    sources: [
      { type: "OFFICIAL_WEB", url: "https://mfkessai.co.jp/recruit", fetchedAt: new Date("2026-04-20") }
    ],
    trust: "official",
    companyProfile: {
      overview: "法人間後払い（BtoB請求代行）サービスを提供するマネーフォワードグループのFinTech子会社。",
      mission: "すべての企業間取引を、もっとラクに、もっと安全に。",
      industry: "FinTech / BtoB決済",
      ceo: "冨山 直道（代表取締役社長）",
      founded: "2017年6月",
      headquarters: "東京都港区（芝浦シーバンス）",
      employees: "約150名",
      listed: "非上場（マネーフォワードグループ）",
      businessSegments: [
        "請求代行サービス「マネーフォワード ケッサイ」（BtoB後払い）",
        "与信・債権管理API",
        "中小企業向けファクタリング"
      ],
      hiringCount: "新卒若干名",
      hiringRoles: ["バックエンドエンジニア", "フロントエンドエンジニア", "SRE"],
      selectionFlow: ["書類選考", "コーディング課題", "面接(複数回)", "最終面接"],
      website: "https://mfkessai.co.jp"
    }
  }
];

