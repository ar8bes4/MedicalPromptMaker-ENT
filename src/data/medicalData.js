export const medicalSystems = [
  { value: 'ear', label: '耳' },
  { value: 'nose', label: '鼻・副鼻腔' },
  { value: 'throat', label: 'のど・口腔' },
  { value: 'vertigo', label: 'めまい・顔面' },
  { value: 'head_neck', label: '頭頸部・その他' }
];

export const medicalData = {
  // 耳 (Ear)
  e_otitis_media: { system: 'ear', label: '急性中耳炎', diseases: ["急性中耳炎（こども）", "滲出性中耳炎", "反復性中耳炎"] },
  e_otitis_externa: { system: 'ear', label: '外耳道炎', diseases: ["外耳道真菌症", "外耳道湿疹", "耳垢栓塞（耳あか）"] },
  e_sudden_deafness: { system: 'ear', label: '難聴・耳鳴', diseases: ["突発性難聴", "低音障害型感音難聴", "老人性難聴", "耳管開放症"] },
  e_surgery: { system: 'ear', label: '耳の手術', diseases: ["鼓膜換気チューブ挿入術", "鼓膜穿孔閉鎖術", "鼓室形成術"] },

  // 鼻 (Nose)
  n_allergy: { system: 'nose', label: 'アレルギー', diseases: ["アレルギー性鼻炎（花粉症）", "舌下免疫療法（シダキュア・ミティキュア）", "血管運動性鼻炎"] },
  n_sinusitis: { system: 'nose', label: '副鼻腔炎', diseases: ["急性副鼻腔炎", "慢性副鼻腔炎（蓄膿症）", "好酸球性副鼻腔炎", "鼻茸（はなたけ）"] },
  n_epistaxis: { system: 'nose', label: '鼻出血・その他', diseases: ["鼻出血（鼻血）", "鼻中隔弯曲症", "肥厚性鼻炎"] },
  n_surgery: { system: 'nose', label: '鼻の手術', diseases: ["下鼻甲介粘膜焼灼術（レーザー）", "内視鏡下副鼻腔手術", "鼻中隔矯正術"] },

  // のど・口腔 (Throat/Mouth)
  t_pharyngitis: { system: 'throat', label: '咽喉頭炎', diseases: ["急性咽頭・喉頭炎", "扁桃炎", "扁桃周囲膿瘍", "咽喉頭異常感症（のどの違和感）"] },
  t_voice: { system: 'throat', label: '声・呼吸', diseases: ["声帯ポリープ", "声帯結節", "逆流性喉頭炎", "急性喉頭蓋炎"] },
  t_mouth: { system: 'throat', label: '口腔・唾液腺', diseases: ["口内炎", "舌痛症", "腮腺炎（おたふく等）", "顎下腺結石"] },
  t_surgery: { system: 'throat', label: 'のどの手術', diseases: ["口蓋扁桃摘出術", "アデノイド切除術", "ラリンゴマイクロサージェリー（声帯手術）"] },

  // めまい・顔面 (Vertigo/Facial)
  v_bppv: { system: 'vertigo', label: 'めまい', diseases: ["良性発作性頭位めまい症（BPPV）", "メニエール病", "前庭神経炎", "めまいを伴う突発性難聴"] },
  v_facial: { system: 'vertigo', label: '顔面神経・感覚', diseases: ["顔面神経麻痺（ベル麻痺・ハント症候群）", "味覚障害", "嗅覚障害"] },

  // 頭頸部 (Head & Neck)
  h_tumor: { system: 'head_neck', label: '頚部の腫れ', diseases: ["正中頚嚢胞", "側頚嚢胞", "リンパ節炎", "甲状腺腫瘍"] },
  h_sleep: { system: 'head_neck', label: '睡眠・その他', diseases: ["睡眠時無呼吸症候群（SAS）", "CPAP治療", "いびき"] }
};

export const languages = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "英語" },
  { value: "zh", label: "中国語" },
  { value: "ko", label: "韓国語" },
  { value: "pt", label: "ポルトガル語" },
  { value: "es", label: "スペイン語" },
  { value: "vi", label: "ベトナム語" }
];

export const comprehensionLevels = [
  { value: "senior", label: "高齢者・一般向け（非常に平易）" },
  { value: "adult", label: "成人向け（標準的）" },
  { value: "child", label: "子供・保護者向け（やさしい表現）" },
  { value: "expert", label: "医療従事者向け（専門的）" },
  { value: "doctor", label: "医師" }
];

export const volumeOptions = [
  { value: "short", label: "短文" },
  { value: "a4_one", label: "A4用紙1枚程度" },
  { value: "multi_page", label: "複数ページ" }
];

export const diagramFormats = [
  { value: "infographic_v", label: "A4一枚縦のインフォグラフィック" },
  { value: "infographic_h", label: "A4一枚横のインフォグラフィック" },
  { value: "comic_multi", label: "複数ページの漫画" }
];

export const slideVolumeOptions = [
  { value: "slide_6", label: "6枚（短め・要点のみ）" },
  { value: "slide_10", label: "10枚（標準的）" },
  { value: "slide_14", label: "14枚（詳細）" }
];
