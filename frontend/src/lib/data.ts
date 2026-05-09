import type { Restaurant, Dish, DishCourse, Article } from "@/types";

export const restaurants: Restaurant[] = [
  {
    id: "1",
    slug: "le-petit-celeste",
    name: "Le Petit Céleste",
    location: "Paris, 1er Arrondissement",
    cuisine: "Contemporary French",
    priceRange: "$$$$",
    score: 9.8,
    ambienceScore: 9.4,
    serviceScore: 9.8,
    description:
      "A celestial journey through seasonal French ingredients, where Chef Julianne Moreau redefines traditional techniques with airy, ethereal textures and seasonal purity. The menu changes weekly based on local market availability.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHIdIY1oClMH--j6kZI6pekOgSbT7cud5h9X_8pEwGesYja4xi-P7ivPmOC1NHliseLWlx6Gs6SfTK40Hr7hKZJ-2z_AzcGjosHfnENDA3DMOKl0z-M5h-nuOLvk8iyObSdfGMI5GEeKTHOZkqcyRxL6QydRV4n3ZjLINCrss9TSoC-P76oZSIDc4UQQa1UNO8q0Pju-EqbnHVMvD2JiICn9WJgL9dvJgGY_qNLHIllVr8_vMLwNhufqtX_iIz_9R3UTijt-r7yyQ",
    featured: true,
  },
  {
    id: "2",
    slug: "lobsidienne",
    name: "L'Obsidienne",
    location: "Lyon, Presqu'île",
    cuisine: "Avant-Garde · Molecular",
    priceRange: "$$$",
    score: 9.5,
    ambienceScore: 9.9,
    serviceScore: 9.1,
    description:
      "A dark, immersive experience where texture and temperature are manipulated to challenge the palate in a setting of volcanic stone and sharp architectural lighting.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDQAeVhyP4JpS3xiaFnecbZBG0DLGA4a_EITroePDI58SHOgpGP6mFIEf_huCCyd1STRVh4usov8pghenx6hzKGOFYJZe0AL99cIpjLac0eJZBtrodGf6shf0vqK5nTC4XKf1XOnA1HhLrDFQ_DT9Npu-9QMcmXmbEBLO2GF_CZasawx8r9TvAlP0YqrA7EUEQ59qiEFS-OMMNZgR0Nm40ii6ysYc1BBsK-nkf7u6PCeHJ7C_5uPMvyl1rTQ1qxTVsd1N_TQxpv_HE",
  },
  {
    id: "3",
    slug: "sureau",
    name: "Sureau",
    location: "Bordeaux, Chartrons",
    cuisine: "Neo-Bistro · Foraged",
    priceRange: "$$",
    score: 9.2,
    ambienceScore: 8.8,
    serviceScore: 9.5,
    description:
      "Celebrating the wild flora of the Aquitaine region, Sureau offers a rustic yet refined encounter with the French countryside. A bright, airy space with natural wood tones.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEQXLLCzGcgIAvGPCq0NcQeMssPVKR3Wj3ZsypJP4rV9PggALgKu7g5jiQQzwykDzDdDf2AbieeDGsv6cNDRp58tIOU-9xp_1VoSJflu0gK54cP1ObLdn_XrH-a3SwIpnYlqjDrFpf_Lf03hWSuju83ry5MQf7_v-r6_gQZ7D7AWYJ1EvfJozk4OkZk2BnXDCAaF_xLByq7gLAVnyrY1cS9KMCzSSrNqtBxTxHEIDxKFxlJRHfvOoxtOAPXXG6fBsDuGEzhMKilbo",
  },
  {
    id: "4",
    slug: "pavillon",
    name: "Pavillon",
    location: "Paris, 8th Arrondissement",
    cuisine: "Classical · Grand Palais",
    priceRange: "$$$$",
    score: 9.7,
    ambienceScore: 9.8,
    serviceScore: 9.6,
    description:
      "The definition of classical grandeur, Pavillon serves legacy recipes with a level of silver service rarely seen in the modern age. Opulent decor meets meticulous hospitality.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQu5EvpBk4Pr6B1JJwWoDPHmYuZ53ftWgVHfP1i-0UL-enQoMZvJ8rI7U6dhNs3AXlJnYS6BE9rIGpABPUzFy8xZ1E7sti5WQdgwAj6JU97-oNBjDckXBAWGWn6BW1pHV68RK8d467NRszzl8mBz4T49JNydxWbthB-h4EhG471R5bjdBlxaLg_cPbHMvC_YmHp35sXO8Xsib6YLpdf0p7ILEzMcTy1r78C_Ik4kYXdTfAMihd7R1RFH9jqJT41Gc5Gr7zqTU-DQc",
  },
];

export const restaurantDishCourses: Record<string, DishCourse[]> = {
  "le-petit-celeste": [
    {
      number: "01",
      name: "Atlantic Bluefin Tartare",
      score: 9.6,
      scoreIcon: "star",
      description:
        "A masterclass in balance, the bluefin is diced to precision and accented with compressed cucumber, kohlrabi juice, and a delicate emulsion of ginger-infused olive oil. The freshness is electric, cutting through the natural fattiness of the fish with surgical grace.",
      howToSavour:
        "Begin with a small morsel of the fish alone to appreciate the cold-pressed ginger. Then incorporate a single leaf of the micro-shiso for a sudden, peppery burst that clarifies the palate for the next course.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAl4o4Eow4Xq_49ywGPmAI6snpuVhavAq_J1ReqzcuTGEfZPFsL5EhpEEAlUUTWSKTeoFYSQfFqgfq8523_XvNV2PUKd1Ceqg6T6rRgBNvXfKdNnMbB6dQX0vbhoT_vC5nWCsKadvHg7T7VymIqeZO5qpzSDATz0aYJ6DcFqH82Y3zdGng47gppr2SWXv-JU8weTNzAybhju8IDcjBeLGlwCUIT49_Kv9u5xEst0mjci6xktt25ZPwdOkHPQqdPOsyCchrrpsKRluY",
    },
    {
      number: "02",
      name: "Truffle Forest Risotto",
      score: 9.2,
      scoreIcon: "star_half",
      description:
        "Acquerello rice, aged for seven years, provides a texture that is simultaneously firm and velvety. Infused with a 24-hour mushroom consommé and topped with generous shavings of Périgord black truffle, it evokes the damp, rich aroma of an autumn woodland.",
      howToSavour:
        "Stir the truffle shavings into the core of the risotto for exactly five seconds. The heat activates the aroma. Inhale deeply before the first bite, allowing the earthy scent to guide your tasting experience.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDxNKy63eRjUYQ5jui_vVLkSC5YCbRm1C7fHg9YxNjM8rTZJkUGMF5JrBLk-8T4zSSnIU8qvyWidWABACkhtSYzWzDJzzWwsTjYgTr_axUtR2UdjQ1L-B1FlBZBmhMSRy9grjh6sFNoAqdZQmsagQDr9uvWUfjZLAjFATwZZf-8-OvbGSiLvh_PhtWwKPqYTXgciTGzrteshblfuOJdz5ZLYCmVN2p4RW0QJ7GX62AKbgQjFWZ3INSyUxyTzZzi5n3UowO-F5TzynI",
    },
    {
      number: "03",
      name: "The Ruby Sphere",
      score: 9.9,
      scoreIcon: "star",
      description:
        "A technical marvel of pastry. A paper-thin sugar shell in the brand's signature crimson hue encapsulates a light white chocolate mousse and a molten raspberry core. It sits atop a bed of cocoa 'soil' that provides a bitter counterpoint to the sweetness.",
      howToSavour:
        "Use the back of your silver spoon to firmly crack the sphere's apex. Let the raspberry coulis flow into the cocoa soil before scooping all three textures into a single bite. The temperature contrast is vital.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCuGBOFHAxbz0iAH-zulWdtLSk9qVNbl1-BLef45E3WtQdTJ0Z4fHSsXwFTk-HRzb-5NkZBtvhSVRmbJf_AyepR7Zv7DkeCMDB_ISOtikDvSPl_HhwCR8s35MIg9XjblQdZyMxf6vbAeXx4UpOFKAmaz1lKSRKoASVq10R5Vk3JdKkKozWBdEDAz1EXIZcXh-gkWfZKpFXYhF4dlcCmvDYxx3024rC7otlmG9wkF4m5L6kJN31jbFSQzCMkZCKA9FI2l1KEslqkJtM",
    },
  ],
};

export const dishes: Dish[] = [
  {
    id: "1",
    slug: "pan-seared-u10-scallops",
    name: "Pan-Seared U10 Scallops",
    restaurant: "L'Artiste Gourmet",
    cuisine: "French",
    priceRange: "$$$",
    score: 9.8,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCemYFDQOyZ3wbDcI_ahxAIGOfRtKK_ysuIEuIc6wOWAmfhXwDurdEMnpoZLdnVkwqFBaIoa611P5aG65Rg-5JRLEVbWOhgLuYrjCeKiY2e5Bpf5jrzjxzKakr7xxkpgWJR8t_cLadtDHBIrCedR634zn0dVAixlIwrbsUlSFA0LCZUEenYJVRHiUaEcmsKoQYhWUJ2yYGqce8Pf6Cr4wRNmjbPoZU9Sqszif5i-aJihy7VIwcQpM2pmlT-75CF22-CzXPEpl1A3LU",
  },
  {
    id: "2",
    slug: "harvest-quinoa-bowl",
    name: "Harvest Quinoa Bowl",
    restaurant: "Flora & Grain",
    cuisine: "Vegan",
    priceRange: "$$",
    score: 9.4,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQzV82GcXp81hC-CdxI2QEV_lRPLzUrnNWqBM59f1SqqmbngJG8L21bTPwcpHJSHpd0UY66qehvJkVz2l-C2uT8ZXf1emi8d3c6qUsinUvAC_--hayOTJCZ7rUfwB39pkCFscvALcifjHf64c60dtqn1a3ds-KocwPzoMjU4tGq5F2RqHcbqo4gikr2W732OEo-3v2cNXKhTOqFwATARVu-kjo_lR73vWiv59ny14lGio2GutIk4TKpI6JP_Iedq_vsb5xxWNdYXQ",
  },
  {
    id: "3",
    slug: "black-truffle-agnolotti",
    name: "Black Truffle Agnolotti",
    restaurant: "Siena Pasta Bar",
    cuisine: "Italian",
    priceRange: "$$$$",
    score: 10.0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8FLInF5cuz9eTUckkAh9wEWZHmDf7aR06cNoPTPtudsZHai8VZPaV9H51EtUcp72LNMly35vMmuMvJcw-gxN5B1edKpG7Pl1VTcbF703fhxVN3Vx7GrpPu0HhxOQjpdNbhLyQHxO07xy4m6GbgkeTh0r5jVAgLJdXweTbzxAHiyYE7JBlwROcOdzp_GXLnuqUi2IBN0vyTJUD5IHqFwAXxKxVUEwlNW7jnwEgBwNI1ZwxExcSm2lKG3bhSE2iicH1t5xCWLHn2F0",
  },
  {
    id: "4",
    slug: "deconstructed-pavlova",
    name: "Deconstructed Pavlova",
    restaurant: "The Sweet Maven",
    cuisine: "Dessert",
    priceRange: "$$$",
    score: 9.6,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeRTxio_G2a_Xq0sQbABLqmqjr0cMmaPpolkSwkk9TjU0n2j-GmP2FjSCG8Ei0b2BItwbEJj38Uv-dRv12fg6OinOskELP1K3oaqi-wSbDT-9BWFxbqYAf5_4jRLB3C17miB4YQY6jJ7L02NEiUwvrdXTGg_Mysc-ZxGK2EhbwM8WV0Z1Z8gFK3dI_pTzOEaURDqlbCqbpaAQHSgOXRHy0OQ43WJWWkaVF55lrsrX4mt42MIuAIDRzWxbfp3j3_IU3pvWhlOjYYiY",
  },
  {
    id: "5",
    slug: "a5-wagyu-strip",
    name: "A5 Wagyu Strip",
    restaurant: "Kobe Prime",
    cuisine: "Japanese",
    priceRange: "$$$$",
    score: 9.9,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWZrJ3FG15dgDCw_88OTXYesAly9ZwnH4vOEy8XwyGmoOdTPItVVo34Cn0yAAdKUgE-5N-y2WubEzvlaUiOaxnW_Z2JE9cRRaAGBQpv5Oo_eN7YE6kDi6zHhWgC91uI7POXDuEI62aRnNrk_08pz5N9cwrd_GIiJw23OigT4l-YS189rDqKAv3dPyOT30iaaLLgDh0eZuIFKPByRCUJT--8mYZENFZLx2dj-nUjZubky-tfQFYKL9_I6uwMCSca8X4vnju7J_ScdY",
  },
  {
    id: "6",
    slug: "glazed-lobster-tail",
    name: "Glazed Lobster Tail",
    restaurant: "Coastal Muse",
    cuisine: "Seafood",
    priceRange: "$$$",
    score: 9.2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvarGQODqkiQkFNKi-gsPhhBOjXZNv0We6OOUc7LsAd_8mD0hv1hScZW0eL6GSRaa3xy47nQv2D-eJT0KmhwmrRMAqoKnJc-H2e7zxriY8l8RzvvO-dsObb0ILe3eleOk3Y1Sd03G8amUmQsuRGWU-mmwfgJHIVSqG1DnDQOc1JygTBjk1EaB5gYA-dmVqAwLy-36PwgKMTuvuXFx7tsA5OwgM8oSgbj4NtpNognb9aFHW5L4Nj0gpGVT9TpdqvxjjRW5cHVFOjsg",
  },
  {
    id: "7",
    slug: "dry-aged-excellence",
    name: "Dry-Aged Excellence",
    restaurant: "L'Art de la Viande",
    cuisine: "Steakhouse",
    priceRange: "$$$",
    score: 9.4,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCh1P6eq3yDPQVdmUHcQG9Uh-I9FtyYMP-eza_5j6Ke3a7nK4ui_P0gRtgcsBTovYVgUO56i1nKG6ct18QFd6ahOOMPmmsf7f3JW3df2TlZ4Zmlzj5Q_V6xxNw1QeY9Xm-On6IDGHD5iglg31hYx_1xf0FKHyg38euJHWoMSK86LjgF9G7g7t2X6uH1bM6XfL661TOFgmXldhTibz3RD7gmNXKoVpcOZaOuUwPxQeWC-EYUMKsSqm38E8y7kxcIOULBHXesrP1ojT4",
  },
  {
    id: "8",
    slug: "the-verdant-bowl",
    name: "The Verdant Bowl",
    restaurant: "Ethos Kitchen",
    cuisine: "Plant-Based",
    priceRange: "$$",
    score: 8.8,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIwmz8WY9q7cb0wydihppJyQDwkF5lwCXa3m473Zz-Z1gtC2tVpR1WyCXeWQHXNrP0zalrYzhiAIBmdsR4Nr958aUTdOnMaUcGI9Whqu1zilN6HhjUv2d2rqkjVsmQ1NSHrCwgbv8jerV24yQSqwRoRaQb0OBPT2PA6hff55O2nBLhBI3hH3GVf_ReWgjZHZ5RQzoqD4W1MSr_3baZxCx9VVSWYHtv3dppim6qMfXTOSVr5lHFc2KDxpQXwUKTCh6eTc-ND-wewgY",
  },
  {
    id: "9",
    slug: "obsidian-cacao",
    name: "Obsidian Cacao",
    restaurant: "L'Ecrin Noir",
    cuisine: "Pâtisserie",
    priceRange: "$$$",
    score: 9.7,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfRJEdq6WmFEDXnBYFV2GT0kTv4df6RoBTAfT3wQXogC5G8wAn6XNBjd6xA0qupsELyqqmWcF2Iwrno3qNQ15QAHvhXekPvBfdVSqmc2UWAqmEQ1Qfvv4NgFLus0LrbmQzhv0P3uqIe99zY6Ra5uLzOZcgbHtgHXzko5jKDYv9OvCvBOUojhX_luMZuDVv-SP_IBPQmnmW1CZx0v_M9Iz920WNl4sUDcdol2RJBclM-szBbfHBVjwgfT8hsn6ss49RkT2dMHR0do0",
  },
];

export const articles: Article[] = [
  {
    id: "1",
    slug: "modernist-fermentation",
    title: "Modernist Fermentation: The New Frontier",
    excerpt:
      "Complexity born from patience. This guide explores the intersection of ancient preservation and contemporary flavour architecture.",
    badge: "Mastery",
    badgeVariant: "primary",
    mavenScore: 5.0,
    readTimeMinutes: 12,
    topic: "Technique",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9GX71Ijhaj9JdxBJcLhHy7osZl6ZN6OeenM1MUDUZ7_6M4TtJO3-z8JVbagh3_hEEyZKqOndgkgGXbkB8QJnKGIi9aj-4_N3WU--GKxCCxUufdH9F0v-r9QJkPlQ15eLiJYWrzFsa44uC98zwDXikHtsFUlGr-UsxZMHvnsHCpNy4kfz6hyLphu3u9-YXj-8ekQBkxh6y2bnKyR7qgrfD9-QIwRuY6513pz3ULUur6kgAqwVSugxKtiC-PLXCCT_gDtQT94pXn1Y",
  },
  {
    id: "2",
    slug: "tokyo-underground",
    title: "The Tokyo Underground: Edomae Secrets",
    excerpt:
      "Beyond the neon of Ginza lies a world of purists. We reveal the hidden ateliers where centuries-old traditions are whispered across Hinoki counters.",
    badge: "Heritage",
    badgeVariant: "tertiary",
    mavenScore: 4.8,
    readTimeMinutes: 18,
    topic: "Regional",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUKsTVisEHwAgl3jlT4d876mHIYo4M9J-wTKJD90IqeovTfB2FhZ2MNxIrvgNaTv0zlXviHScyrgYEEO6ZiypgWwAtNnNDoTIJLb5nbEef1lxnC7hVMh9T5uJDBI6-pZtywYLczME96IE3KeRWrsjw7-lBym-APQvY7fROY8kcEz5hl9xn8BMQhi4MZFggh1DrF6K9nTChHV6ZJa3V05FAZVot2_54jNxb2t_V4n52R232xTbDCRFydTkqgT-WduP04B91YCqKE44",
  },
  {
    id: "3",
    slug: "charcoal-manifesto",
    title: "The Charcoal Manifesto: Fire Mastery",
    excerpt:
      "Taming the elemental. A deep dive into the specific thermal properties of Binchotan and the art of the perfect Maillard reaction.",
    badge: "Editorial",
    badgeVariant: "primary",
    mavenScore: 4.9,
    readTimeMinutes: 15,
    topic: "Theory",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-PxSAQQhnl7AD34VRUQCH7F24eA4CED51tcZHUlgIWRAPlr9BSPjOgIwdRnxq_a8Bk1-frUcbVpZWC_JfafS9Z9mwoq5xKi42DV-Z3jPHO9GmP-1dg4k3OjEcNCrtZbvK8abj1DYjrFQqDZkmbQE4YKijD1ihp2Ipge675_3h4QzS5Ct6azf6o3Kp4zq5NOhk_YJG6ZSPd8vvweJmPKgyIGV-XjWWlSrZs6TDMs8tqCzpJztFXiaWiwoWTbpGXRK5U0Buss25u4E",
  },
  {
    id: "4",
    slug: "alchemy-of-the-bitter",
    title: "The Alchemy of the Bitter",
    excerpt:
      "A journey through the botanical landscapes of Italy. Understanding the delicate balance of wormwood, gentian, and citrus zest.",
    badge: "Libations",
    badgeVariant: "secondary",
    mavenScore: 4.7,
    readTimeMinutes: 10,
    topic: "Spirits",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzkDW2kqr_jj9hPl-QD4K-vJFD9_cUSO6HGRzXPogxBLZ0u1vzsIF9aqH7dIcDNwgIx17Ki_bwXxyb7t22-c_1X7ts2h6YzVCobdB4i2X9mJsqs8ZhRw5sOgQdzv6714vi2u585e_NbxI5p5d254MxYiQgiAH9P2nIpGBhX2GYgIGHVZJ_q35qomeKka--px2uJIzfb3M5c8_gQ5C3HXY31eSxb_xBX_F2x1xnfRW1Kl3-NNOKeMgOp4eVFbN0gN5ROFf-djjpC2M",
  },
  {
    id: "5",
    slug: "professional-atelier",
    title: "The Professional Atelier",
    excerpt:
      "We audition the tools that define the modern kitchen. From bespoke Japanese steel to the precise thermal control of induction technology.",
    badge: "Curation",
    badgeVariant: "primary",
    mavenScore: 5.0,
    readTimeMinutes: 22,
    topic: "Equipment",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGYu7ETAGF5rLm7jcSSknBilpaUXlpU7oDu_FnWEtiUEFRDugXv1XOn1DDhB9-383JWdfgfwFiGZ30LV2-PU2SXkrKzxHm0avzJPL2GbjKTyzXivggsPZB2FUg3diGoFsS8G4eWqLty7p_O0Yr53GG0l4s4_pe4TnNW66IQ3hQhjSrsIKK1s137U6RCDOy4GJLWAScQq5xM-G28H_kZ5edC3eFbVv3e-fMiqpbxdI7xG1xV7TPdOcFxiE0kbMNfkr25D7odGM_-Q8",
  },
  {
    id: "6",
    slug: "architecture-of-patisserie",
    title: "The Architecture of Pâtisserie",
    excerpt:
      "Form following function in the world of sweets. We analyse the structural integrity and flavour profiles of contemporary Parisian icons.",
    badge: "Precision",
    badgeVariant: "tertiary",
    mavenScore: 4.6,
    readTimeMinutes: 14,
    topic: "Pastry",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgvm6_7YOa5e8Da_qHxErMIpcsQy8wLPcPkK7oN6Im1No5TCySxeJ6rkZDrSTDR8Go-mh3iq2XNI0CBAyCOL6AsbpqF1HVLDyDhDXzHSDkly7Tuzs68yq0t_B-xmcgNvUYvOcaF0AeAZJDcDTEQSh_QAnK7P82tkYLYN4hpZTv-u4Zuao7E97WJBSo-rhTQiby7n17M5spQ2GUmPWCddpSafIEu90jYvEJiPaZXnH0NJBCtZcN8jlluXyhQ0Ly8QQU0eZf3qnGhws",
  },
];

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return restaurants.find((r) => r.slug === slug);
}

export function getDishCourses(restaurantSlug: string): DishCourse[] {
  return restaurantDishCourses[restaurantSlug] ?? [];
}

export const trendingDishes = dishes.slice(6, 9); // Dry-Aged, Verdant Bowl, Obsidian Cacao
