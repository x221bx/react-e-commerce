// src/data/articles.js
const normalizeLocale = (locale = "en") => (locale?.toLowerCase().startsWith("ar") ? "ar" : "en");

const multiline = (segments) => segments.join("\n\n");

// Generate URL-friendly slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

export const articleLibrary = [
  {
    id: "soil-health",
    slug: "rebuild-soil-health-in-5-weekend-tasks",
    tag: "Soil Care",
    readTime: "4 min",
    heroImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    author: "Dr. Layla Hassan",
    featureHome: true,
    featureAccount: true,
    title: "Rebuild Soil Health in 5 Weekend Tasks",
    summary:
      "Use compost teas, living roots, and crop residue mulches to wake up compacted loam before planting week.",
    content: multiline([
      "Collect a jar of topsoil from each block and check its smell, aggregation, and infiltration. Healthy soil should crumble in your hand, smell sweet, and allow a litre of water to disappear in under three minutes.",
      "On day one brew a 24-hour compost tea, cut it 1:4 with clean water, and drench the driest beds. Follow with a light biological mulch (shredded cover crop or microchipped prunings) so microbes stay shaded.",
      "Finish the weekend with a simple infiltration test. If water still ponds, plant a quick buckwheat/daikon mix. Those roots will continue opening the soil while you prep the next planting window.",
    ]),
    translations: {
      ar: {
        title: "استعادة صحة التربة في خمسة مهام أسبوعية",
        summary:
          "استخدم شاي الكمبوست والجذور الحية وطبقات البقايا النباتية لإعادة الحيوية إلى التربة المتصلبة قبل أسبوع الزراعة.",
        content: multiline([
          "اجمع جرة من التربة السطحية من كل حقل وتفحص الرائحة والتفكك وقدرة التسريب. التربة الصحية يجب أن تتفتت في اليد، وتكون رائحتها طيبة، وتسمح بمرور لتر ماء خلال أقل من ثلاث دقائق.",
          "في اليوم الأول حضّر شاي كمبوست لمدة 24 ساعة، ثم امزجه بنسبة 1 إلى 4 بماء نظيف واسقِ الأسرة الأكثر جفافاً. غطِ المنطقة بطبقة خفيفة من البقايا النباتية حتى تبقى الكائنات الدقيقة مظللة.",
          "اختم عطلة الأسبوع باختبار تسريب بسيط. إذا استمر ركود الماء، ازرع خليطاً سريعاً من الحنطة السوداء والفجل. ستواصل الجذور فتح التربة بينما تجهزك لموعد الزراعة التالي.",
        ]),
      },
    },
  },
  {
    id: "spring-planting",
    tag: "Crop Planning",
    readTime: "6 min",
    heroImage:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80",
    author: "Youssef Marei",
    featureHome: true,
    featureAccount: false,
    title: "Spring Planting Guide for Mixed Farms",
    summary:
      "Stack seed priming, staggered sowing, and drip recalibration to keep cool-season crops on schedule.",
    content: multiline([
      "Start by grouping crops into three transplant waves. Cool brassicas and leafy greens go first, followed by cucurbits, then warm peppers and okra. Label trays by wave so the pack shed stays calm.",
      "Soak large seeds like squash for eight hours with kelp extract, then chill them overnight. This priming knocks five days off emergence in heavy soils.",
      "Before the final transplant push, reprogram drip zones. Flush mainlines, swap the oldest emitters, and bump pressures to 1 bar so the canopy gets even coverage in the first hot week.",
    ]),
    translations: {
      ar: {
        title: "دليل الزراعة الربيعية للمزارع المختلطة",
        summary:
          "قم بتقسيم مواعيد البذر، ومعالجة البذور، وإعادة ضبط التنقيط للحفاظ على محاصيل الموسم البارد في مسارها الصحيح.",
        content: multiline([
          "ابدأ بتقسيم المحاصيل إلى ثلاث دفعات للشتل. الخضروات الورقية والكرنب أولاً، ثم القرعيات، وأخيراً الفلفل والبامية. ضع علامات واضحة على الصواني لكل دفعة ليبقى العمل في محطة التعبئة منظماً.",
          "انقع البذور الكبيرة مثل القرع لمدة ثماني ساعات مع مستخلص الأعشاب البحرية ثم برّدها طوال الليل. هذا التحفيز يقلل فترة الإنبات خمسة أيام في التربة الثقيلة.",
          "قبل دفعة الشتل الأخيرة أعد برمجة مناطق الري بالتنقيط. اغسل الخطوط الرئيسية، واستبدل أقدم النقاط، وارفع الضغط إلى بار واحد لضمان تغطية متساوية خلال أول أسبوع حار.",
        ]),
      },
    },
  },
  {
    id: "ai-grazing",
    tag: "Precision Livestock",
    readTime: "5 min",
    heroImage:
      "https://images.unsplash.com/photo-1500937921341-3e157e4b8f53?auto=format&fit=crop&w=1200&q=80",
    author: "Sara Okasha",
    featureHome: false,
    featureAccount: true,
    title: "AI-Assisted Grazing Maps",
    summary:
      "Layer NDVI, collar data, and rainfall forecasts to rotate herds before forage drops under 3 inches.",
    content: multiline([
      "Upload weekly satellite NDVI tiles into your grazing app and tag any paddock trending yellow. Pair that layer with collar data so you can see true stay time for each herd.",
      "Ask the AI planner to recommend paddock swaps 3–4 days before forage dips to 3 inches. The prompt should include biomass targets, breed, and current rest days.",
      "Once the herd moves, log a walk-through score. Feed those field notes back into the planner so it learns which paddocks recover fastest after extreme heat.",
    ]),
    translations: {
      ar: {
        title: "خرائط الرعي المدعومة بالذكاء الاصطناعي",
        summary:
          "ادمج صور الأقمار الصناعية وبيانات الأطواق وتوقعات المطر لنقل القطيع قبل أن ينخفض العلف عن ثلاث بوصات.",
        content: multiline([
          "ارفع صور مؤشر الغطاء النباتي الأسبوعية إلى تطبيق الرعي وحدد أي حقل يتجه إلى اللون الأصفر. اربط الطبقة ببيانات أطواق الأبقار لقياس زمن البقاء الحقيقي لكل قطيع.",
          "اطلب من المخطط الذكي اقتراح نقل القطيع قبل ثلاثة أو أربعة أيام من انخفاض العلف إلى ثلاث بوصات. تضمّن في الطلب الكتلة الحيوية المستهدفة والسلالة وعدد أيام الراحة الحالية.",
          "بعد نقل القطيع سجّل تقييمك الميداني وارجع بهذه الملاحظات إلى المخطط حتى يتعلم أي الحقول تتعافى أسرع بعد موجات الحر.",
        ]),
      },
    },
  },
  {
    id: "vaccination-2024",
    tag: "Livestock Health",
    readTime: "8 min",
    heroImage:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
    author: "Dr. Karim Nassar",
    featureHome: false,
    featureAccount: true,
    title: "2024 Vaccination Calendar for Dairy Herds",
    summary:
      "Align clostridial boosters, FMD campaigns, and mineral drenches with lactation peaks to avoid setbacks.",
    content: multiline([
      "Print the national FMD campaign dates and pin them over the milking pit. Schedule clostridial boosters two weeks before each campaign so the immune response is fresh.",
      "Pair every vaccine day with a mineral drench rich in selenium and Vitamin E to reduce post-shot slumps. Keep fresh water close to the handling area to limit stress.",
      "Log temperatures for 72 hours after vaccination. If any animal spikes, move her to a shaded recovery pen and alert the vet portal inside the app.",
    ]),
    translations: {
      ar: {
        title: "جدول لقاحات 2024 لقطعان الألبان",
        summary:
          "انسّق جرعات الكلوستريديا وحملات الحمى القلاعية ومعالجات المعادن مع ذروة الإدرار لتجنب التراجع.",
        content: multiline([
          "اطبع مواعيد الحملات الوطنية للحمى القلاعية وعلّقها فوق حوض الحلب. جدْ جرعات الكلوستريديا قبل أسبوعين من كل حملة ليكون رد الفعل المناعي في أوجه.",
          "اربط كل يوم تطعيم بجرعة معادن غنية بالسيلينيوم وفيتامين هـ لتقليل الخمول بعد الحقن. ضع ماءً نظيفاً قرب منطقة التعامل لتخفيف الضغط.",
          "سجّل درجات الحرارة لمدة 72 ساعة بعد التطعيم. إذا ارتفعت حرارة بقرة انقلها إلى حظيرة مظللة وبلغ الطبيب البيطري من خلال البوابة في التطبيق.",
        ]),
      },
    },
  },
  {
    id: "water-optimization",
    tag: "Water Management",
    readTime: "7 min",
    heroImage:
      "https://images.unsplash.com/photo-1473447198190-8286f2d45a1c?auto=format&fit=crop&w=1200&q=80",
    author: "Heba Adel",
    featureHome: true,
    featureAccount: true,
    title: "Stretch Every Litre in Arid Climates",
    summary:
      "Combine soil probes, thermal shade cloth, and AI rain alerts to decide which blocks get the early shift.",
    content: multiline([
      "Install one capacitance probe per 2 hectares and set alerts at 35% field capacity. When the alarm pings, check the AI rainfall outlook before assigning irrigation.",
      "Deploy 40% shade cloth over leafy beds between noon and 4pm to cut evapotranspiration by 20%. Remove before dusk so plants dry out overnight.",
      "When rainfall probabilities jump above 60%, pause irrigation and open collection tiles instead. Captured runoff can irrigate nurseries for eight days.",
    ]),
    translations: {
      ar: {
        title: "استفد من كل لتر في المناخات الجافة",
        summary:
          "اجمع بين مجسّات التربة والأقمشة المظللة والتنبيهات الجوية لتحديد الحقول التي تحصل على ماء مبكر.",
        content: multiline([
          "ركّب مجس رطوبة لكل هكتارين واضبط التنبيه عند 35% من السعة الحقلية. عندما يصل التنبيه افحص توقعات المطر الذكية قبل توزيع الري.",
          "استعمل قماش تظليل بنسبة 40% فوق الأسرة الورقية من الظهر حتى الرابعة عصراً لتقليل النتح بـ20%. أزل القماش قبل الغروب كي تجف النباتات ليلاً.",
          "حين ترتفع احتمالات المطر فوق 60% أوقف الري وافتح بلاطات التجميع لالتقاط الجريان السطحي. المياه المخزنة تكفي مشاتلك لثمانية أيام.",
        ]),
      },
    },
  },
  {
    id: "carbon-mapping",
    tag: "Data & Mapping",
    readTime: "5 min",
    heroImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    author: "Omar Saied",
    featureHome: false,
    featureAccount: true,
    title: "Map Carbon Hotspots Before Verification",
    summary:
      "Use 50m transects, lab-ready soil bags, and drone orthos to prove sequestration on mixed acreage.",
    content: multiline([
      "Lay out three 50m transects per management zone. Pull soil cores at 0-15cm and 15-30cm, then vacuum seal and label by GPS.",
      "Fly a quarterly drone mission with 80% overlap to capture canopy vigor and residue cover. Import the ortho into QGIS and tag areas that stayed green longest.",
      "Share both datasets with your verification partner before sampling season so they pre-fill inspection notes and speed up payouts.",
    ]),
    translations: {
      ar: {
        title: "خرائط الكربون قبل طلب الاعتماد",
        summary:
          "استعمل خطوط قياس بطول 50 م وعيّنات تربة ودقة التصوير الجوي لإثبات احتجاز الكربون في الحقول المختلطة.",
        content: multiline([
          "ضع ثلاث خطوط قياس بطول 50 متراً في كل منطقة إدارة. خذ عينات تربة من عمق 0-15 سم ومن 15-30 سم ثم أفرغ الهواء من الأكياس وضع إحداثيات GPS.",
          "نفذ رحلة طائرة بدون طيار ربع سنوية بتداخل 80% لالتقاط حيوية الغطاء النباتي. استورد الصورة إلى QGIS وحدد المناطق التي بقيت خضراء أطول مدة.",
          "شارك المجموعتين من البيانات مع جهة الاعتماد قبل موسم أخذ العينات ليعبّئوا الملاحظات مسبقاً ويسرّعوا المدفوعات.",
        ]),
      },
    },
  },
  {
    id: "apiary-inspection",
    tag: "Pollination",
    readTime: "4 min",
    heroImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    author: "Nadine Bassem",
    featureHome: false,
    featureAccount: true,
    title: "Twelve-Minute Apiary Inspection",
    summary:
      "Carry a laminated checklist, sugar roll kit, and moisture strip to spot issues before nectar flow peaks.",
    content: multiline([
      "Start at the weakest hive and work toward the strongest to avoid spreading mites. Log brood pattern, food stores, and queen sighting in the same column every week.",
      "Perform a sugar roll on two random hives. If mite counts exceed 3%, treat that evening with organic formic pads and note the batch number.",
      "Dip a moisture strip into the honey super. Levels over 18% mean you need more ventilation before capping.",
    ]),
    translations: {
      ar: {
        title: "تفقد المناحل في اثنتي عشرة دقيقة",
        summary:
          "احمل قائمة فحص مطبوعة وعتاد اختبار الفاروا وشرائط الرطوبة لاكتشاف المشاكل قبل ذروة الرحيق.",
        content: multiline([
          "ابدأ بأضعف خلية واتجه نحو الأقوى لتجنب نشر الفاروا. سجّل نمط الحضنة ومخزون الغذاء ورؤية الملكة في العمود نفسه كل أسبوع.",
          "قم باختبار السكر على خليتين عشوائيتين. إذا تجاوزت نسبة الفاروا 3% عالج مساءً بألواح حمض الفورميك العضوية ودوّن رقم التشغيلة.",
          "اغمر شريط الرطوبة في صندوق العسل. إذا تخطى 18% فأضف تهوية قبل إغلاق الإطارات.",
        ]),
      },
    },
  },
  {
    id: "farm-energy-audit",
    tag: "Renewables",
    readTime: "5 min",
    heroImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    author: "Mohamed Anani",
    featureHome: false,
    featureAccount: true,
    title: "Quick Farm Energy Audit",
    summary:
      "Log pump runtimes, chill room loads, and idle tractors to size a solar upgrade without guesswork.",
    content: multiline([
      "Mount a clamp meter on every irrigation pump for one week. Record kWh per set so you know exact demand during peak season.",
      "List all refrigeration loads and note the defrost schedule. Older compressors usually run 40% more hours than their spec sheet claims.",
      "Finally, track diesel use for loaders and tractors. Any unit idling more than 20% of the day is a candidate for route redesign or electrification.",
    ]),
    translations: {
      ar: {
        title: "تدقيق طاقة سريع للمزرعة",
        summary:
          "سجل ساعات تشغيل المضخات وأحمال غرف التبريد والجرارات المتوقفة لتقدير نظام الطاقة الشمسية بدون تخمين.",
        content: multiline([
          "ركّب مقياس تيار على كل مضخة ري لمدة أسبوع وسجّل كيلوواط ساعة لكل نوبة لتعرف الطلب الفعلي في موسم الذروة.",
          "دوّن جميع أحمال التبريد وجدول إذابة الجليد. الضواغط القديمة تعمل غالباً أكثر بنسبة 40% من المواصفات.",
          "أخيراً راقب استهلاك الديزل للجرارات واللودرات. أي معدة تتوقف أكثر من 20% من اليوم تستحق إعادة تصميم المسار أو التحول للكهرباء.",
        ]),
      },
    },
  },
  {
    id: "regenerative-pasture",
    tag: "Regeneration",
    readTime: "6 min",
    heroImage:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
    author: "Fatma Elsaid",
    featureHome: true,
    featureAccount: true,
    title: "Design a 45-Day Rest Rotation",
    summary:
      "Stack portable lanes, multi-species mixes, and rainfall triggers so pasture rest never dips below 45 days.",
    content: multiline([
      "Sketch paddocks on graph paper and overlay portable lanes that can snap together in under 20 minutes. This keeps moves fast even with one person.",
      "Seed triticale, chickling vetch, and brassica blends after the heaviest graze. Their different root depths keep soil covered while the paddock rests.",
      "Use rainfall totals as your trigger. If cumulative rain is under 15mm in a fortnight, extend rest another week before re-entry.",
    ]),
    translations: {
      ar: {
        title: "تصميم دورة رعي بفترة راحة 45 يوماً",
        summary:
          "اجمع مسارات متنقلة وخلطات متعددة الأنواع ومحفزات مطرية لتحافظ على راحة المراعي فوق 45 يوماً دائماً.",
        content: multiline([
          "ارسم الحقول على ورق بياني وضع مسارات متنقلة يمكن تجميعها خلال 20 دقيقة. بهذه الطريقة تبقى حركات القطيع سريعة حتى بشخص واحد.",
          "ازرع خليط التريتيكال والفول والكرنب بعد أشد رعي. أعماق الجذور المختلفة تغطي التربة أثناء فترة الراحة.",
          "اجعل مجموع الأمطار مؤشر العودة. إذا كان الهطول أقل من 15 ملم خلال أسبوعين فمدد الراحة أسبوعاً إضافياً قبل إعادة القطيع.",
        ]),
      },
    },
  },
  {
    id: "market-brief",
    tag: "Market Watch",
    readTime: "3 min",
    heroImage:
      "https://images.unsplash.com/photo-1448932252197-d19750584e56?auto=format&fit=crop&w=1200&q=80",
    author: "Editorial Desk",
    featureHome: false,
    featureAccount: true,
    title: "Weekly Input Market Brief",
    summary:
      "Track fertilizer, feed, and packaging swings so you can pre-buy before prices spike again.",
    content: multiline([
      "DAP prices fell 4% week-over-week across Alexandria depots. If you can store dry product, lock in enough for two months.",
      "Maize-based feed climbed 2.3% as Black Sea shipments slowed. Substitute 15% of the ration with local sorghum to cushion costs.",
      "Packaging film remains volatile. Consider pooling orders with neighbouring farms to meet pallet minimums and shave transport fees.",
    ]),
    translations: {
      ar: {
        title: "موجز أسبوعي لأسعار المدخلات",
        summary:
          "راقب تقلبات السماد والعلف والتعبئة لتشتري مسبقاً قبل الطفرة التالية.",
        content: multiline([
          "انخفضت أسعار فوسفات الأمونيوم بنسبة 4% أسبوعياً في مخازن الإسكندرية. إن كان التخزين متاحاً فاشترِ ما يكفي لشهرين.",
          "زاد سعر العلف القائم على الذرة 2.3% بسبب تباطؤ شحنات البحر الأسود. استبدل 15% من الخلطة بسورغوم محلي لتخفيف الكلفة.",
          "لا تزال أفلام التغليف متقلبة. جرّب تجميع الطلبات مع المزارع المجاورة لبلوغ الحد الأدنى واستقطاع رسوم الشحن.",
        ]),
      },
    },
  },
];

export const mergeLocalizedArticle = (article, locale = "en") => {
  const normalized = normalizeLocale(locale);
  const localizedFields = article?.translations?.[normalized];
  return {
    ...article,
    title: localizedFields?.title || article.title,
    summary: localizedFields?.summary || article.summary,
    content: localizedFields?.content || article.content,
  };
};

export const getFallbackArticles = ({ locale = "en", featureHome, featureAccount } = {}) =>
  articleLibrary
    .filter((article) => (featureHome === undefined ? true : article.featureHome === featureHome))
    .filter((article) => (featureAccount === undefined ? true : article.featureAccount === featureAccount))
    .map((article) => {
      const localized = mergeLocalizedArticle(article, locale);
      return {
        ...localized,
        slug: article.slug || generateSlug(article.title), // Use original title for slug generation
        status: 'published' // Fallback articles are always published
      };
    });

export const getFallbackArticle = (articleIdOrSlug, locale = "en") => {
  // First try to find by ID
  let entry = articleLibrary.find((article) => article.id === articleIdOrSlug);

  // If not found by ID, try to find by slug field if it exists
  if (!entry) {
    entry = articleLibrary.find((article) => article.slug === articleIdOrSlug);
  }

  // If still not found, try to find by generated slug from title
  if (!entry) {
    entry = articleLibrary.find((article) => generateSlug(article.title) === articleIdOrSlug);
  }

  return entry ? {
    ...mergeLocalizedArticle(entry, locale),
    slug: entry.slug || generateSlug(entry.title),
    status: 'published' // Fallback articles are always published
  } : null;
};

export const localizeArticleRecord = (article, locale = "en") => mergeLocalizedArticle(article, locale);

export const homeArticles = (locale = "en") => getFallbackArticles({ locale, featureHome: true });
export const accountArticles = (locale = "en") => getFallbackArticles({ locale, featureAccount: true });
export { normalizeLocale };