export const articleLibrary = [
  {
    id: "soil-health",
    title: "5 Ways to Improve Your Soil Health",
    summary:
      "Build a nutrient-rich foundation with composting, cover crops, and moisture management tips for mixed farms.",
    readTime: "4 min read",
    tag: "Soil Care",
    url: "/articles/soil-health",
    featureHome: true,
    featureAccount: false,
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCA28tLs0B_xksW-t6klMrtYJVc7ZaRbAXHPmvDSPptVHn6CtJGFD9GWBm0lTrETF3Sgeboe0zI5MvjCNo4LcUIuZDwD4SuEgskn17hpOaQTovd1vK80ETDve4qRSvYE25-4RMVxd7ek_p5v0sCnH2i4plL7bg7HicQQeqwc9S7ma0eaL1vYX6uXSP9YRUzNt3DKm0oxyj_MsqRla_47YpNqjlpCWlZB9teW23yR5JuxodOzFKrFhhGlKefUs7m2WyJ4UFQB3Vs2tk",
  },
  {
    id: "spring-planting",
    title: "Seasonal Guide: Spring Planting Tips",
    summary:
      "Maximize yields with staggered sowing, seed priming, and localized irrigation strategies for spring.",
    readTime: "6 min read",
    tag: "Crop Planning",
    url: "/articles/spring-planting",
    featureHome: true,
    featureAccount: false,
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCTHTi5UQSR233xsMibUMPYHC6DgJsQXf-kfIf6BiJZN_I8-8tXzq_jnB8jUAv93zLvBKkFEJP9Lv56bcy2gDWD6lXNSG5rQVHEB9Z_gaeZAdESzgF1IEaqhnxTTrltX2s_v-j5k5VF8CRQVmGfFbwJnuCTDtf6tUZ--UBgfl3We9jxv8Ej30b92vcIs2id2sBGxoGscYLMCAa8Wcx7VsdCTeVrA981kuqx2FbwaNPbpRobhwXBAZYGn9kVsTxbMrZ7pkNolaifXeY",
  },
  {
    id: "ai-grazing",
    title: "AI-Assisted Grazing Plans",
    summary:
      "How predictive models map soil nutrients and recommend herd rotation across mixed pastures.",
    readTime: "5 min read",
    tag: "Precision Farming",
    url: "/articles/ai-grazing",
    featureHome: false,
    featureAccount: true,
  },
  {
    id: "vaccination-2024",
    title: "Vaccination Schedule 2024",
    summary:
      "Seasonal checklist prepared by our veterinary partners to keep dairy and beef herds resilient.",
    readTime: "8 min read",
    tag: "Livestock Health",
    url: "/articles/vaccination-2024",
    featureHome: false,
    featureAccount: true,
  },
  {
    id: "water-optimization",
    title: "Water Optimization for Arid Climates",
    summary:
      "Combine soil probes, shade cloth, and AI weather alerts to stretch every liter during heat waves.",
    readTime: "7 min read",
    tag: "Climate Resilience",
    url: "/articles/water-optimization",
    featureHome: false,
    featureAccount: true,
  },
  {
    id: "market-brief",
    title: "Ag Commodity Market Brief",
    summary:
      "Weekly pricing snapshot for feed, seed, and veterinary supplies so you can time purchases wisely.",
    readTime: "3 min read",
    tag: "Market Watch",
    url: "/articles/market-brief",
    featureHome: false,
    featureAccount: true,
  },
];

export const homeArticles = articleLibrary.filter((article) => article.featureHome);
export const accountArticles = articleLibrary.filter((article) => article.featureAccount);
