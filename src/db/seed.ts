import { db } from "./index";
import { leagues, matches, articles, socialLinks, siteSettings, footerPages } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Seed Leagues
  const leaguesData = [
    { nameAr: "كأس العالم", nameFr: "Coupe du Monde", nameEn: "World Cup", slug: "world-cup", order: 1 },
    { nameAr: "الدوري الإنجليزي الممتاز", nameFr: "Premier League", nameEn: "Premier League", slug: "premier-league", order: 2 },
    { nameAr: "الدوري الإسباني", nameFr: "La Liga", nameEn: "La Liga", slug: "la-liga", order: 3 },
    { nameAr: "الدوري الفرنسي", nameFr: "Ligue 1", nameEn: "Ligue 1", slug: "ligue-1", order: 4 },
    { nameAr: "الدوري الإيطالي", nameFr: "Série A", nameEn: "Serie A", slug: "serie-a", order: 5 },
    { nameAr: "الدوري الألماني", nameFr: "Bundesliga", nameEn: "Bundesliga", slug: "bundesliga", order: 6 },
    { nameAr: "الدوري المغربي", nameFr: "Ligue Marocaine", nameEn: "Moroccan League", slug: "moroccan-league", order: 7 },
    { nameAr: "الدوري المصري", nameFr: "Ligue Égyptienne", nameEn: "Egyptian League", slug: "egyptian-league", order: 8 },
    { nameAr: "الدوري الجزائري", nameFr: "Ligue Algérienne", nameEn: "Algerian League", slug: "algerian-league", order: 9 },
  ];

  const insertedLeagues = await db.insert(leagues).values(leaguesData).returning();

  // Seed Matches
  const matchesData = [
    // Live matches
    { homeTeamAr: "ريال مدريد", homeTeamFr: "Real Madrid", homeTeamEn: "Real Madrid", awayTeamAr: "برشلونة", awayTeamFr: "Barcelone", awayTeamEn: "Barcelona", homeScore: 2, awayScore: 1, status: "live", leagueId: insertedLeagues[2].id, matchDate: new Date(), matchTime: "21:00" },
    { homeTeamAr: "ليفربول", homeTeamFr: "Liverpool", homeTeamEn: "Liverpool", awayTeamAr: "مانشستر سيتي", awayTeamFr: "Manchester City", awayTeamEn: "Manchester City", homeScore: 0, awayScore: 0, status: "live", leagueId: insertedLeagues[1].id, matchDate: new Date(), matchTime: "19:00" },
    { homeTeamAr: "باريس سان جيرمان", homeTeamFr: "Paris Saint-Germain", homeTeamEn: "Paris Saint-Germain", awayTeamAr: "مارسيليا", awayTeamFr: "Marseille", awayTeamEn: "Marseille", homeScore: 3, awayScore: 2, status: "live", leagueId: insertedLeagues[3].id, matchDate: new Date(), matchTime: "20:00" },

    // Finished matches
    { homeTeamAr: "الأهلي", homeTeamFr: "Al Ahly", homeTeamEn: "Al Ahly", awayTeamAr: "الزمالك", awayTeamFr: "Zamalek", awayTeamEn: "Zamalek", homeScore: 2, awayScore: 0, status: "finished", leagueId: insertedLeagues[7].id, matchDate: new Date("2026-01-10"), matchTime: "18:00" },
    { homeTeamAr: "الوداد", homeTeamFr: "Wydad", homeTeamEn: "Wydad", awayTeamAr: "الرجاء", awayTeamFr: "Raja", awayTeamEn: "Raja", homeScore: 1, awayScore: 1, status: "finished", leagueId: insertedLeagues[6].id, matchDate: new Date("2026-01-09"), matchTime: "20:00" },
    { homeTeamAr: "يوفنتوس", homeTeamFr: "Juventus", homeTeamEn: "Juventus", awayTeamAr: "إنتر ميلان", awayTeamFr: "Inter Milan", awayTeamEn: "Inter Milan", homeScore: 0, awayScore: 1, status: "finished", leagueId: insertedLeagues[4].id, matchDate: new Date("2026-01-08"), matchTime: "20:45" },
    { homeTeamAr: "بايرن ميونخ", homeTeamFr: "Bayern Munich", homeTeamEn: "Bayern Munich", awayTeamAr: "دورتموند", awayTeamFr: "Dortmund", awayTeamEn: "Dortmund", homeScore: 3, awayScore: 2, status: "finished", leagueId: insertedLeagues[5].id, matchDate: new Date("2026-01-07"), matchTime: "18:30" },
    { homeTeamAr: "المغرب", homeTeamFr: "Maroc", homeTeamEn: "Morocco", awayTeamAr: "الجزائر", awayTeamFr: "Algérie", awayTeamEn: "Algeria", homeScore: 2, awayScore: 1, status: "finished", leagueId: insertedLeagues[0].id, matchDate: new Date("2025-12-20"), matchTime: "21:00" },
    { homeTeamAr: "أرسنال", homeTeamFr: "Arsenal", homeTeamEn: "Arsenal", awayTeamAr: "تشيلسي", awayTeamFr: "Chelsea", awayTeamEn: "Chelsea", homeScore: 2, awayScore: 2, status: "finished", leagueId: insertedLeagues[1].id, matchDate: new Date("2026-01-06"), matchTime: "17:30" },

    // Upcoming matches
    { homeTeamAr: "المغرب", homeTeamFr: "Maroc", homeTeamEn: "Morocco", awayTeamAr: "فرنسا", awayTeamFr: "France", awayTeamEn: "France", homeScore: null, awayScore: null, status: "upcoming", leagueId: insertedLeagues[0].id, matchDate: new Date("2026-06-15"), matchTime: "21:00" },
    { homeTeamAr: "مانشستر يونايتد", homeTeamFr: "Manchester United", homeTeamEn: "Manchester United", awayTeamAr: "ليفربول", awayTeamFr: "Liverpool", awayTeamEn: "Liverpool", homeScore: null, awayScore: null, status: "upcoming", leagueId: insertedLeagues[1].id, matchDate: new Date("2026-01-20"), matchTime: "18:00" },
    { homeTeamAr: "أتلتيكو مدريد", homeTeamFr: "Atletico Madrid", homeTeamEn: "Atletico Madrid", awayTeamAr: "إشبيلية", awayTeamFr: "Séville", awayTeamEn: "Sevilla", homeScore: null, awayScore: null, status: "upcoming", leagueId: insertedLeagues[2].id, matchDate: new Date("2026-01-22"), matchTime: "20:00" },
    { homeTeamAr: "الرجاء", homeTeamFr: "Raja", homeTeamEn: "Raja", awayTeamAr: "فتح الرباط", awayTeamFr: "FAR Rabat", awayTeamEn: "FAR Rabat", homeScore: null, awayScore: null, status: "upcoming", leagueId: insertedLeagues[6].id, matchDate: new Date("2026-01-25"), matchTime: "19:00" },
    { homeTeamAr: "شبيبة القبائل", homeTeamFr: "JS Kabylie", homeTeamEn: "JS Kabylie", awayTeamAr: "مولودية الجزائر", awayTeamFr: "MC Alger", awayTeamEn: "MC Alger", homeScore: null, awayScore: null, status: "upcoming", leagueId: insertedLeagues[8].id, matchDate: new Date("2026-01-24"), matchTime: "17:00" },
    { homeTeamAr: "روما", homeTeamFr: "Roma", homeTeamEn: "Roma", awayTeamAr: "نابولي", awayTeamFr: "Naples", awayTeamEn: "Napoli", homeScore: null, awayScore: null, status: "upcoming", leagueId: insertedLeagues[4].id, matchDate: new Date("2026-01-23"), matchTime: "20:45" },
  ];

  await db.insert(matches).values(matchesData);

  // Seed Articles
  const articlesData = [
    {
      titleAr: "ريال مدريد يفوز في الكلاسيكو بنتيجة مثيرة",
      titleFr: "Le Real Madrid remporte le Classico dans un match passionnant",
      titleEn: "Real Madrid Wins El Clásico in Thrilling Match",
      contentAr: "في ليلة مثيرة على ملعب سانتياغو برنابيو، تمكن ريال مدريد من تحقيق فوز صعب على غريمه التقليدي برشلونة بنتيجة 2-1. سجل فينيسيوس جونيور الهدف الأول في الدقيقة 23 قبل أن يعادل ليفاندوفسكي النتيجة في الدقيقة 56. لكن جود بيلينغهام حسم الأمور بهدف ذهبي في الدقيقة 78.",
      contentFr: "Lors d'une soirée passionnante au Santiago Bernabéu, le Real Madrid a réussi à arracher une victoire difficile contre son rival traditionnel, le Barcelone, sur le score de 2-1. Vinícius Júnior a ouvert le score à la 23e minute avant que Lewandowski n'égalise à la 56e. Cependant, Jude Bellingham a scellé la victoire avec un but en or à la 78e minute.",
      contentEn: "In an exciting night at the Santiago Bernabéu, Real Madrid managed to secure a hard-fought victory against their traditional rivals Barcelona with a 2-1 scoreline. Vinícius Júnior opened the scoring in the 23rd minute before Lewandowski equalized in the 56th. However, Jude Bellingham sealed the deal with a golden goal in the 78th minute.",
      summaryAr: "ريال مدريد يحقق فوزاً مثيراً على برشلونة في الكلاسيكو بهدف بيلينغهام الذهبي.",
      summaryFr: "Le Real Madrid remporte une victoire passionnante contre le Barcelone grâce au but en or de Bellingham.",
      summaryEn: "Real Madrid secures thrilling victory over Barcelona with Bellingham's golden goal.",
      category: "football",
      isPublished: true,
    },
    {
      titleAr: "المغرب يتأهل لنصف نهائي كأس العالم 2026",
      titleFr: "Le Maroc se qualifie pour les demi-finales de la Coupe du Monde 2026",
      titleEn: "Morocco Qualifies for World Cup 2026 Semi-Finals",
      contentAr: "حقق المنتخب المغربي إنجازاً تاريخياً بالتأهل لنصف نهائي كأس العالم 2026 بعد فوزه على المنتخب البرتغالي بهدف نظيف. سجل الهدف حكيم زياش في الدقيقة 67 بتسديدة رائعة من خارج منطقة الجزاء. هذا الإنجاز يعد الأبرز في تاريخ الكرة المغربية.",
      contentFr: "L'équipe nationale marocaine a réalisé un exploit historique en se qualifiant pour les demi-finales de la Coupe du Monde 2026 après sa victoire sur l'équipe portugaise par un but à zéro. Hakim Ziyech a marqué le but à la 67e minute avec une superbe frappe depuis l'extérieur de la surface. Cet exploit est le plus marquant de l'histoire du football marocain.",
      contentEn: "The Moroccan national team achieved a historic milestone by qualifying for the 2026 World Cup semi-finals after defeating Portugal 1-0. Hakim Ziyech scored the goal in the 67th minute with a stunning strike from outside the box. This achievement is the most notable in Moroccan football history.",
      summaryAr: "إنجاز تاريخي للمغرب بالتأهل لنصف نهائي كأس العالم بعد الفوز على البرتغال.",
      summaryFr: "Exploit historique du Maroc en se qualifiant pour les demi-finales après la victoire sur le Portugal.",
      summaryEn: "Historic achievement as Morocco reaches World Cup semi-finals after defeating Portugal.",
      category: "football",
      isPublished: true,
    },
    {
      titleAr: "ليفربول يعزز صدارته للدوري الإنجليزي",
      titleFr: "Liverpool renforce sa position en tête du championnat anglais",
      titleEn: "Liverpool Strengthens Lead in Premier League",
      contentAr: "عزز ليفربول موقعه في صدارة الدوري الإنجليزي الممتاز بعد فوزه الكبير على توتنهام بثلاثة أهداف مقابل هدف واحد. سجل محمد صلاح هدفين وصنع الثالث ليقود فريقه لتحقيق الفوز السابع على التوالي.",
      contentFr: "Liverpool a renforcé sa position en tête du championnat anglais après sa grande victoire sur Tottenham par trois buts à un. Mohamed Salah a marqué deux buts et a délivré une passe décisive pour le troisième, menant son équipe à sa septième victoire consécutive.",
      contentEn: "Liverpool strengthened their position at the top of the Premier League after a convincing 3-1 victory over Tottenham. Mohamed Salah scored twice and assisted the third, leading his team to their seventh consecutive win.",
      summaryAr: "صلاح يقود ليفربول للفوز السابع على التوالي ويعزز الصدارة.",
      summaryFr: "Salah mène Liverpool à sa septième victoire consécutive et renforce la première place.",
      summaryEn: "Salah leads Liverpool to seventh consecutive win and strengthens top position.",
      category: "football",
      isPublished: true,
    },
    {
      titleAr: "الدوري المغربي: منافسة محتدمة على اللقب",
      titleFr: "Ligue marocaine: compétition féroce pour le titre",
      titleEn: "Moroccan League: Fierce Competition for the Title",
      contentAr: "يشهد الدوري المغربي منافسة محتدمة بين الوداد والرجاء وفتح الرباط على لقب البطولة. الانفراجات متقاربة والنتائج مفاجئة في كل جولة، مما يجعل البطولة الأكثر إثارة في السنوات الأخيرة.",
      contentFr: "Le championnat marocain connaît une compétition féroce entre le Wydad, le Raja et le FAR Rabat pour le titre. Les écarts sont minimes et les résultats surprenants à chaque journée, ce qui en fait le championnat le plus excitant des dernières années.",
      contentEn: "The Moroccan league is witnessing fierce competition between Wydad, Raja, and FAR Rabat for the title. The gaps are close and results are surprising in every round, making it the most exciting championship in recent years.",
      summaryAr: "منافسة ثلاثية محتدمة في الدوري المغربي بين الوداد والرجاء وفتح الرباط.",
      summaryFr: "Compétition triple féroce dans la ligue marocaine entre Wydad, Raja et FAR Rabat.",
      summaryEn: "Fierce three-way competition in the Moroccan league between Wydad, Raja, and FAR Rabat.",
      category: "football",
      isPublished: true,
    },
    {
      titleAr: "بايرن ميونخ يحسم ديربي ألمانيا",
      titleFr: "Le Bayern Munich remporte le derby allemand",
      titleEn: "Bayern Munich Wins German Derby",
      contentAr: "في مباراة درامية على ملعب سيغنال إيدونا بارك، تمكن بايرن ميونخ من الفوز على بوروسيا دورتموند بنتيجة 3-2 في قمة الدوري الألماني. المباراة شهدت أحداثاً مثيرة وأهدافاً رائعة من الطرفين.",
      contentFr: "Lors d'un match dramatique au Signal Iduna Park, le Bayern Munich a réussi à battre le Borussia Dortmund 3-2 dans le sommet du championnat allemand. Le match a été rempli d'émotions et de buts spectaculaires des deux côtés.",
      contentEn: "In a dramatic match at Signal Iduna Park, Bayern Munich managed to defeat Borussia Dortmund 3-2 in the Bundesliga showdown. The match featured exciting events and spectacular goals from both sides.",
      summaryAr: "بايرن ميونخ يفوز بديربي ألمانيا على دورتموند بنتيجة 3-2.",
      summaryFr: "Le Bayern Munich remporte le derby allemand contre Dortmund sur le score de 3-2.",
      summaryEn: "Bayern Munich wins German derby against Dortmund with a 3-2 scoreline.",
      category: "football",
      isPublished: true,
    },
  ];

  await db.insert(articles).values(articlesData);

  // Seed Social Links
  const socialLinksData = [
    { platform: "Facebook", url: "https://facebook.com/abbourysport", icon: "facebook", order: 1 },
    { platform: "Twitter", url: "https://twitter.com/abbourysport", icon: "twitter", order: 2 },
    { platform: "Instagram", url: "https://instagram.com/abbourysport", icon: "instagram", order: 3 },
    { platform: "YouTube", url: "https://youtube.com/abbourysport", icon: "youtube", order: 4 },
    { platform: "TikTok", url: "https://tiktok.com/@abbourysport", icon: "tiktok", order: 5 },
  ];

  await db.insert(socialLinks).values(socialLinksData);

  // Seed Footer Pages
  const footerPagesData = [
    {
      slug: "about",
      titleAr: "من نحن",
      titleFr: "À Propos",
      titleEn: "About Us",
      contentAr: "Abbourysport هو موقع رياضي شامل يغطي أخبار كرة القدم والبطولات العالمية والمحلية. نسعى لتقديم محتوى رياضي عالي الجودة بثلاث لغات: العربية والفرنسية والإنجليزية. نحن فريق من المحررين والصحفيين الرياضيين المتحمسين الذين يعملون على مدار الساعة لتزويدك بأحدث الأخبار والنتائج والتحليلات الرياضية.",
      contentFr: "Abbourysport est un site sportif complet couvrant les actualités du football et les championnats mondiaux et locaux. Nous nous efforçons de fournir un contenu sportif de haute qualité en trois langues : arabe, français et anglais. Nous sommes une équipe de rédacteurs et de journalistes sportifs passionnés qui travaillent 24h/24 pour vous fournir les dernières nouvelles, résultats et analyses sportives.",
      contentEn: "Abbourysport is a comprehensive sports website covering football news and both global and local championships. We strive to deliver high-quality sports content in three languages: Arabic, French, and English. We are a team of passionate editors and sports journalists working around the clock to bring you the latest news, results, and sports analysis.",
    },
    {
      slug: "privacy",
      titleAr: "سياسة الخصوصية",
      titleFr: "Politique de Confidentialité",
      titleEn: "Privacy Policy",
      contentAr: "نحن في Abbourysport نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لا نقوم بجمع أو تخزين أي معلومات شخصية دون موافقتك الصريحة. نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح فقط. يمكنك الاتصال بنا لأي استفسار بخصوص سياسة الخصوصية.",
      contentFr: "Chez Abbourysport, nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Nous ne collectons ni ne stockons aucune information personnelle sans votre consentement explicite. Nous utilisons des cookies uniquement pour améliorer votre expérience de navigation. Vous pouvez nous contacter pour toute question concernant notre politique de confidentialité.",
      contentEn: "At Abbourysport, we respect your privacy and are committed to protecting your personal data. We do not collect or store any personal information without your explicit consent. We use cookies solely to improve your browsing experience. You can contact us with any questions regarding our privacy policy.",
    },
    {
      slug: "contact",
      titleAr: "اتصل بنا",
      titleFr: "Contactez-nous",
      titleEn: "Contact Us",
      contentAr: "يسعدنا التواصل معكم! يمكنكم التواصل معنا عبر البريد الإلكتروني: contact@abbourysport.com أو عبر حساباتنا على مواقع التواصل الاجتماعي. فريقنا متاح للرد على استفساراتكم واقتراحاتكم على مدار الساعة.",
      contentFr: "Nous sommes ravis de vous entendre ! Vous pouvez nous contacter par email : contact@abbourysport.com ou via nos comptes sur les réseaux sociaux. Notre équipe est disponible pour répondre à vos questions et suggestions 24h/24.",
      contentEn: "We'd love to hear from you! You can reach us via email: contact@abbourysport.com or through our social media accounts. Our team is available around the clock to respond to your inquiries and suggestions.",
    },
  ];

  await db.insert(footerPages).values(footerPagesData);

  // Seed Site Settings
  const settingsData = [
    { key: "hero_title_ar", valueAr: "عالم الرياضة بين يديك", valueFr: "Le monde du sport à portée de main", valueEn: "The World of Sports at Your Fingertips", category: "home" },
    { key: "hero_subtitle_ar", valueAr: "تابع آخر الأخبار والنتائج والبطولات", valueFr: "Suivez les dernières nouvelles, résultats et championnats", valueEn: "Follow the latest news, results and championships", category: "home" },
    { key: "social_message_ar", valueAr: "زرنا على مواقع التواصل الاجتماعي", valueFr: "Visitez-nous sur les réseaux sociaux", valueEn: "Visit us on social media", category: "home" },
  ];

  await db.insert(siteSettings).values(settingsData);

  console.log("Seeding complete!");
}

seed().catch(console.error);
