export const EXERCISES = [
  // --- BIG 3 ---
  {
    id: "smith-bench-press",
    name: "スミスマシン ベンチプレス",
    enName: "Smith Machine Bench Press",
    category: "胸 (Chest)",
    equipment: "Smith Machine",
    mets: 6.0,
    isBig3: true,
    videoQuery: "スミスマシン ベンチプレス フォーム",
    description: "軌道が固定されているため、安全に大胸筋全体を限界まで追い込むことができます。"
  },
  {
    id: "smith-squat",
    name: "スミスマシン スクワット",
    enName: "Smith Machine Squat",
    category: "脚 (Legs)",
    equipment: "Smith Machine",
    mets: 6.0,
    isBig3: true,
    videoQuery: "スミスマシン スクワット フォーム",
    description: "体幹のブレを抑えつつ、大腿四頭筋や臀部をピンポイントで鍛えられます。"
  },
  {
    id: "smith-deadlift",
    name: "スミスマシン デッドリフト",
    enName: "Smith Machine Deadlift",
    category: "背中 (Back)",
    equipment: "Smith Machine",
    mets: 6.0,
    isBig3: true,
    videoQuery: "スミスマシン デッドリフト フォーム",
    description: "背部全体（広背筋・脊柱起立筋）とハムストリングスを安全な軌道で強化します。"
  },
  {
    id: "db-bench-press",
    name: "ダンベル ベンチプレス",
    enName: "Dumbbell Bench Press",
    category: "胸 (Chest)",
    equipment: "Dumbbell",
    mets: 5.5,
    isBig3: false,
    videoQuery: "ダンベル ベンチプレス コツ",
    description: "バーベルよりも可動域が広く、大胸筋を最大収縮・最大ストレッチできます。"
  },
  {
    id: "db-goblet-squat",
    name: "ダンベル ゴブレットスクワット",
    enName: "Dumbbell Goblet Squat",
    category: "脚 (Legs)",
    equipment: "Dumbbell",
    mets: 5.0,
    isBig3: false,
    videoQuery: "ダンベル スクワット やり方",
    description: "胸の前でダンベルを抱えて行うスクワット。背中を真っ直ぐ保ちやすいのが特徴です。"
  },
  {
    id: "db-romanian-deadlift",
    name: "ダンベル ルーマニアンデッドリフト",
    enName: "Dumbbell Romanian Deadlift",
    category: "背中 (Back)",
    equipment: "Dumbbell",
    mets: 5.0,
    isBig3: false,
    videoQuery: "ダンベル デッドリフト ハムストリングス",
    description: "ハムストリングスと大臀筋にストレッチ負荷をかけるのに優れた種目です。"
  },

  // --- Smith Machine Exercises ---
  {
    id: "smith-incline-bench-press",
    name: "スミスマシン インクラインプレス",
    enName: "Smith Machine Incline Bench Press",
    category: "胸 (Chest)",
    equipment: "Smith Machine",
    mets: 5.5,
    isBig3: false,
    videoQuery: "スミスマシン インクラインベンチプレス",
    description: "角度をつけたベンチで行うことで、大胸筋上部を効果的に刺激します。"
  },
  {
    id: "smith-shoulder-press",
    name: "スミスマシン ショルダープレス",
    enName: "Smith Machine Shoulder Press",
    category: "肩 (Shoulders)",
    equipment: "Smith Machine",
    mets: 5.0,
    isBig3: false,
    videoQuery: "スミスマシン ショルダープレス",
    description: "三角筋前部・中部を狙うプレス種目。安全に高重量を扱えます。"
  },
  {
    id: "smith-bent-over-row",
    name: "スミスマシン ベントオーバーロウ",
    enName: "Smith Machine Bent Over Row",
    category: "背中 (Back)",
    equipment: "Smith Machine",
    mets: 5.5,
    isBig3: false,
    videoQuery: "スミスマシン ベントオーバーローイング",
    description: "広背筋や僧帽筋に強い負荷をかけるローイング種目です。"
  },
  {
    id: "smith-hip-thrust",
    name: "スミスマシン ヒップスラスト",
    enName: "Smith Machine Hip Thrust",
    category: "臀部 (Glutes)",
    equipment: "Smith Machine",
    mets: 4.5,
    isBig3: false,
    videoQuery: "スミスマシン ヒップスラスト",
    description: "大臀筋をターゲットにした最も効果的なヒップアップトレーニングの一つです。"
  },
  {
    id: "smith-calf-raise",
    name: "スミスマシン カーフレイズ",
    enName: "Smith Machine Calf Raise",
    category: "脚 (Legs)",
    equipment: "Smith Machine",
    mets: 3.5,
    isBig3: false,
    videoQuery: "スミスマシン カーフレイズ",
    description: "ふくらはぎ（腓腹筋・ヒラメ筋）をストレッチさせながら鍛えます。"
  },

  // --- Dumbbell Exercises ---
  {
    id: "db-fly",
    name: "ダンベル フライ",
    enName: "Dumbbell Fly",
    category: "胸 (Chest)",
    equipment: "Dumbbell",
    mets: 4.0,
    isBig3: false,
    videoQuery: "ダンベルフライ フォーム",
    description: "大胸筋のアウトラインとストレッチ刺激を与えるのに適したアイソレーション種目です。"
  },
  {
    id: "db-shoulder-press",
    name: "ダンベル ショルダープレス",
    enName: "Dumbbell Shoulder Press",
    category: "肩 (Shoulders)",
    equipment: "Dumbbell",
    mets: 4.5,
    isBig3: false,
    videoQuery: "ダンベル ショルダープレス コツ",
    description: "三角筋をバランス良く鍛えます。可動域が広く、自然な軌道で行えます。"
  },
  {
    id: "db-lateral-raise",
    name: "ダンベル サイドレイズ",
    enName: "Dumbbell Lateral Raise",
    category: "肩 (Shoulders)",
    equipment: "Dumbbell",
    mets: 3.5,
    isBig3: false,
    videoQuery: "サイドレイズ 肩の張り出し",
    description: "三角筋中部に負荷を与え、肩幅の広いシルエットを作ります。"
  },
  {
    id: "db-one-arm-row",
    name: "ダンベル ワンハンドローイング",
    enName: "Dumbbell One-Arm Row",
    category: "背中 (Back)",
    equipment: "Dumbbell",
    mets: 5.0,
    isBig3: false,
    videoQuery: "ダンベル ワンハンドローイング",
    description: "片側ずつ行うことで、広背筋を最大収縮・ストレッチさせやすい種目です。"
  },
  {
    id: "db-bicep-curl",
    name: "ダンベル アームカール",
    enName: "Dumbbell Bicep Curl",
    category: "腕 (Arms)",
    equipment: "Dumbbell",
    mets: 3.0,
    isBig3: false,
    videoQuery: "ダンベル アームカール フォーム",
    description: "上腕二頭筋を鍛えて、たくましい力こぶを作ります。"
  },
  {
    id: "db-tricep-extension",
    name: "ダンベル フレンチプレス",
    enName: "Dumbbell French Press",
    category: "腕 (Arms)",
    equipment: "Dumbbell",
    mets: 3.0,
    isBig3: false,
    videoQuery: "ダンベル フレンチプレス 三頭筋",
    description: "上腕三頭筋の長頭を狙い、腕を太く・引き締めるのに効果的です。"
  },
  {
    id: "db-lunge",
    name: "ダンベル ランジ",
    enName: "Dumbbell Lunge",
    category: "脚 (Legs)",
    equipment: "Dumbbell",
    mets: 5.5,
    isBig3: false,
    videoQuery: "ダンベル ランジ 下半身",
    description: "大腿四頭筋、ハムストリングス、大臀筋を総合的に鍛える優れた片脚動作です。"
  }
];

export const CATEGORIES = [
  "胸 (Chest)",
  "背中 (Back)",
  "脚 (Legs)",
  "肩 (Shoulders)",
  "腕 (Arms)",
  "臀部 (Glutes)"
];
