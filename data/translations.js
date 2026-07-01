// ============================================================
// data/translations.js
// All UI strings for FR / EN.
// To add a language: add a new key object here. Nothing else.
// ============================================================

const TRANSLATIONS = {
  fr: {
    // nav
    nav_about:    "À propos",
    nav_skills:   "Compétences",
    nav_projects: "Projets",
    nav_contact:  "Contact",

    // hero
    hero_eyebrow:      "Étudiant en génie logiciel",
    hero_tagline:      "Je conçois des <strong>systèmes intelligents</strong> qui automatisent des tâches et prédisent des résultats, et je transforme des données brutes en <strong>information claire et exploitable</strong>.",
    hero_cta_projects: "Voir mes projets →",
    hero_cta_contact:  "Me contacter",

    // about
    about_eyebrow:      "Profil",
    about_title:        "À propos",
    about_p1:           "Étudiant en génie logiciel, je suis particulièrement attiré par l'<strong>intelligence artificielle</strong> : concevoir des modèles capables d'automatiser des tâches répétitives ou de prédire des résultats à partir de données réelles.",
    about_p2:           "Cet intérêt s'étend naturellement à l'<strong>analyse de données</strong> — nettoyer, structurer et mettre en forme l'information pour qu'elle devienne lisible et exploitable, autant pour une machine que pour une personne.",
    about_p3:           "Entre algorithmes et données, je cherche toujours la façon la plus claire de transformer la complexité en quelque chose d'utile.",
    about_stat1_label:  "Systèmes d'exploitation",
    about_stat2_label:  "Domaines d'intérêt",
    about_stat2_value:  "IA & Machine Learning · Analyse de données · Développement web",
    about_stat3_label:  "Basé à",

    // skills
    skills_eyebrow: "Boîte à outils",
    skills_title:   "Compétences",
    skills_sub:     "Langages, logiciels et fondations techniques que j'utilise pour construire, analyser et déboguer.",
    skills_block1:  "Langages",
    skills_block2:  "Logiciels & outils",
    skills_block3:  "Fondations techniques",
    found_1: "POO & polymorphisme",
    found_2: "Interfaces graphiques (GUI)",
    found_3: "Tests unitaires",
    found_4: "Débogage",
    found_5: "Patrons de conception",
    found_6: "Gestion des exceptions",
    found_7: "Tri & recherche",

    // projects
    projects_eyebrow: "Travaux récents",
    projects_title:   "Projets",
    projects_sub:     "Une sélection de projets académiques et collaboratifs. D'autres arrivent bientôt.",
    p1_role:  "Membre Frontend — Équipe de 6",
    p1_date:  "Mars 2026 — Avril 2026",
    p1_d1:    "Application web de gestion de finances personnelles via des enveloppes budgétaires et des objectifs d'épargne mensuels, avec possibilité de créer des objectifs communs entre utilisateurs.",
    p1_d2:    "Contribution à la visualisation graphique de la progression financière et à un système de notifications par courriel pour les rappels quotidiens.",
    p2_name:  "Drone piloté par reconnaissance de gestes",
    p2_role:  "Membre Software",
    p2_date:  "Février 2025 — Mai 2025",
    p2_d1:    "Conception et implémentation d'un système de contrôle de drone en temps réel basé sur la reconnaissance de gestes de la main, en utilisant la vision par ordinateur pour interpréter et traduire les mouvements en commandes.",
    p2_d2:    "Développement et optimisation d'un module de prédiction météorologique à partir de données historiques (plus de 1 000 ensembles de données), atteignant une précision de 85 %.",
    p2_d3:    "Conception et développement d'une interface graphique interactive (GUI) pour le contrôle en temps réel du système, assurant une expérience fluide et réactive.",
    p2_tag_data: "Analyse de données",

    // contact
    contact_eyebrow: "Disponible pour des opportunités",
    contact_title:   "Discutons de votre prochain projet.",
    contact_p:       "Que ce soit pour un stage, une collaboration ou simplement échanger sur l'IA et les données — n'hésitez pas à me contacter.",
    contact_email:   "Envoyer un courriel →",

    // footer
    footer_text: "© 2026 Mohamed-Amine Allet — Conçu et codé avec curiosité.",
  },

  en: {
    nav_about:    "About",
    nav_skills:   "Skills",
    nav_projects: "Projects",
    nav_contact:  "Contact",

    hero_eyebrow:      "Software Engineering Student",
    hero_tagline:      "I build <strong>intelligent systems</strong> that automate tasks and predict outcomes, and turn raw data into <strong>clear, usable information</strong>.",
    hero_cta_projects: "View my projects →",
    hero_cta_contact:  "Get in touch",

    about_eyebrow:      "Profile",
    about_title:        "About",
    about_p1:           "As a software engineering student, I'm especially drawn to <strong>artificial intelligence</strong> — designing models that can automate repetitive tasks or predict outcomes from real-world data.",
    about_p2:           "That interest naturally extends to <strong>data analysis</strong> — cleaning, structuring, and shaping information so it becomes readable and usable, for machines and people alike.",
    about_p3:           "Between algorithms and data, I'm always looking for the clearest way to turn complexity into something useful.",
    about_stat1_label:  "Operating systems",
    about_stat2_label:  "Areas of interest",
    about_stat2_value:  "AI & Machine Learning · Data Analysis · Web Development",
    about_stat3_label:  "Based in",

    skills_eyebrow: "Toolkit",
    skills_title:   "Skills",
    skills_sub:     "Languages, software, and technical foundations I use to build, analyze, and debug.",
    skills_block1:  "Languages",
    skills_block2:  "Software & tools",
    skills_block3:  "Technical foundations",
    found_1: "OOP & polymorphism",
    found_2: "Graphical interfaces (GUI)",
    found_3: "Unit testing",
    found_4: "Debugging",
    found_5: "Design patterns",
    found_6: "Exception handling",
    found_7: "Sorting & search algorithms",

    projects_eyebrow: "Recent work",
    projects_title:   "Projects",
    projects_sub:     "A selection of academic and collaborative projects. More are on the way.",
    p1_role: "Frontend Member — Team of 6",
    p1_date: "March 2026 — April 2026",
    p1_d1:   "Personal finance web app built around budget envelopes and monthly savings goals, with support for shared goals between users.",
    p1_d2:   "Contributed to graphical visualization of financial progress and an email notification system for daily reminders.",
    p2_name: "Gesture-Controlled Drone",
    p2_role: "Software Member",
    p2_date: "February 2025 — May 2025",
    p2_d1:   "Designed and implemented a real-time drone control system based on hand gesture recognition, using computer vision to interpret and translate movements into commands.",
    p2_d2:   "Developed and optimized a weather prediction module from historical data (1,000+ datasets), reaching 85% accuracy.",
    p2_d3:   "Designed and built an interactive graphical interface (GUI) for real-time system control, ensuring a smooth, responsive experience.",
    p2_tag_data: "Data Analysis",

    contact_eyebrow: "Open to opportunities",
    contact_title:   "Let's talk about your next project.",
    contact_p:       "Whether it's an internship, a collaboration, or just a chat about AI and data — feel free to reach out.",
    contact_email:   "Send an email →",

    footer_text: "© 2026 Mohamed-Amine Allet — Designed and built with curiosity.",
  },
};
