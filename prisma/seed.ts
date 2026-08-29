import { EventFormat, EventKind, IngestSource, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 開発・デモ用のサンプルデータ。
 * 実在イベントではなく、UI（締切カウントダウンの色分け・フィルタ・カレンダー）を
 * 一通り動かせる分布になるように作ってある。
 * 本番のデータは connpass / Doorkeeper コネクタ経由で入る想定。
 */

/** 実行日を基準に相対で日付を作る（seed を再実行しても締切が過去に固まらないようにするため） */
function at(daysFromNow: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

type SeedEvent = {
  url: string;
  title: string;
  description: string;
  kind: EventKind;
  format: EventFormat;
  prefecture?: string;
  venue?: string;
  startsAt: Date;
  endsAt?: Date;
  applyDeadline?: Date;
  organizer: string;
  organizerUrl?: string;
  prize?: string;
  tags: string[];
  capacity?: number;
  accepted?: number;
};

const EVENTS: SeedEvent[] = [
  // ── ハッカソン ──
  {
    url: "https://example.com/sample-events/summer-hackathon-2026",
    title: "【サンプル】学生サマーハッカソン 2026",
    description:
      "48時間でプロダクトを作り切る学生向けハッカソン。チームは当日結成、メンターが常駐します。\n※これはデモ用のサンプルデータです。",
    kind: EventKind.HACKATHON,
    format: EventFormat.OFFLINE,
    prefecture: "東京都",
    venue: "サンプルカンファレンスセンター 渋谷",
    startsAt: at(2, 10),
    endsAt: at(4, 18),
    applyDeadline: at(1, 23, 59),
    organizer: "サンプルテック株式会社",
    organizerUrl: "https://example.com/sample-tech",
    prize: "最優秀賞 30万円 / 企業賞 各5万円",
    tags: ["ハッカソン", "学生", "チーム開発", "メンターあり"],
    capacity: 60,
    accepted: 54
  },
  {
    url: "https://example.com/sample-events/ai-hackathon-online",
    title: "【サンプル】生成AIハッカソン オンライン予選",
    description: "生成AIを使ったプロダクトを1週間で開発するオンラインハッカソンの予選ラウンド。",
    kind: EventKind.HACKATHON,
    format: EventFormat.ONLINE,
    startsAt: at(9, 19),
    endsAt: at(16, 21),
    applyDeadline: at(6, 23, 59),
    organizer: "サンプルAIラボ",
    prize: "本選出場権 + 賞金総額 100万円",
    tags: ["ハッカソン", "生成AI", "オンライン"],
    capacity: 200,
    accepted: 143
  },
  {
    url: "https://example.com/sample-events/civic-hack-osaka",
    title: "【サンプル】シビックハック大阪 — 地域課題解決ハッカソン",
    description: "自治体のオープンデータを使って地域課題を解くハッカソン。エンジニア以外の参加も歓迎。",
    kind: EventKind.HACKATHON,
    format: EventFormat.HYBRID,
    prefecture: "大阪府",
    venue: "サンプル市民会館 / オンライン同時配信",
    startsAt: at(21, 9, 30),
    endsAt: at(22, 18),
    applyDeadline: at(16, 23, 59),
    organizer: "サンプルシビックテック協議会",
    prize: "最優秀賞 20万円",
    tags: ["ハッカソン", "オープンデータ", "地域課題"],
    capacity: 80
  },
  {
    url: "https://example.com/sample-events/game-jam-fukuoka",
    title: "【サンプル】ゲームジャム福岡 2026 秋",
    description: "テーマ発表から36時間でゲームを1本仕上げる開発イベント。個人参加可。",
    kind: EventKind.HACKATHON,
    format: EventFormat.OFFLINE,
    prefecture: "福岡県",
    venue: "サンプル創業支援施設",
    startsAt: at(38, 10),
    endsAt: at(39, 22),
    applyDeadline: at(31, 23, 59),
    organizer: "サンプルゲーム開発者コミュニティ",
    tags: ["ハッカソン", "ゲーム開発", "Unity"],
    capacity: 40
  },

  // ── ビジコン・コンテスト ──
  {
    url: "https://example.com/sample-events/business-contest-2026",
    title: "【サンプル】学生ビジネスコンテスト 2026 — 応募受付中",
    description:
      "事業アイデアを競う学生向けビジネスコンテスト。書類選考 → メンタリング → 決勝プレゼンの3段階。",
    kind: EventKind.CONTEST,
    format: EventFormat.HYBRID,
    prefecture: "東京都",
    venue: "サンプルホール 丸の内 / オンライン",
    startsAt: at(45, 13),
    endsAt: at(45, 18),
    applyDeadline: at(5, 23, 59),
    organizer: "サンプル・ベンチャーキャピタル",
    organizerUrl: "https://example.com/sample-vc",
    prize: "優勝 100万円 + シード出資検討",
    tags: ["ビジコン", "起業", "学生", "ピッチ"],
    capacity: 120
  },
  {
    url: "https://example.com/sample-events/ideathon-sustainability",
    title: "【サンプル】サステナビリティ・アイデアソン",
    description: "環境・社会課題をテーマにした1日完結のアイデアソン。実装スキルは不要です。",
    kind: EventKind.CONTEST,
    format: EventFormat.ONLINE,
    startsAt: at(12, 13),
    endsAt: at(12, 18),
    applyDeadline: at(10, 23, 59),
    organizer: "サンプル総合研究所",
    prize: "グランプリ 10万円",
    tags: ["アイデアソン", "サステナビリティ", "初心者歓迎"],
    capacity: 150,
    accepted: 88
  },
  {
    url: "https://example.com/sample-events/pitch-contest-nagoya",
    title: "【サンプル】中部ピッチコンテスト 決勝大会",
    description: "東海エリアのスタートアップと学生チームが登壇するピッチコンテスト。観覧のみの参加も可能。",
    kind: EventKind.CONTEST,
    format: EventFormat.OFFLINE,
    prefecture: "愛知県",
    venue: "サンプルイノベーションハブ 名古屋",
    startsAt: at(27, 14),
    endsAt: at(27, 19),
    applyDeadline: at(20, 23, 59),
    organizer: "サンプル中部経済連携機構",
    prize: "最優秀 50万円",
    tags: ["ピッチ", "スタートアップ", "東海"],
    capacity: 200
  },
  {
    url: "https://example.com/sample-events/data-competition",
    title: "【サンプル】データ分析コンペティション 2026",
    description: "実データを使った予測精度を競うオンラインコンペ。期間中はいつでも提出可能。",
    kind: EventKind.CONTEST,
    format: EventFormat.ONLINE,
    startsAt: at(0, 0),
    endsAt: at(60, 23, 59),
    applyDeadline: at(53, 23, 59),
    organizer: "サンプルデータサイエンス協会",
    prize: "1位 30万円 / 2位 10万円 / 3位 5万円",
    tags: ["コンペ", "機械学習", "データ分析"]
  },

  // ── インターン ──
  {
    url: "https://example.com/sample-events/summer-internship-engineer",
    title: "【サンプル】エンジニア向け 3days サマーインターン",
    description: "実際のプロダクトコードを触りながら開発を体験する3日間のインターン。交通費支給。",
    kind: EventKind.INTERNSHIP,
    format: EventFormat.OFFLINE,
    prefecture: "東京都",
    venue: "サンプルテック株式会社 本社",
    startsAt: at(30, 10),
    endsAt: at(32, 18),
    applyDeadline: at(3, 23, 59),
    organizer: "サンプルテック株式会社",
    organizerUrl: "https://example.com/sample-tech",
    tags: ["インターン", "エンジニア", "3days", "交通費支給"],
    capacity: 20,
    accepted: 18
  },
  {
    url: "https://example.com/sample-events/1day-workshop-internship",
    title: "【サンプル】1day 仕事体験ワークショップ（企画職）",
    description: "企画職の仕事をグループワークで体験する1日プログラム。学年不問。",
    kind: EventKind.INTERNSHIP,
    format: EventFormat.ONLINE,
    startsAt: at(7, 13),
    endsAt: at(7, 17),
    applyDeadline: at(4, 23, 59),
    organizer: "サンプルコンサルティング株式会社",
    tags: ["インターン", "企画職", "1day"],
    capacity: 50,
    accepted: 41
  },
  {
    url: "https://example.com/sample-events/long-term-internship-fair",
    title: "【サンプル】長期インターン合同説明会",
    description: "長期インターンを募集する企業20社が集まる合同説明会。ブース形式で個別に話が聞けます。",
    kind: EventKind.INTERNSHIP,
    format: EventFormat.OFFLINE,
    prefecture: "東京都",
    venue: "サンプル展示ホール 有明",
    startsAt: at(18, 11),
    endsAt: at(18, 18),
    applyDeadline: at(15, 23, 59),
    organizer: "サンプルキャリア株式会社",
    tags: ["インターン", "合同説明会", "長期"],
    capacity: 500
  },
  {
    url: "https://example.com/sample-events/design-internship",
    title: "【サンプル】プロダクトデザイン インターン選考会",
    description: "ポートフォリオを持参してのデザイン職インターン選考会。フィードバックあり。",
    kind: EventKind.INTERNSHIP,
    format: EventFormat.HYBRID,
    prefecture: "京都府",
    venue: "サンプルデザインスタジオ / オンライン",
    startsAt: at(41, 14),
    applyDeadline: at(34, 23, 59),
    organizer: "サンプルデザイン株式会社",
    tags: ["インターン", "デザイン", "ポートフォリオ"],
    capacity: 15
  },

  // ── 勉強会 ──
  {
    url: "https://example.com/sample-events/react-mokumoku",
    title: "【サンプル】React もくもく会 #24",
    description: "各自の作業を持ち寄って黙々と進める会。最後に成果を1分ずつ共有します。",
    kind: EventKind.MEETUP,
    format: EventFormat.ONLINE,
    startsAt: at(1, 19, 30),
    endsAt: at(1, 22),
    organizer: "サンプルフロントエンド勉強会",
    tags: ["もくもく会", "React", "オンライン"],
    capacity: 30,
    accepted: 22
  },
  {
    url: "https://example.com/sample-events/lt-night-sapporo",
    title: "【サンプル】エンジニアLTナイト 札幌",
    description: "5分間のライトニングトーク大会。登壇枠と聴講枠あり。懇親会付き。",
    kind: EventKind.MEETUP,
    format: EventFormat.OFFLINE,
    prefecture: "北海道",
    venue: "サンプルコワーキングスペース 大通",
    startsAt: at(11, 19),
    endsAt: at(11, 22),
    organizer: "サンプル北海道ITコミュニティ",
    tags: ["LT", "懇親会", "北海道"],
    capacity: 45,
    accepted: 31
  },
  {
    url: "https://example.com/sample-events/rust-study-group",
    title: "【サンプル】Rust 輪読会 第8回",
    description: "公式ドキュメントを章ごとに読み進める輪読会。途中参加歓迎。",
    kind: EventKind.MEETUP,
    format: EventFormat.ONLINE,
    startsAt: at(5, 20),
    endsAt: at(5, 21, 30),
    organizer: "サンプルRustユーザー会",
    tags: ["輪読会", "Rust", "初心者歓迎"],
    capacity: 25,
    accepted: 19
  },
  {
    url: "https://example.com/sample-events/design-workshop",
    title: "【サンプル】UIデザイン ワークショップ",
    description: "Figma を使って実際に画面を作りながら学ぶハンズオン形式のワークショップ。",
    kind: EventKind.MEETUP,
    format: EventFormat.OFFLINE,
    prefecture: "神奈川県",
    venue: "サンプル横浜ラボ",
    startsAt: at(16, 13),
    endsAt: at(16, 17),
    applyDeadline: at(13, 23, 59),
    organizer: "サンプルデザインコミュニティ",
    tags: ["ワークショップ", "Figma", "ハンズオン"],
    capacity: 24,
    accepted: 24
  },
  {
    url: "https://example.com/sample-events/security-meetup",
    title: "【サンプル】セキュリティ勉強会 — CTF入門",
    description: "CTFの問題を題材にWebセキュリティの基礎を学ぶ勉強会。",
    kind: EventKind.MEETUP,
    format: EventFormat.HYBRID,
    prefecture: "東京都",
    venue: "サンプルセキュリティラボ / オンライン",
    startsAt: at(24, 19),
    endsAt: at(24, 21, 30),
    organizer: "サンプルセキュリティコミュニティ",
    tags: ["セキュリティ", "CTF", "初心者歓迎"],
    capacity: 60,
    accepted: 37
  },

  // ── セミナー ──
  {
    url: "https://example.com/sample-events/career-seminar",
    title: "【サンプル】エンジニアキャリアセミナー",
    description: "現役エンジニア3名によるパネルディスカッション形式のキャリアセミナー。",
    kind: EventKind.SEMINAR,
    format: EventFormat.ONLINE,
    startsAt: at(3, 19),
    endsAt: at(3, 20, 30),
    applyDeadline: at(2, 18),
    organizer: "サンプルキャリア株式会社",
    tags: ["セミナー", "キャリア", "パネル"],
    capacity: 300,
    accepted: 187
  },
  {
    url: "https://example.com/sample-events/startup-conference",
    title: "【サンプル】スタートアップ・カンファレンス 2026",
    description: "起業家・投資家が登壇する終日カンファレンス。複数トラック並行開催。",
    kind: EventKind.SEMINAR,
    format: EventFormat.OFFLINE,
    prefecture: "東京都",
    venue: "サンプル国際フォーラム",
    startsAt: at(52, 10),
    endsAt: at(52, 19),
    applyDeadline: at(45, 23, 59),
    organizer: "サンプル・スタートアップ協会",
    tags: ["カンファレンス", "スタートアップ", "投資"],
    capacity: 1000
  },
  {
    url: "https://example.com/sample-events/ai-webinar",
    title: "【サンプル】業務で使う生成AI 実践ウェビナー",
    description: "生成AIの業務適用事例を紹介するウェビナー。アーカイブ配信あり。",
    kind: EventKind.SEMINAR,
    format: EventFormat.ONLINE,
    startsAt: at(8, 12),
    endsAt: at(8, 13),
    organizer: "サンプルAIラボ",
    tags: ["ウェビナー", "生成AI", "アーカイブあり"],
    capacity: 500,
    accepted: 264
  },
  {
    url: "https://example.com/sample-events/company-info-session",
    title: "【サンプル】サマーインターン説明会",
    description: "サマーインターンの募集内容と選考フローを説明する回。質疑応答の時間あり。",
    kind: EventKind.SEMINAR,
    format: EventFormat.ONLINE,
    startsAt: at(0, 18),
    endsAt: at(0, 19),
    organizer: "サンプルテック株式会社",
    tags: ["説明会", "インターン"],
    capacity: 100,
    accepted: 72
  },

  // ── その他・終了済み（期限切れ表示の確認用） ──
  {
    url: "https://example.com/sample-events/networking-night",
    title: "【サンプル】学生エンジニア交流会",
    description: "軽食付きのカジュアルな交流会。同世代のエンジニアとつながれます。",
    kind: EventKind.OTHER,
    format: EventFormat.OFFLINE,
    prefecture: "東京都",
    venue: "サンプルラウンジ 六本木",
    startsAt: at(14, 19),
    endsAt: at(14, 21),
    organizer: "サンプル学生エンジニア連盟",
    tags: ["交流会", "学生"],
    capacity: 70,
    accepted: 55
  },
  {
    url: "https://example.com/sample-events/past-hackathon-spring",
    title: "【サンプル】春のハッカソン 2026（終了）",
    description: "終了済みイベントの表示確認用サンプル。",
    kind: EventKind.HACKATHON,
    format: EventFormat.OFFLINE,
    prefecture: "東京都",
    venue: "サンプルカンファレンスセンター 渋谷",
    startsAt: at(-40, 10),
    endsAt: at(-39, 18),
    applyDeadline: at(-47, 23, 59),
    organizer: "サンプルテック株式会社",
    prize: "最優秀賞 30万円",
    tags: ["ハッカソン", "終了"],
    capacity: 60,
    accepted: 60
  },
  {
    url: "https://example.com/sample-events/past-business-contest",
    title: "【サンプル】ビジネスコンテスト 春季大会（終了）",
    description: "終了済みイベントの表示確認用サンプル。",
    kind: EventKind.CONTEST,
    format: EventFormat.HYBRID,
    prefecture: "大阪府",
    venue: "サンプル市民会館 / オンライン",
    startsAt: at(-20, 13),
    endsAt: at(-20, 18),
    applyDeadline: at(-30, 23, 59),
    organizer: "サンプル・ベンチャーキャピタル",
    prize: "優勝 50万円",
    tags: ["ビジコン", "終了"],
    capacity: 100,
    accepted: 100
  }
];

async function main() {
  for (const event of EVENTS) {
    const data = {
      ingestSource: IngestSource.MANUAL,
      title: event.title,
      description: event.description,
      kind: event.kind,
      format: event.format,
      prefecture: event.prefecture ?? null,
      venue: event.venue ?? null,
      startsAt: event.startsAt,
      endsAt: event.endsAt ?? null,
      applyDeadline: event.applyDeadline ?? null,
      organizer: event.organizer,
      organizerUrl: event.organizerUrl ?? null,
      prize: event.prize ?? null,
      tags: event.tags,
      capacity: event.capacity ?? null,
      accepted: event.accepted ?? null
    };

    await prisma.event.upsert({
      where: { url: event.url },
      create: { url: event.url, ...data },
      update: data
    });
  }

  const total = await prisma.event.count();
  console.log(`✅ seed 完了: ${EVENTS.length} 件を upsert（DB 合計 ${total} 件）`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
