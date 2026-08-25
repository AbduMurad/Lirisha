/**
 * The real catalogue — nine pieces photographed by the house, transcribed from
 * the brand's own Facebook gallery.
 *
 * Every entry names its source frames and, where a frame contains a model, the
 * vertical offset the crop must start at. The house blurs faces in its own
 * photography; a 5:7 centre-crop would put that blur dead centre in the card,
 * so full-length model shots crop from the shoulders down instead. `top` is the
 * fraction of the source height where the crop window begins, `x` the
 * horizontal centre of the window. Both were read off the frames by eye.
 *
 * Copy describes only what is visible. Fabric is left blank wherever the weave
 * can't be identified from a photograph — the atelier fills those in from the
 * dashboard rather than the site claiming something it can't know.
 */

/** Crop ratios. The card and gallery are 5:7; the PDP hero is 2:3. */
export const CARD_AR = 5 / 7;
export const HERO_AR = 2 / 3;

const CARE =
  "التنظيف الجاف مفضّل. عند الغسل اليدوي: ماء بارد ومنظّف خفيف بلا مبيّض، دون فرك موضع التطريز. الكي من الداخل على حرارة منخفضة، ومن فوق قطعة قماش.";

export const CATALOGUE = [
  {
    slug: "mikado-shafaq-aaji",
    groupKey: "mikado-shafaq",
    nameAr: "عباية ميكادو بتطريز الشفق",
    nameEn: "Shafaq embroidered abaya",
    colorKey: "aaji",
    occasion: "مناسبات",
    embroidery: "تطريز يدوي",
    fabric: "",
    featured: true,
    descAr:
      "قَصّة مستقيمة بلمعة هادئة، وتطريز على الكمّ بألوان الشفق: موڤ وذهبي وخيط فضّي. تُلبس فوق فستان مطرّز بالحكاية نفسها.",
    detailsAr:
      "تطريز يدوي بالخرز والترتر على الكمّين وحافة الصدر. إغلاق أمامي مخفي. تظهر في الصور مع الفستان الداخلي المطرّز.",
    frames: [
      { src: "lirisha-03", kind: "front", top: 0.0, x: 0.56 },
      { src: "lirisha-02", kind: "three-quarter", top: 0.09, x: 0.46 },
      { src: "lirisha-01", kind: "detail", top: 0.0, x: 0.42 },
      { src: "lirisha-04", kind: "detail", top: 0.0, x: 0.38 },
    ],
  },
  {
    slug: "zuhur-nuhasiya-aaji",
    groupKey: "zuhur-nuhasiya",
    nameAr: "عباية الزهور النحاسية",
    nameEn: "Copper-floral abaya",
    colorKey: "aaji",
    occasion: "مناسبات",
    embroidery: "تطريز يدوي",
    fabric: "",
    featured: true,
    descAr:
      "زهور نحاسية مطرّزة تنساب على الحافة الأمامية وأطراف الأكمام، فوق فستان ساتان شمبانيا يعطي دفئاً للّون.",
    detailsAr:
      "أبليك زهري مطرّز يدوياً على الحافة الأمامية والكمّين. قَصّة مفتوحة تُلبس فوق الفستان الداخلي.",
    frames: [
      { src: "lirisha-16", kind: "front", top: 0.04, x: 0.5 },
      { src: "lirisha-15", kind: "three-quarter", top: 0.0, x: 0.5 },
      { src: "lirisha-14", kind: "detail", top: 0.0, x: 0.34 },
    ],
  },
  {
    slug: "kristal-fiddi-shambani",
    groupKey: "kristal-fiddi",
    nameAr: "عباية الكريستال الفضي",
    nameEn: "Silver-crystal abaya",
    colorKey: "shambani",
    occasion: "مناسبات",
    embroidery: "كريستال",
    fabric: "",
    featured: true,
    descAr:
      "تطريز كثيف بالكريستال والخرز الفضّي يغطي الصدر والكمّ، فوق فستان مطرّز بالكثافة نفسها. قطعة سهرة بامتياز.",
    detailsAr:
      "تطريز يدوي بالكريستال والخرز على كامل الجسم الأمامي والكمّين. تُباع مع الفستان الداخلي المطرّز.",
    frames: [
      { src: "lirisha-30", kind: "front", top: 0.0, x: 0.5 },
      { src: "lirisha-20", kind: "detail", top: 0.0, x: 0.42 },
      { src: "lirisha-27", kind: "detail", top: 0.0, x: 0.5 },
    ],
  },
  {
    slug: "shambani-hawaf-shambani",
    groupKey: "shambani-hawaf",
    nameAr: "عباية شامبانيا بحواف مطرزة",
    nameEn: "Champagne abaya, embroidered edges",
    colorKey: "shambani",
    occasion: "مناسبات",
    embroidery: "مطرز",
    fabric: "ساتان",
    featured: true,
    descAr:
      "ساتان شمبانيا بانسدال هادئ، وتطريز فضّي مركّز على أطراف الأكمام والحافة الأمامية. البساطة هنا مقصودة.",
    detailsAr:
      "ساتان بلمعة ناعمة. تطريز على أطراف الأكمام بشفافية خفيفة. قَصّة مفتوحة بحزام داخلي.",
    frames: [
      { src: "lirisha-29", kind: "front", top: 0.0, x: 0.5 },
      { src: "lirisha-41", kind: "three-quarter", top: 0.22, x: 0.55 },
      { src: "lirisha-39", kind: "three-quarter", top: 0.0, x: 0.5 },
      { src: "lirisha-28", kind: "fabric", top: 0.0, x: 0.5 },
      { src: "lirisha-35", kind: "detail", top: 0.0, x: 0.42 },
    ],
  },
  {
    slug: "organza-dhahabi-aaji",
    groupKey: "organza-dhahabi",
    nameAr: "عباية الأورجانزا الذهبية",
    nameEn: "Gold-organza abaya",
    colorKey: "aaji",
    occasion: "مناسبات",
    embroidery: "مطرز",
    fabric: "",
    descAr:
      "كمّ من الأورجانزا الذهبية مطرّز بالزهور، وأزرار ذهبية على الأسورة، على جسم عاجي سادة. التفصيلة كلها في الكمّ.",
    detailsAr:
      "بنل أورجانزا ذهبي مطرّز على الكمّ مع أزرار معدنية. الجسم سادة بلا زخرفة. رقبة دائرية مغلقة.",
    frames: [
      { src: "lirisha-33", kind: "front", top: 0.0, x: 0.42 },
      { src: "lirisha-32", kind: "three-quarter", top: 0.0, x: 0.55 },
    ],
  },
  {
    slug: "mi3taf-injlizi-samawi",
    groupKey: "mi3taf-injlizi",
    nameAr: "معطف عباية بقَصّة إنجليزية",
    nameEn: "Tailored coat abaya",
    colorKey: "samawi",
    occasion: "يومي",
    embroidery: "مطرز",
    fabric: "",
    descAr:
      "قَصّة معطف بياقة إنجليزية وتطريز زهري صغير على الصدر وعند الجيب. لون سماوي هادئ يصلح لنهار كامل.",
    detailsAr:
      "ياقة منعكسة وقَصّة مستقيمة بطول كامل. تطريز زهري صغير على الصدر والجيبين. إغلاق أمامي مخفي.",
    frames: [{ src: "lirisha-09", kind: "front", top: 0.0, x: 0.5 }],
  },
  {
    slug: "unnabi-rabta-burgundy",
    groupKey: "unnabi-rabta",
    nameAr: "طقم عنابي بربطة خصر",
    nameEn: "Burgundy tie-waist set",
    colorKey: "burgundy",
    occasion: "مناسبات",
    embroidery: "سادة",
    fabric: "ساتان",
    featured: true,
    descAr:
      "عباية عنابي من الساتان بربطة عند الخصر، فوق فستان بلون البشرة. لون جريء وقَصّة بلا زخرفة — التباين وحده يكفي.",
    detailsAr:
      "ساتان عنابي بأكمام واسعة وربطة قماشية عند الخصر. الطقم يشمل الفستان الداخلي.",
    frames: [
      { src: "lirisha-22", kind: "front", top: 0.0, x: 0.55 },
      { src: "lirisha-21", kind: "three-quarter", top: 0.0, x: 0.52 },
    ],
  },
  {
    slug: "bunni-mutarraz-bunni",
    groupKey: "bunni-mutarraz",
    nameAr: "طقم بني بتطريز معدني",
    nameEn: "Espresso set, metallic embroidery",
    colorKey: "bunni",
    occasion: "مناسبات",
    embroidery: "مطرز",
    fabric: "",
    descAr:
      "عباية بنّي داكن بأكمام واسعة، فوق فستان مطرّز بخيط معدني بنقشة متعرّجة. تباين هادئ بين السادة والمطرّز.",
    detailsAr:
      "عباية سادة بأكمام واسعة وحافة مطرّزة عند الكمّ. الفستان الداخلي مطرّز بالكامل بخيط معدني.",
    frames: [
      { src: "lirisha-18", kind: "front", top: 0.33, x: 0.35 },
      { src: "lirisha-17", kind: "three-quarter", top: 0.24, x: 0.6 },
    ],
  },
  {
    slug: "aswad-slip-aswad",
    groupKey: "aswad-slip",
    nameAr: "عباية سوداء بسليب مطرز",
    nameEn: "Black abaya, embroidered slip",
    colorKey: "aswad",
    occasion: "مناسبات",
    embroidery: "مطرز",
    fabric: "",
    descAr:
      "أسود بانسدال طويل، وتحته سليب بلون الرمل بتطريز معدني يظهر مع الحركة. القطعة التي تُلبس ولا تُنسى.",
    detailsAr:
      "عباية سوداء سادة بقَصّة مستقيمة. السليب الداخلي بلون الرمل مطرّز بخيط معدني على كامل الطول.",
    frames: [
      { src: "lirisha-42", kind: "front", top: 0.5, x: 0.35 },
      { src: "lirisha-42", kind: "detail", top: 0.68, x: 0.42, suffix: "b" },
    ],
  },
];

/** Full-bleed frames the storefront uses outside the catalogue. */
export const EDITORIAL = [
  // ── hero slides ───────────────────────────────────────────────
  //
  // Art-directed, not one frame stretched two ways: a 3:4 portrait dropped
  // into a wide desktop box crops to a band across the model's head, and a
  // wide crop on a phone letterboxes. So each slide ships both.
  //
  // The frames were *measured*, not chosen by eye. Mean luminance of the
  // bottom-inline-start zone — where the hero block lands in RTL — decides
  // whether a frame can hold ivory type at all. lirisha-03, the original
  // hero, reads 164 there: no scrim rescues that, which is why the type kept
  // looking weak. These three read 65, 64 and 89, and they run cream → black
  // → burgundy, so the sequence also shows three colourways.
  { key: "hero-1-wide", src: "lirisha-41", ar: 16 / 9, width: 2000, top: 0.22, x: 0.55 },
  { key: "hero-1-portrait", src: "lirisha-41", ar: 3 / 4, width: 1200, top: 0.22, x: 0.55 },
  { key: "hero-2-wide", src: "lirisha-17", ar: 16 / 9, width: 2000, top: 0.24, x: 0.6 },
  { key: "hero-2-portrait", src: "lirisha-17", ar: 3 / 4, width: 1200, top: 0.24, x: 0.6 },
  { key: "hero-3-wide", src: "lirisha-22", ar: 16 / 9, width: 2000, top: 0.0, x: 0.55 },
  { key: "hero-3-portrait", src: "lirisha-22", ar: 3 / 4, width: 1200, top: 0.0, x: 0.55 },
  { key: "atelier", src: "lirisha-20", ar: 4 / 5, width: 1200, top: 0.0, x: 0.45 },
  { key: "packaging-1", src: "lirisha-24", ar: 1, width: 900, top: 0.0, x: 0.56 },
  { key: "packaging-2", src: "lirisha-34", ar: 1, width: 900, top: 0.0, x: 0.5 },
  { key: "packaging-3", src: "lirisha-40", ar: 1, width: 900, top: 0.0, x: 0.5 },
];

export { CARE };
